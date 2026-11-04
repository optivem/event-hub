#!/usr/bin/env bash
set -euo pipefail

# Measures cold and warm latency per hop of a Cloud Run stack: frontend /, Keycloak well-known,
# backend /health, and backend GET /api/orders (reads the database).
# The first request to each hop is cold only if the stack was idle for >= 15 minutes (Cloud Run
# scale to zero) and >= 5 minutes for Neon to suspend. Keycloak is shared by every stack, so any
# stage run or login in that window warms it.
#
# Usage: scripts/measure-latency.sh <stack> [warm-count]
#   stack: prod | qa | acceptance-stub | acceptance-real
# Env:
#   DOMAIN          custom domain (default techexcellence.io)
#   PROJECT_NUMBER  GCP project number, for the backend's run.app URL (default: the current project)
#   REGION          default us-central1
#   ACCESS_TOKEN    token for the DB hop. Without it, the test realm (shop) gets one by password
#                   grant for customer1; prod's realm has no password grant, so prod skips the hop.
#
# Columns are curl -w timings in seconds: connect (TCP), tls (TCP + TLS), ttfb, total.
# On a warm request, ttfb - tls is roughly one network round trip plus the app's own time.

stack="${1:?usage: $0 <prod|qa|acceptance-stub|acceptance-real> [warm-count]}"
warm="${2:-3}"
domain="${DOMAIN:-techexcellence.io}"
project_number="${PROJECT_NUMBER:-412402326524}"
region="${REGION:-us-central1}"

case "$stack" in
  prod) host=events realm=shop-prod ;;
  qa) host=events-qa realm=shop ;;
  acceptance-stub) host=events-acc realm=shop ;;
  acceptance-real) host=events-e2e realm=shop ;;
  *) echo "Unknown stack: $stack" >&2; exit 1 ;;
esac
frontend="https://${host}.${domain}"
keycloak="https://auth.${domain}"
backend="https://event-hub-${stack}-backend-${project_number}.${region}.run.app"

fmt='%{http_code} %{time_connect} %{time_appconnect} %{time_starttransfer} %{time_total}'

measure() { # label url [curl args...]
  local label="$1" url="$2"; shift 2
  local i kind
  for ((i = 0; i <= warm; i++)); do
    kind=warm; [[ $i == 0 ]] && kind=cold
    { curl -s -o /dev/null --max-time 120 -w "$fmt" "$@" "$url" || true; } \
      | awk -v l="$label" -v k="$kind" '{printf "%-10s %-5s %4s %8s %8s %8s %8s\n", l, k, $1, $2, $3, $4, $5}'
  done
}

echo "Stack ${stack} at $(date -u +%FT%TZ)"
printf '%-10s %-5s %4s %8s %8s %8s %8s\n' hop kind http connect tls ttfb total
measure frontend "${frontend}/"
measure keycloak "${keycloak}/realms/${realm}/.well-known/openid-configuration"
measure health "${backend}/health"

token="${ACCESS_TOKEN:-}"
if [[ -z "$token" && "$realm" == shop ]]; then
  token="$(curl -s --max-time 120 "${keycloak}/realms/shop/protocol/openid-connect/token" \
    -d grant_type=password -d client_id=shop-system-test \
    -d username=customer1 -d password=customer1-test-password | jq -r .access_token)"
fi
if [[ -n "$token" && "$token" != null ]]; then
  measure db "${backend}/api/orders" -H "Authorization: Bearer ${token}"
else
  echo "db: skipped (no ACCESS_TOKEN)"
fi
