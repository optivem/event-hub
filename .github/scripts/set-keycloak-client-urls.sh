#!/usr/bin/env bash
set -euo pipefail

# Sets the <SYSTEM>-frontend client's redirect URIs, web origins and post-logout redirect URIs in
# the realm of one stage (<SYSTEM>-<STAGE>) of the shared Keycloak, through the admin API. Other
# stages' realms are not touched. The image bakes no URLs in (see docker/keycloak/Dockerfile.cloud),
# so the deploy sets them here, computed from the GCP project:
#   acceptance  the acceptance-real and acceptance-stub frontends, plus https://events-acc. and
#               https://events-e2e.<CUSTOM_DOMAIN>
#   qa          the qa frontend, plus https://events-qa.<CUSTOM_DOMAIN>
#   prod        the prod frontend, plus https://events.<CUSTOM_DOMAIN>
# The deploy owns every https:// entry: they are replaced, so URLs of an old project don't pile up.
# Other entries (the http://localhost ones of local development) are kept. Idempotent: an
# unchanged client isn't written. Without CUSTOM_DOMAIN only the run.app URLs are set.
# The run.app URLs are kept on purpose, even with CUSTOM_DOMAIN: forks need them, and they help debugging.
#
# Env: KEYCLOAK_URL, SYSTEM, STAGE, PROJECT, PROJECT_NUMBER, REGION, CUSTOM_DOMAIN (optional).
# Needs gcloud authenticated, with access to the <SYSTEM>-keycloak-admin-password secret.

: "${KEYCLOAK_URL:?}" "${SYSTEM:?}" "${STAGE:?}" "${PROJECT:?}" "${PROJECT_NUMBER:?}" "${REGION:?}"
CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-}"
realm="${SYSTEM}-${STAGE}"
client_id="${SYSTEM}-frontend"

frontend() { echo "https://${SYSTEM}-$1-frontend-${PROJECT_NUMBER}.${REGION}.run.app"; }

password="$(gcloud secrets versions access latest --secret="${SYSTEM}-keycloak-admin-password" --project "$PROJECT")"
echo "::add-mask::${password}"
token="$(curl -fsS "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  --data-urlencode grant_type=password --data-urlencode client_id=admin-cli \
  --data-urlencode username=admin --data-urlencode "password=${password}" | jq -r .access_token)"
echo "::add-mask::${token}"
api() { curl -fsS -H "Authorization: Bearer ${token}" -H 'Content-Type: application/json' "$@"; }

set_urls() {
  local urls client id updated normalize
  urls="$(printf '%s\n' "$@" | jq -R . | jq -sc .)"
  client="$(api "${KEYCLOAK_URL}/admin/realms/${realm}/clients?clientId=${client_id}" | jq -e '.[0]')"
  id="$(jq -r .id <<< "$client")"
  updated="$(jq --argjson urls "$urls" '
    def local_only: map(select(startswith("https://") | not));
    ($urls | map(. + "/*")) as $patterns
    | .redirectUris = $patterns + (.redirectUris // [] | local_only)
    | .webOrigins = $urls + (.webOrigins // [] | local_only)
    | .attributes["post.logout.redirect.uris"] =
        ($patterns + (.attributes["post.logout.redirect.uris"] // "" | split("##") | map(select(. != "")) | local_only)
         | join("##"))' <<< "$client")"
  # Keycloak returns redirectUris and webOrigins as sets, in any order
  normalize='.redirectUris |= sort | .webOrigins |= sort'
  if [[ "$(jq -S "$normalize" <<< "$client")" == "$(jq -S "$normalize" <<< "$updated")" ]]; then
    echo "${realm}: ${client_id} is up to date."
  else
    api -X PUT "${KEYCLOAK_URL}/admin/realms/${realm}/clients/${id}" -d "$updated"
    echo "${realm}: ${client_id} updated."
  fi
  jq -r '"  " + (.webOrigins | join("\n  "))' <<< "$updated"
}

case "$STAGE" in
  acceptance) urls=("$(frontend acceptance-real)" "$(frontend acceptance-stub)"); hosts=(events-acc events-e2e) ;;
  qa) urls=("$(frontend qa)"); hosts=(events-qa) ;;
  prod) urls=("$(frontend prod)"); hosts=(events) ;;
  *) echo "::error::Unknown stage '${STAGE}'."; exit 1 ;;
esac
if [[ -n "$CUSTOM_DOMAIN" ]]; then
  for host in "${hosts[@]}"; do urls+=("https://${host}.${CUSTOM_DOMAIN}"); done
fi
set_urls "${urls[@]}"
