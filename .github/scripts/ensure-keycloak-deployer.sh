#!/usr/bin/env bash
set -euo pipefail

# Makes sure the deploy pipeline's own Keycloak client exists: <SYSTEM>-deployer in the master
# realm, confidential, service account only (client-credentials grant), its secret the value of
# the <SYSTEM>-keycloak-deployer-secret secret. set-keycloak-client-urls.sh (and the later admin
# API steps of the deploy) sign in with it, so Keycloak needs no admin user.
#
# Roles: for each per-stage realm R (<SYSTEM>-acceptance, -qa, -prod), these roles of the master
# realm's R-realm client, and nothing in master itself:
#   view-clients, manage-clients                       the frontend client's URLs
#   view-identity-providers, manage-identity-providers the google identity provider (qa, prod)
#   view-realm, manage-realm                           the first-broker-login flow for it
# Not granted: users (view/manage/query-users, impersonation), events, other realms, create-realm,
# and master's admin role. manage-realm is the narrowest role that covers authentication flows.
#
# Who creates it, tried in this order, so a fresh database and the existing one both work:
#   1. The temporary bootstrap client (<BOOTSTRAP_CLIENT_ID>, secret <SYSTEM>-keycloak-bootstrap-secret),
#      which Keycloak creates when it creates the master realm (KC_BOOTSTRAP_ADMIN_CLIENT_*, set by
#      deploy-keycloak-cloud). It is deleted at the end, so it exists only until the first deploy.
#   2. Nothing, when the deploy client already signs in with every role above (the usual run).
#   3. The bootstrap admin user "admin" (secret <SYSTEM>-keycloak-admin-password), for a database
#      created before the bootstrap client, whose master realm already existed. Once the deploy
#      client exists, the admin user can be deleted; this step then finds no one and isn't needed.
# Idempotent: rerunning only re-applies what is missing.
#
# Env: KEYCLOAK_URL, SYSTEM, STAGE, PROJECT, BOOTSTRAP_CLIENT_ID.
# Needs gcloud authenticated, with access to the secrets above.

: "${KEYCLOAK_URL:?}" "${SYSTEM:?}" "${STAGE:?}" "${PROJECT:?}" "${BOOTSTRAP_CLIENT_ID:?}"

deployer="${SYSTEM}-deployer"
realms=("${SYSTEM}-acceptance" "${SYSTEM}-qa" "${SYSTEM}-prod")
roles=(view-clients manage-clients view-identity-providers manage-identity-providers view-realm manage-realm)
token_url="${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
admin_url="${KEYCLOAK_URL}/admin/realms/master"

# Hides a value from the log (workflow commands are read from stdout, so call it outside $(...))
mask() { [[ -z "$1" ]] || echo "::add-mask::$1"; }

# A secret's value, or nothing when it doesn't exist or has no version
secret() { gcloud secrets versions access latest --secret="$1" --project "$PROJECT" 2> /dev/null || true; }

# An access token, or nothing when the credentials don't work
token() { curl -sS "$token_url" "$@" | jq -r '.access_token // empty' || true; }
client_token() {
  [[ -n "$2" ]] || return 0
  token --data-urlencode grant_type=client_credentials --data-urlencode "client_id=$1" --data-urlencode "client_secret=$2"
}

