#!/usr/bin/env bash
set -euo pipefail

# Sets the shop-frontend client's redirect URIs, web origins and post-logout redirect URIs in both
# realms of the shared Keycloak, through the admin API. The image bakes no URLs in (see
# docker/keycloak/Dockerfile.cloud), so the deploy sets them here, computed from the GCP project:
#   shop       the acceptance-real, acceptance-stub and qa frontends, plus https://events-qa.,
#              https://events-acc. and https://events-e2e.<CUSTOM_DOMAIN>
#   shop-prod  the prod frontend, plus https://events.<CUSTOM_DOMAIN>
# The deploy owns every https:// entry: they are replaced, so URLs of an old project don't pile up.
# Other entries (the http://localhost ones of local development) are kept. Idempotent: an
# unchanged client isn't written. Without CUSTOM_DOMAIN only the run.app URLs are set.
#
# Env: KEYCLOAK_URL, SYSTEM, PROJECT, PROJECT_NUMBER, REGION, CUSTOM_DOMAIN (optional).
# Needs gcloud authenticated, with access to the <SYSTEM>-keycloak-admin-password secret.

: "${KEYCLOAK_URL:?}" "${SYSTEM:?}" "${PROJECT:?}" "${PROJECT_NUMBER:?}" "${REGION:?}"
CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-}"

frontend() { echo "https://${SYSTEM}-$1-frontend-${PROJECT_NUMBER}.${REGION}.run.app"; }

password="$(gcloud secrets versions access latest --secret="${SYSTEM}-keycloak-admin-password" --project "$PROJECT")"
echo "::add-mask::${password}"
token="$(curl -fsS "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
  --data-urlencode username=admin --data-urlencode "password=${password}" | jq -r .access_token)"
echo "::add-mask::${token}"
api() { curl -fsS -H "Authorization: Bearer ${token}" -H 'Content-Type: application/json' "$@"; }

set_urls() {
  local realm="$1"; shift
  local urls client id updated
  urls="$(printf '%s\n' "$@" | jq -R . | jq -sc .)"
  client="$(api "${KEYCLOAK_URL}/admin/realms/${realm}/clients?clientId=shop-frontend" | jq -e '.[0]')"
  id="$(jq -r .id <<< "$client")"
  updated="$(jq --argjson urls "$urls" '
    def local_only: map(select(startswith("https://") | not));
    ($urls | map(. + "/*")) as $patterns
    | .redirectUris = $patterns + (.redirectUris // [] | local_only)
    | .webOrigins = $urls + (.webOrigins // [] | local_only)
    | .attributes["post.logout.redirect.uris"] =
        ($patterns + (.attributes["post.logout.redirect.uris"] // "" | split("##") | map(select(. != "")) | local_only)
         | join("##"))' <<< "$client")"
  if [[ "$(jq -S . <<< "$client")" == "$(jq -S . <<< "$updated")" ]]; then
    echo "${realm}: shop-frontend is up to date."
  else
    api -X PUT "${KEYCLOAK_URL}/admin/realms/${realm}/clients/${id}" -d "$updated"
    echo "${realm}: shop-frontend updated."
  fi
  jq -r '"  " + (.webOrigins | join("\n  "))' <<< "$updated"
}

shop=("$(frontend acceptance-real)" "$(frontend acceptance-stub)" "$(frontend qa)")
prod=("$(frontend prod)")
if [[ -n "$CUSTOM_DOMAIN" ]]; then
  shop+=("https://events-qa.${CUSTOM_DOMAIN}" "https://events-acc.${CUSTOM_DOMAIN}" "https://events-e2e.${CUSTOM_DOMAIN}")
  prod+=("https://events.${CUSTOM_DOMAIN}")
fi
set_urls shop "${shop[@]}"
set_urls shop-prod "${prod[@]}"
