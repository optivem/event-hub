# Adds every stack's Cloud Run frontend URL to the realm (see Dockerfile.cloud).
# Inputs: --arg system <system>, --arg suffix <project-number>.<region>.run.app
# Service names must match the deploy workflow: <system>-<stack>-frontend.
include "redirects";

[("acceptance-real", "acceptance-stub", "qa", "prod") | "https://\($system)-\(.)-frontend-\($suffix)"] as $urls
| .clients |= map(
    if .clientId == "shop-frontend" then add_redirects($urls) | .webOrigins = $urls + .webOrigins
    else . end)