# Whether the token carries every role above for the given realms
has_roles() {
  local token="$1"; shift
  [[ -n "$token" ]] || return 1
  jq -e -R --arg roles "${roles[*]}" '
    split(".")[1] | gsub("-"; "+") | gsub("_"; "/") | . + ("=" * ((4 - length % 4) % 4)) | @base64d | fromjson
    | .resource_access as $access
    | all($ARGS.positional[]; ($roles | split(" ")) - ($access[. + "-realm"].roles // []) == [])
  ' --args "$@" <<< "$token" > /dev/null 2>&1
}

api() { curl -fsS -H "Authorization: Bearer ${admin}" -H 'Content-Type: application/json' "$@"; }
client_uuid() { api "${admin_url}/clients?clientId=$1" | jq -r '.[0].id // empty'; }

ensure_deployer() {
  local id user cid realm wanted rep
  rep="$(jq -n --arg id "$deployer" --arg secret "$deployer_secret" '{
    clientId: $id, name: "Deploy pipeline", enabled: true, protocol: "openid-connect",
    description: "Service account of the deploy pipeline (.github/scripts/ensure-keycloak-deployer.sh)",
    publicClient: false, clientAuthenticatorType: "client-secret", secret: $secret,
    serviceAccountsEnabled: true, standardFlowEnabled: false, implicitFlowEnabled: false,
    directAccessGrantsEnabled: false}')"
  id="$(client_uuid "$deployer")"
  if [[ -z "$id" ]]; then
    api -X POST "${admin_url}/clients" -d "$rep"
    id="$(client_uuid "$deployer")"
    echo "Created the ${deployer} client."
  else
    api -X PUT "${admin_url}/clients/${id}" -d "$(api "${admin_url}/clients/${id}" | jq --argjson rep "$rep" '. + $rep')"
    echo "Updated the ${deployer} client."
  fi
  user="$(api "${admin_url}/clients/${id}/service-account-user" | jq -r .id)"
  for realm in "${realms[@]}"; do
    cid="$(client_uuid "${realm}-realm")"
    if [[ -z "$cid" ]]; then
      echo "::warning::Realm ${realm} doesn't exist yet: ${deployer} gets no roles in it."
      continue
    fi
    wanted="$(api "${admin_url}/clients/${cid}/roles" | jq -c --args '[.[] | select(.name | IN($ARGS.positional[]))]' "${roles[@]}")"
    api -X POST "${admin_url}/users/${user}/role-mappings/clients/${cid}" -d "$wanted"
    echo "${deployer}: roles in ${realm} granted."
  done
}

deployer_secret="$(secret "${SYSTEM}-keycloak-deployer-secret")"; mask "$deployer_secret"
if [[ -z "$deployer_secret" ]]; then
  echo "::error::Secret ${SYSTEM}-keycloak-deployer-secret has no value. Run ./setup-gcp.sh."
  exit 1
fi

bootstrap_secret="$(secret "${SYSTEM}-keycloak-bootstrap-secret")"; mask "$bootstrap_secret"
admin="$(client_token "$BOOTSTRAP_CLIENT_ID" "$bootstrap_secret")"; mask "$admin"
if [[ -n "$admin" ]]; then
  echo "Signed in with the temporary bootstrap client ${BOOTSTRAP_CLIENT_ID}."
elif has_roles "$(client_token "$deployer" "$deployer_secret")" "${realms[@]}"; then
  echo "${deployer} is set up."
  exit 0
else
  password="$(secret "${SYSTEM}-keycloak-admin-password")"; mask "$password"
  if [[ -n "$password" ]]; then
    admin="$(token --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
      --data-urlencode username=admin --data-urlencode "password=${password}")"
    mask "$admin"
  fi
  [[ -z "$admin" ]] || echo "Signed in as the bootstrap admin user, to set up ${deployer}."
fi

if [[ -n "$admin" ]]; then
  ensure_deployer
  # Last, because it may be the client that signed in
  bootstrap_id="$(client_uuid "$BOOTSTRAP_CLIENT_ID")"
  if [[ -n "$bootstrap_id" ]]; then
    api -X DELETE "${admin_url}/clients/${bootstrap_id}"
    echo "Deleted the temporary bootstrap client ${BOOTSTRAP_CLIENT_ID}."
  fi
fi

if ! has_roles "$(client_token "$deployer" "$deployer_secret")" "${SYSTEM}-${STAGE}"; then
  echo "::error::${deployer} can't sign in, or lacks its roles in ${SYSTEM}-${STAGE}, and neither the bootstrap client nor the admin user can fix it. Set the client's secret and roles by hand in the Keycloak console (see the header of $0)."
  exit 1
fi
echo "${deployer} is ready for ${SYSTEM}-${STAGE}."
