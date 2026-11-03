# 2026-11-03 19:51:54 UTC — Keycloak: per-stage realms, deploy service account, Sign in with Google

## TL;DR

**Why:** Keycloak still carries the names it was ported with from `optivem/shop`: realms `shop` (acceptance and QA share it) and `shop-prod`, client `shop-frontend`, and "Keycloak shop" in the deploy logs. Because acceptance and QA share one realm, both deploys write the same client's URLs and mix test users and sessions. The deploy signs in as the temporary bootstrap `admin` user, so that user can't be deleted, which Keycloak warns about on every console visit. Users can only sign in with a Keycloak password.
**End result:** Each stage has its own realm, `${SYSTEM_NAME}-acceptance`, `${SYSTEM_NAME}-qa` and `${SYSTEM_NAME}-prod`, with client `${SYSTEM_NAME}-frontend`. The deploy authenticates with a dedicated service-account client, and the temporary `admin` user is deleted. The app offers "Sign in with Google" next to the password login.

## Outcomes

What we get out of this — the goals and deliverables:

- Realms `event-hub-acceptance` (shared by the real and stub stacks), `event-hub-qa` and `event-hub-prod` exist on the shared Keycloak. The names come from `SYSTEM_NAME`, so shop's port gets `shop-acceptance` and so on without edits
- Acceptance and QA realms are generated from one test-realm template, with test users. The prod realm comes from the hardened transform: no test users, enforced by the existing check
- Each stage's deploy sets only its own realm's client URLs; the acceptance and QA deploys no longer touch each other's settings
- The client is `event-hub-frontend` everywhere: frontend config, backend audience/issuer settings, system tests, local docker-compose. No "shop" leftovers remain in Keycloak config or labels
- The old realms `shop` and `shop-prod` are deleted from the Keycloak database
- The deploy authenticates to the Keycloak admin API with a dedicated confidential client (client-credentials grant), with a secret in Secret Manager. The temporary bootstrap `admin` user is deleted and the "temporary admin" banner is gone; a rebuild (`./teardown-gcp.sh` → `./setup-gcp.sh`) still works with no manual step
- "Sign in with Google" appears on the login page of the realms that enable it. A first Google sign-in creates the user with the default role
- The prod users (the owner's account, `prod-check`) exist in `event-hub-prod`, and login works on `events.techexcellence.io` with both a password and Google
- The same changes are recorded for the shop port (two-way merge, per the meta-plan's rule)

## ▶ Next executable step (resume here)

Planning: resolve the **Open questions** below with `/refine-plan plans/20261103-1951-keycloak-realms-clients-google-login.md` before executing. After that, Step 1 is the first executable unit. Per the meta-plan (`plans/20261102-2107-meta-cloud-run-coordination.md`), this plan runs in Wave 4 **after** C Step 8, one session at a time, because both touch the Keycloak config and `README.md`.

## Steps

- [ ] Step 1: **Inventory.** List every place that names a realm or client: `docker/keycloak/shop-realm.json`, `docker/keycloak/prod-realm.jq`, `docker/keycloak/prod-realm-check.jq`, `docker/keycloak/Dockerfile.cloud`, `.github/actions/deploy-keycloak-cloud/action.yml`, `.github/scripts/set-keycloak-client-urls.sh`, `.github/workflows/_deploy-cloud-run.yml` (realm input per stage), `frontend/src/auth/config.ts` (default `shop`) and its unit test, `backend/src/*/resources/application-test.yml`, `system-test/.../keycloak-token-provider.ts`, `docker/docker-compose.local.{real,stub}.yml`. Record it in this plan
- [ ] Step 2: **Per-stage realms and client rename.** Turn `shop-realm.json` into a realm template (no fixed name), generate `${SYSTEM_NAME}-acceptance` and `${SYSTEM_NAME}-qa` from it and `${SYSTEM_NAME}-prod` from the hardened transform at image build. Rename the client to `${SYSTEM_NAME}-frontend`. Pass the stage's realm from `_deploy-cloud-run.yml`; `set-keycloak-client-urls.sh` updates only that realm. Update the frontend default, backend test config, system tests and local compose. Remove the "Keycloak shop" labels. Run the local build and tests
- [ ] Step 3: **Deploy service account.** Add a confidential client in the `master` realm with only the service-account roles the deploy needs (manage the per-stage realms' clients). Store its secret in Secret Manager (`${SYSTEM}-keycloak-deployer-secret`). Switch `set-keycloak-client-urls.sh` to the client-credentials grant. Make it work on a fresh Keycloak database: see the open question on bootstrap
- [ ] Step 4: **Sign in with Google.** User step: create a Google OAuth client (OAuth consent screen, web client) with redirect URIs `https://auth.techexcellence.io/realms/<realm>/broker/google/endpoint` for each realm that enables it. Store the client ID and secret in Secret Manager. Add a `google` identity provider to those realms; the deploy configures it through the admin API, like the client URLs, so secrets stay out of the image. Set the first-login behaviour (see open questions)
- [ ] Step 5: **Roll out.** Run acceptance → QA → prod. Delete the old realms `shop` and `shop-prod`. Re-create the prod users in `event-hub-prod`. Check password and Google login on `events-qa.` and `events.`. Then delete the temporary `admin` user in the console, and run one more acceptance to prove the deploy no longer needs it
- [ ] Step 6: **Docs and coordination.** README: realms per stage, the deploy client, the Google setup (user steps). Update the meta-plan: add this plan as a unit in Wave 4 after U5, and add to C Step 9 / B Step 6 notes that shop's port includes these changes (two-way merge)

## Open questions

1. **Bootstrap of the deploy client on a fresh database.** Recommended: use Keycloak's `KC_BOOTSTRAP_ADMIN_CLIENT_ID` / `KC_BOOTSTRAP_ADMIN_CLIENT_SECRET` (a temporary service-account client, created only when the master realm is new), with the secret generated by `./setup-gcp.sh` into Secret Manager, *instead of* the bootstrap `admin` user. On first deploy the deploy uses it to create the permanent, narrowly scoped deploy client, then deletes the temporary one. Alternative: keep the bootstrap client as the deploy credential (simpler, but Keycloak still flags it as temporary)
2. **Which realms get Google login?** Recommended: prod and QA (QA so it can be tested before prod), not acceptance: the automated tests use password users, and acceptance URLs are `run.app`
3. **Who may sign in with Google, and with which role?** Recommended: anyone with a Google account gets `CUSTOMER` (the realm's default role) on first login; `ADMIN` stays a manual assignment. Alternative: restrict to invited users (first-login flow that only links to existing accounts)
4. **Existing account with the same email as a Google login.** Recommended: Keycloak's default first-broker-login flow, which asks the user to confirm linking by signing in with their password once. Alternative: trust Google's verified email and auto-link (less friction, weaker if an email was registered by someone else)
5. **OAuth consent screen.** Google needs an app name, support email, home page and privacy policy URL for a public ("In production") app; with only `openid email profile` scopes no Google verification review is needed. Is there a privacy policy page for `events.techexcellence.io`, or does this plan need one? (It also matters for GDPR: names and emails from Google are personal data.)
6. **Which Google Cloud project owns the OAuth client?** Recommended: the shared, long-lived Terraform state project (`tfstate-995925`) or a small dedicated one, *not* `event-hub-*`, because teardown deletes that project and the OAuth client with it
7. **Ordering against plan B (cold start).** Recommended: this plan before B Steps 1–5, so B measures the final Keycloak setup. Both touch `.github/actions/deploy-keycloak-cloud/action.yml`
