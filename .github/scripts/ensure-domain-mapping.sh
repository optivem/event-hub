#!/usr/bin/env bash
set -euo pipefail

# Maps a custom domain to a Cloud Run service (Cloud Run domain mapping: free, Google-managed TLS).
# Idempotent: a domain already mapped to SERVICE is left alone; one mapped to another service fails.
# A new project gets its mappings on the first deploy, because the deploy runs this script.
#
# Prerequisites (one-time, see README "Custom domains"):
#   - the parent domain is verified in Google Search Console, with the deployer service account
#     added as a verified owner
#   - a CNAME <subdomain> -> ghs.googlehosted.com. at the DNS provider
#
# Env: SERVICE, DOMAIN, REGION, PROJECT. Needs gcloud authenticated, with the beta component.

: "${SERVICE:?}" "${DOMAIN:?}" "${REGION:?}" "${PROJECT:?}"
gcloud_mapping() { gcloud beta run domain-mappings "$@" --region "$REGION" --project "$PROJECT"; }

route="$(gcloud_mapping describe --domain "$DOMAIN" --format='value(spec.routeName)' 2> /dev/null || true)"
if [[ -z "$route" ]]; then
  echo "Mapping ${DOMAIN} to ${SERVICE}..."
  gcloud_mapping create --service "$SERVICE" --domain "$DOMAIN"
elif [[ "$route" != "$SERVICE" ]]; then
  echo "::error::${DOMAIN} is mapped to ${route}, not ${SERVICE}. Delete that mapping first."
  exit 1
else
  echo "${DOMAIN} is already mapped to ${SERVICE}."
fi

# Not a failure while pending: the certificate takes ~15 minutes (up to 24h) after the CNAME exists
ready="$(gcloud_mapping describe --domain "$DOMAIN" --format=json \
  | jq -r '.status.conditions[]? | select(.type == "Ready") | .status')"
if [[ "$ready" == "True" ]]; then
  echo "✅ https://${DOMAIN} is ready."
else
  echo "::warning::${DOMAIN} is not ready yet (certificate pending, or the CNAME to ghs.googlehosted.com. is missing)."
  gcloud_mapping describe --domain "$DOMAIN" --format='yaml(status.conditions, status.resourceRecords)'
fi
