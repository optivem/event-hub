# Turns shop-realm.json into the production realm (see Dockerfile.cloud): only the SPA client, only
# the prod URL, no test users, and none of the test realm's weak settings. prod-realm-check.jq
# enforces this.
# Inputs: --arg system <system>, --arg suffix <project-number>.<region>.run.app
# The service name must match the deploy workflow: <system>-prod-frontend.
"https://\($system)-prod-frontend-\($suffix)" as $url
| del(.users, .passwordPolicy)
| .realm = "shop-prod"
| .sslRequired = "external"
| .clients |= map(
    select(.clientId == "shop-frontend")
    | .redirectUris = ["\($url)/*"]
    | .webOrigins = [$url]
    | .attributes["post.logout.redirect.uris"] = "\($url)/*")
