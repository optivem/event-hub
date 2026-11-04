# Turns the filled-in realm (realm.jq with stage prod) into the production realm (see
# Dockerfile.cloud): only the SPA client, no test users, and none of the test realm's weak
# settings. prod-realm-check.jq enforces this.
# The client starts with no URLs: the deploy sets them through the admin API
# (.github/scripts/set-keycloak-client-urls.sh), so the image doesn't depend on the GCP project.
#   jq --arg system <SYSTEM_NAME> -f prod-realm.jq
del(.users, .passwordPolicy)
| .realm = ($system + "-prod")
| .sslRequired = "external"
| .clients |= map(
    select(.clientId == ($system + "-frontend"))
    | .redirectUris = []
    | .webOrigins = []
    | .attributes["post.logout.redirect.uris"] = "")
