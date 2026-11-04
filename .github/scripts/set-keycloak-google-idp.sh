#!/usr/bin/env bash
set -euo pipefail

# "Sign in with Google" for the qa and prod realms (<SYSTEM>-qa, <SYSTEM>-prod) of the shared
# Keycloak, through the admin API. Acceptance gets none: its tests sign in with passwords.
#
# Sets up, in the stage's realm:
#   - The authentication flow "<FLOW>", used as the IdP's first-broker-login flow. It only links a
#     Google account to an existing (invited) user and never creates one:
#       Detect existing broker user (idp-detect-existing-broker-user)  REQUIRED
#       Automatically set existing user (idp-auto-link)                REQUIRED
#     A Google account whose email matches no user ends on Keycloak's error page ("federated
#     identity unavailable"), and no user is created: there is no idp-create-user-if-unique step.
#   - The identity provider "google" (Keycloak's Google provider), client ID and secret from
#     Secret Manager (<SYSTEM>-google-oauth-client-id / -secret, copied there by ./setup-gcp.sh
#     from the OAuth client's own project). trustEmail is on, so the linked user's email counts
#     as verified. Sync mode IMPORT: later logins don't touch the user (the invited user's name,
#     email and roles stay as the admin set them; the IdP has no mappers anyway).
#     Essential claim email_verified=true: Keycloak itself ignores the email_verified claim, so
#     without this filter an unverified Google email that matches a user would be linked. With
#     it, a token whose email_verified isn't true is rejected before the flow above runs.
# The deploy owns both: they are rewritten on every run, so edits in the console don't survive.
# Idempotent. Skips with a warning when the stage project has no OAuth client secrets (Google
# login then simply isn't offered).
#
# Env: KEYCLOAK_URL, SYSTEM, STAGE, PROJECT.
# Signs in as the deploy client <SYSTEM>-deployer (client-credentials grant), which
# ensure-keycloak-deployer.sh sets up first with manage-identity-providers and manage-realm in
# the realm. Needs gcloud authenticated, with access to the secrets above.

: "${KEYCLOAK_URL:?}" "${SYSTEM:?}" "${STAGE:?}" "${PROJECT:?}"
realm="${SYSTEM}-${STAGE}"
alias=google
flow="first broker login - link existing user only"
steps=(idp-detect-existing-broker-user idp-auto-link)

case "$STAGE" in
  qa|prod) ;;
  *) echo "${realm}: no Google login on the ${STAGE} stage."; exit 0 ;;
esac

secret() { gcloud secrets versions access latest --secret="$1" --project "$PROJECT" 2> /dev/null || true; }
google_id="$(secret "${SYSTEM}-google-oauth-client-id")"
google_secret="$(secret "${SYSTEM}-google-oauth-client-secret")"
[[ -z "$google_secret" ]] || echo "::add-mask::${google_secret}"
if [[ -z "$google_id" || -z "$google_secret" ]]; then
  echo "::warning::${SYSTEM}-google-oauth-client-id/-secret have no value in ${PROJECT}: ${realm} gets no Google login. Create the OAuth client's secrets in its project and re-run ./setup-gcp.sh (plans/20261103-1951-keycloak-realms-clients-google-login.md, Step 5)."
  exit 0
fi

deployer_secret="$(gcloud secrets versions access latest --secret="${SYSTEM}-keycloak-deployer-secret" --project "$PROJECT")"
echo "::add-mask::${deployer_secret}"
token="$(curl -fsS "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=client_credentials --data-urlencode "client_id=${SYSTEM}-deployer" \
  --data-urlencode "client_secret=${deployer_secret}" | jq -r .access_token)"
echo "::add-mask::${token}"
api() { curl -fsS -H "Authorization: Bearer ${token}" -H 'Content-Type: application/json' "$@"; }
admin="${KEYCLOAK_URL}/admin/realms/${realm}"
flow_path="${admin}/authentication/flows/$(jq -rn --arg f "$flow" '$f | @uri')"

# The flow, with exactly the steps above, in order, each REQUIRED
ensure_flow() {
  local executions id step
  if ! api "${admin}/authentication/flows" | jq -e --arg f "$flow" 'any(.[]; .alias == $f)' > /dev/null; then
    api -X POST "${admin}/authentication/flows" -d "$(jq -n --arg f "$flow" '{alias: $f, providerId: "basic-flow",
      topLevel: true, builtIn: false,
      description: "Google login: links to an existing user only, never creates one (.github/scripts/set-keycloak-google-idp.sh)"}')"
    echo "${realm}: created the flow '${flow}'."
  fi
  executions="$(api "${flow_path}/executions")"
  if jq -e --args '[.[] | {providerId, requirement, level}] == [$ARGS.positional[] | {providerId: ., requirement: "REQUIRED", level: 0}]' \
      "${steps[@]}" <<< "$executions" > /dev/null; then
    echo "${realm}: the flow '${flow}' is up to date."
    return
  fi
  for id in $(jq -r '.[] | select(.level == 0) | .id' <<< "$executions"); do
    api -X DELETE "${admin}/authentication/executions/${id}"
  done
  for step in "${steps[@]}"; do
    api -X POST "${flow_path}/executions/execution" -d "$(jq -n --arg p "$step" '{provider: $p}')"
  done
  # New executions start DISABLED (or as the authenticator's default)
  api "${flow_path}/executions" | jq -c '.[] | .requirement = "REQUIRED"' | while read -r execution; do
    api -X PUT "${flow_path}/executions" -d "$execution"
  done
  echo "${realm}: the flow '${flow}' set to: ${steps[*]} (all REQUIRED)."
}

ensure_idp() {
  local rep current
  rep="$(jq -n --arg alias "$alias" --arg flow "$flow" --arg id "$google_id" --arg secret "$google_secret" '{
    alias: $alias, providerId: "google", displayName: "Google", enabled: true,
    trustEmail: true, storeToken: false, addReadTokenRoleOnCreate: false, linkOnly: false,
    firstBrokerLoginFlowAlias: $flow, postBrokerLoginFlowAlias: null,
    config: {clientId: $id, clientSecret: $secret, defaultScope: "openid email profile",
      syncMode: "IMPORT", filteredByClaim: "true", claimFilterName: "email_verified", claimFilterValue: "true"}}')"
  current="$(api "${admin}/identity-provider/instances/${alias}" 2> /dev/null || true)"
  if [[ -z "$current" ]]; then
    api -X POST "${admin}/identity-provider/instances" -d "$rep"
    echo "${realm}: created the ${alias} identity provider."
  else
    # Merged into what Keycloak returns, so settings the deploy doesn't own keep their defaults
    api -X PUT "${admin}/identity-provider/instances/${alias}" \
      -d "$(jq --argjson rep "$rep" '. * $rep' <<< "$current")"
    echo "${realm}: updated the ${alias} identity provider."
  fi
}

ensure_flow
ensure_idp
echo "${realm}: Sign in with Google is set up (client ${google_id})."
