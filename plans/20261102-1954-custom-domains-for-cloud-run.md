# 2026-11-02 19:54:15 UTC — Custom domains for the Cloud Run stages

## TL;DR

**Why:** The deployed stages are reachable only at generated `*.run.app` URLs (e.g. `event-hub-prod-frontend-992033658880.us-central1.run.app`). Those are hard to share with meetup members and change if the GCP project is recreated. `events.techexcellence.io` is the Tech Excellence community's own Event Hub instance and the public example of the product. It sits next to the main site `techexcellence.io`, which keeps its content and links to the instance for events.
**End result:** Prod and QA are served at `events.techexcellence.io` and `events-qa.techexcellence.io`, and Keycloak at `auth.techexcellence.io`; acceptance stays on `run.app`. They use Cloud Run domain mapping, which is free and in preview, with Google-managed TLS. Login works on every domain, and `./setup-gcp.sh` recreates the mappings.

## Outcomes

What we get out of this — the goals and deliverables:

- `https://events.techexcellence.io` serves the prod frontend with a valid Google-managed certificate
- `https://events-qa.techexcellence.io` serves QA, and `https://auth.techexcellence.io` serves the shared Keycloak. Acceptance stays on `run.app`
- Keycloak login and logout work on each custom domain: redirect URIs and web origins accept it
- System tests in each stage run against the custom domain, not the `run.app` URL
- Idle cost stays ~$0: no load balancer; only the domain registration (~$10–15/year) and DNS are paid
- The deploy creates the domain mappings (idempotent), and deleting the project removes them. `./setup-gcp.sh` prints the one-time DNS and owner steps. The DNS records stay valid across a project rebuild, because they are CNAMEs to `ghs.googlehosted.com`
- If preview latency ever becomes a problem, there is a documented way to move to Firebase Hosting or a load balancer

## ▶ Next executable step (resume here)

All user steps are done (2026-11-03). The deploy maps `events.`, `events-qa.` and `auth.techexcellence.io` (`.github/scripts/ensure-domain-mapping.sh`, called from `.github/workflows/_deploy-cloud-run.yml`), and all three serve HTTPS with Google-managed certificates (prod `v1.0.228`). The main site (`techexcellence.io`, `www`) is never mapped.

Step 5 is done (2026-11-03): the Keycloak image bakes in no frontend URLs, and the deploy sets the `shop-frontend` client's URLs in both realms through the admin API (`.github/scripts/set-keycloak-client-urls.sh`, run by `.github/actions/deploy-keycloak-cloud`): the `run.app` URLs computed at deploy time plus `events-qa.` (realm `shop`) and `events.` (realm `shop-prod`).

Step 6 is done (2026-11-03, `c976257`, acceptance run 41652268692 green): when `CUSTOM_DOMAIN` is set, Keycloak runs at `auth.` for every stack (issuer `https://auth.techexcellence.io/realms/shop`), prod's frontend URL is `events.` and QA's is `events-qa.`; acceptance stays on `run.app`. The deploy waits on `run.app` first, then up to 30 min for each custom domain's certificate.

Next is Step 7, run as unit **U4** of `plans/20261102-2107-meta-cloud-run-coordination.md` together with Step 10 of the Cloud Run plan: teardown → setup → re-add the deployer as Search Console owner → acceptance → QA → prod → real login on `events.techexcellence.io`.

## Steps

- [ ] Step 7: Run acceptance → QA → prod and confirm that the suites pass and a real login works on `events.techexcellence.io`
- [ ] Step 8: Remove the `run.app` entries from the Keycloak clients and config (optional; keep them if they help debugging). Document the domain setup and the Firebase Hosting / load balancer fallback in the README or the deploy docs

## Decisions

- **Subdomain, not the whole site:** the app runs on a subdomain of `techexcellence.io`. The main site stays as it is, because Event Hub is a SaaS product and Tech Excellence is one group using it.
- **`events.`**, not `portal.`, `hub.` or `meetups.`: it covers meetups and the conference, matches the product name, and doesn't suggest Meetup.com.
- **The deploy creates the mappings, not `setup-gcp.sh`:** a mapping needs its Cloud Run service to exist, and `setup-gcp.sh` runs before the first deploy. The deploy re-ensures them on every run, so a rebuilt project gets them automatically. The teardown deletes them **before** destroying the project (corrected 2026-11-03): a deleted project stays pending deletion for 30 days and its mappings keep the hostnames reserved, so the next project's deploy failed with "already in use elsewhere" (acceptance 41664979591). Fixed in `teardown-gcp.sh`. Belt and braces: `ensure-domain-mapping.sh` creates with `--force-override` (takes the domain from another project; the deployer is a verified owner) and recreates a mapping stuck on `MappingAlreadyExists`. Opt-in through the `CUSTOM_DOMAIN` repo variable, so forks without a domain are unaffected; the variable isn't removed by the teardown, because it belongs to the domain, not the project.
- **Cloud Run domain mapping** (free, preview), not a load balancer (~$18/month) or Firebase Hosting. `us-central1` is supported. Google calls the feature not production-ready because of latency, which is acceptable at this scale.

