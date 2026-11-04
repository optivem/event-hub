# Fills in realm-template.json's placeholders for one stage (see Dockerfile.cloud):
#   jq --arg system <SYSTEM_NAME> --arg stage <acceptance|qa|prod> -f realm.jq realm-template.json
# Local compose imports the template as is: Keycloak resolves the same ${SYSTEM_NAME} and ${STAGE}
# placeholders from the container's environment.
walk(if type == "string" then gsub("\\$\\{SYSTEM_NAME\\}"; $system) | gsub("\\$\\{STAGE\\}"; $stage) else . end)
