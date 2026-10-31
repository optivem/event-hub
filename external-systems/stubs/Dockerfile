# Cloud Run stubs image: bakes the mappings in, because Cloud Run has no volume mount for them.
# Build context: external-systems/stubs. Local compose keeps mounting this directory instead.
FROM wiremock/wiremock:3.10.0
COPY . /home/wiremock
EXPOSE 8080
CMD ["--verbose", "--global-response-templating"]