## URL inventory (Step 2, done)

Every `run.app` URL is built from `<service>-<project-number>.<region>.run.app` in four places:

| Where | URL | Switches to custom domain? |
|---|---|---|
| `_deploy-cloud-run.yml` Resolve Stack Settings → `FRONTEND_URL` (backend `ALLOWED_ORIGINS`, Wait for Systems, output `frontend-url` → system tests) | `<system>-<stack>-frontend` | Prod → `events.`, QA → `events-qa.`; acceptance no |
| same → `KEYCLOAK_URL` (backend `AUTH_ISSUER_URI`/JWKS, frontend `KEYCLOAK_URL`, output `keycloak-url` → system tests) | `<system>-keycloak` | Yes → `auth.`, for **every** stack including acceptance: the issuer follows `KC_HOSTNAME`, which is one value for the shared instance |
| `.github/actions/deploy-keycloak-cloud` → `KC_HOSTNAME` and the wait endpoint | `<system>-keycloak` | Yes → `auth.` (same switch as above, same commit) |
| `.github/actions/build-cloud-images` `RUN_APP_SUFFIX` → `docker/keycloak/{cloud,prod}-realm.jq` redirect URIs / web origins | frontends | Step 5 (and decoupled, see there) |
| same step → `BACKEND_URL`, `EXT_URL` | backend, external systems | No: the browser never calls them (nginx proxies `/api/`) |

No `run.app` URLs in the frontend, backend or system-test code: they all come from env vars set by the deploy.

## Open questions

All resolved before execution (2026-11-02):

- **DNS for `techexcellence.io`:** only affects the user steps (1, 4); only new subdomain records are added
- **Main site ↔ app:** out of scope; a separate plan if wanted
- **Acceptance:** stays on `run.app`; no `events-acc.`
- **Backend and Keycloak:** the backend is proxied by the frontend's nginx (`frontend/nginx.conf`, `/api/`), so it needs no subdomain. The browser calls Keycloak directly (`window.__APP_CONFIG__.keycloakUrl`), so it gets `auth.techexcellence.io`: one shared Keycloak, one auth domain, separate realms per stage
- **Keycloak project-number coupling:** yes, fold it into Step 5 (the deploy sets client URLs through the admin API, not baked into the image)
- **Ordering:** this plan goes before Step 10 of the Cloud Run plan, so the teardown/setup proof also covers the mappings

## Apply to optivem/shop

**Two-way merge (user rule, 2026-11-03):** don't copy files from one repo to the other. For each shared file, compare shop's and event-hub's versions hunk by hunk and keep the best combination: event-hub's fixes go into shop, and anything shop does better (handling, messages, checks) comes back into event-hub. Keep only real project differences apart (names, database list, shop's `deploy-config.yml` step). When a unit finishes, both repos have the same logic, and each repo's commit message names what came from the other.

`optivem/shop` is also served only at `*.run.app` URLs. The same principles from **Decisions** apply there: a subdomain of an existing site, not a whole site; one subdomain per stage (`<name>.`, `<name>-qa.`, `<name>-acc.`); and free Cloud Run domain mapping. Once Steps 1 and 4–8 work here:

- [ ] Step 9: In `optivem/shop`, create `plans/<timestamp>-custom-domains-for-cloud-run.md` that lists the event-hub commits from Steps 2–8. Ask the user which domain and subdomains shop should use; it is not `techexcellence.io`. Then execute it there: Search Console verification and CNAMEs (user steps), domain mappings in its `setup-gcp.sh` / `teardown-gcp.sh` (the teardown must delete the mappings before the project, as event-hub's does; port `ensure-domain-mapping.sh`'s `--force-override` and stuck-mapping recreate too), Keycloak redirect URIs and web origins, and app and system-test URLs. Finish with one acceptance → QA → prod run.
