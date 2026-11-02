# 2026-11-02 19:54:15 UTC — Custom domains for the Cloud Run stages

## TL;DR

**Why:** The deployed stages are reachable only at generated `*.run.app` URLs (e.g. `event-hub-prod-frontend-992033658880.us-central1.run.app`). Those are hard to share with meetup members and change if the GCP project is recreated.
**End result:** Prod, QA and acceptance are served at `portal.techexcellence.com`, `portal-qa.techexcellence.com` and `portal-acc.techexcellence.com`. They use Cloud Run domain mapping, which is free and in preview, with Google-managed TLS. Login works on every domain, and `./setup-gcp.sh` recreates the mappings.

## Outcomes

What we get out of this — the goals and deliverables:

- `https://portal.techexcellence.com` serves the prod frontend with a valid Google-managed certificate
- `https://portal-qa.techexcellence.com` serves QA, and `https://portal-acc.techexcellence.com` serves acceptance
- Keycloak login and logout work on each custom domain: redirect URIs and web origins accept it
- System tests in each stage run against the custom domain, not the `run.app` URL
- Idle cost stays ~$0: no load balancer; only the domain registration (~$10–15/year) and DNS are paid
- `./setup-gcp.sh` creates the domain mappings, and `./teardown-gcp.sh` removes them. The DNS records are documented and stay valid across a project rebuild, because they are CNAMEs to `ghs.googlehosted.com`
- If preview latency ever becomes a problem, there is a documented way to move to Firebase Hosting or a load balancer

## ▶ Next executable step (resume here)

User step: Step 1. Verify `techexcellence.com` in Google Search Console: add the TXT record it gives at the DNS provider. Then add the GitHub Actions deployer service account and the `setup-gcp.sh` user as verified owners. Agent work starts at Step 2 once the open questions are settled.

## Steps

- [ ] Step 1 (user): Verify `techexcellence.com` in Google Search Console (TXT record at the DNS provider). Add as verified owners the service account that creates the mappings and any other account that runs `setup-gcp.sh`
- [ ] Step 2: Inventory every place that holds a `run.app` URL: stage workflows, `setup-gcp.sh`, the Keycloak realm JSON and image, frontend and backend env and config, and system-test base URLs. Decide per URL whether it switches to the custom domain
- [ ] Step 3: Add the domain mappings to `setup-gcp.sh` (`gcloud beta run domain-mappings create --service … --domain … --region us-central1`), make them idempotent, and remove them in `teardown-gcp.sh`. Print the DNS records that need to be added
- [ ] Step 4 (user): Add the CNAME records (`portal`, `portal-qa`, `portal-acc`, plus any API or auth subdomains → `ghs.googlehosted.com.`) at the DNS provider. Wait for certificates to provision (usually about 15 minutes, up to 24 hours) and confirm with `gcloud beta run domain-mappings describe`
- [ ] Step 5: Update the Keycloak clients (prod `shop-prod` realm and the QA and acceptance realms): add the custom domains to redirect URIs, web origins and post-logout redirect URIs. Keep the `run.app` entries until the switch is proven
- [ ] Step 6: Point the frontend and backend config (public base URL, Keycloak URL, CORS origins) and the system-test base URLs at the custom domains through stage variables
- [ ] Step 7: Run acceptance → QA → prod and confirm that the suites pass and a real login works on `portal.techexcellence.com`
- [ ] Step 8: Remove the `run.app` entries from the Keycloak clients and config (optional; keep them if they help debugging). Document the domain setup and the Firebase Hosting / load balancer fallback in the README or the deploy docs

## Open questions

- **Domain spelling:** the message wrote both `techexellence.com` and `techexcellence.com`. The plan assumes `techexcellence.com`. Is that right, and is it already registered? Where is its DNS hosted?
- **Acceptance has two stacks (real and stub).** Which one does `portal-acc` point at? It is probably fine to leave acceptance on `run.app` entirely, since it is ephemeral and test-only.
- **Backend and Keycloak:** does the frontend call the backend and Keycloak directly in the browser, which means they need their own public subdomains? Or does the frontend proxy them? If they need subdomains, possible names are `portal-api.` and `auth.techexcellence.com`: one shared Keycloak, so one auth domain for all stages.
- **Keycloak image bakes in the project number:** the custom auth domain could remove that coupling, so Step 10 of the Cloud Run plan no longer needs a rebuild. Should we fold that in?
- **Ordering with the Cloud Run plan:** do this after its Step 8 (prod user) and Step 10 (teardown/setup proof), or before Step 10 so that the proof also covers the mappings?
