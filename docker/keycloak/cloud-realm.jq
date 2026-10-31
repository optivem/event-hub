# Adds the Cloud Run frontend URL of every stack that logs in to this realm (see Dockerfile.cloud).
# Not prod: it has its own realm (prod-realm.jq).
# Inputs: --arg system <system>, --arg suffix <project-number>.<region>.run.app
# Service names must match the deploy workflow: <system>-<stack>-frontend.
include "redirects";

[("acceptance-real", "acceptance-stub", "qa") | "https://\($system)-\(.)-frontend-\($suffix)"] as $urls
| .clients |= map(
    if .clientId == "shop-frontend" then add_redirects($urls) | .webOrigins = $urls + .webOrigins
    else . end)
