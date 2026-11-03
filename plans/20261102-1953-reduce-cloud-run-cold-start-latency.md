# 2026-11-02 19:53:27 UTC — Reduce Cloud Run cold-start latency

## TL;DR

**Why:** After the Cloud Run deployment, prod works (login and order creation succeeded on 2026-11-02) but feels slow. Every service scales to zero, so the first request after idle waits on several cold starts in a row: Keycloak (JVM), the Spring Boot backend (JVM), and a suspended Neon database.
**End result:** We have measured cold and warm latency for each hop, applied the free startup fixes, and made an explicit cost decision on keeping prod warm. The first prod interaction after idle is fast enough to demo, and idle cost stays known and accepted.

**Ordering gate (decided 2026-11-03):** execute only after the U4 rebuild, that is after Step 10 of `plans/20261030-1931-deploy-pipeline-to-gcp-cloud-run.md` plus Step 7 of `plans/20261102-1954-custom-domains-for-cloud-run.md` (teardown → setup → custom-domain switch). The rebuild and the URL switch change what we would measure, so no `run.app` baseline is taken before that. See `plans/20261102-2107-meta-cloud-run-coordination.md`.

## Outcomes

- A repeatable measurement of cold vs warm latency per hop (frontend, Keycloak, backend, backend→Neon)
- Backend JVM startup tuned for Cloud Run (no extra cost)
- An explicit decision on `--min-instances 1` for prod Keycloak only (applied only if its cold start is over ~10 s), with the monthly cost written down
- The same changes applied to `optivem/shop` afterwards (see the last section)

## ▶ Next executable step (resume here)

Blocked until U4 has passed: Step 10 of `plans/20261030-1931-deploy-pipeline-to-gcp-cloud-run.md` and Step 7 of `plans/20261102-1954-custom-domains-for-cloud-run.md`. Then Step 1: measure on the custom domains (`events.techexcellence.io`, `auth.techexcellence.io`). The open questions are resolved. The last section applies the result to `optivem/shop`.

## Findings so far (2026-11-02)

- No service sets `--min-instances`, so all of them scale to zero (`_deploy-cloud-run.yml`, `deploy-keycloak-cloud/action.yml`).
- Warm requests from the dev container take ~0.5–0.7 s each (frontend `/`, backend `/health`, Keycloak well-known), even for trivial endpoints. Most of that is likely network distance to `us-central1` plus TLS, not the app.
- Keycloak already uses `kc.sh build` + `start --optimized`, so its remaining cold start is JVM + Quarkus boot + DB connection.
- The backend runs plain `java -jar app.jar` on `eclipse-temurin:21-jre-alpine`, with no CDS, no JVM flags for a 1 vCPU / 1 GiB container, and `--cpu-boost` on.
- Neon lives in `aws-us-east-2`. The free plan suspends compute after 5 min idle, and the first query after that waits for it to wake up.
- The frontend is static nginx (Vite build). Its cold start should be small.

## Open questions

All resolved before execution (2026-11-03):

- **Keep prod warm:** decide after Step 1's numbers. If the cold start is over ~10 s, set `--min-instances 1` on **prod Keycloak only** (shared by every stack, slowest boot; roughly $10–15/month). Acceptance and QA keep scaling to zero
- **Neon autosuspend:** neither a paid plan nor a scheduled ping for now. Step 1 measures the wake-up cost first
- **Region:** keep `us-central1` unless Step 1 shows network as the main cost
- **Ordering:** execute only after U4 (Cloud Run plan Step 10 + custom-domains plan Step 7); no `run.app` baseline before that

## Steps

- [ ] Step 1 (after U4): Measure on the custom-domain URLs. Add `scripts/measure-latency.sh` that, for a stack's URLs, does a cold request (after ≥15 min idle) and then 3 warm requests to: frontend `/`, Keycloak `/realms/<realm>/.well-known/openid-configuration`, backend `/health`, and one backend endpoint that hits the DB. Print `curl -w` timings (`time_connect`, `time_starttransfer`, `time_total`). Also read the startup lines from Cloud Run logs (`gcloud run services logs read <service> --limit 50`): Spring's "Started … in X seconds" and Keycloak's "started in Xs". Also record the Neon wake-up cost (first DB query after ≥5 min idle) and how much of each request is network. Write the numbers into this plan.
- [ ] Step 2: Backend JVM startup (free). In `backend/Dockerfile`, add an AppCDS archive step (Spring Boot 3.3+: `java -Djarmode=tools -jar app.jar extract`, then a training run with `-XX:ArchiveClassesAtExit`, then start with `-XX:SharedArchiveFile`). Set `JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1"` (C1 only, for faster startup) and leave `--cpu-boost` on. Re-measure and keep whatever helps. If startup is still over ~10 s, consider `spring.main.lazy-initialization=true` for prod only, or GraalVM native image (bigger change, separate plan).
- [ ] Step 3: Keycloak startup (free). Confirm `start --optimized` is in effect: the logs should show no augmentation/build step at boot. If realm import runs on every boot, check that `--import-realm` skips existing realms quickly. Consider `--memory 2Gi`, which on Cloud Run also allows more CPU headroom with `--cpu-boost`. Re-measure.
- [ ] Step 4: Keep prod warm, only if needed. If prod Keycloak's cold start (after Steps 2–3) is still over ~10 s, add `--min-instances 1` to the prod Keycloak deploy only. The backend, acceptance and QA stay at 0. Write the monthly cost into the README section that says idle cost is ~$0. If it is under ~10 s, change nothing and write that down here. Neon and region stay as they are unless Step 1 showed them as the main cost (then write a separate plan).
- [ ] Step 5: Run one acceptance dispatch to confirm nothing regressed.

## Apply to optivem/shop

**Two-way merge (user rule, 2026-11-03):** don't copy files from one repo to the other. For each shared file, compare shop's and event-hub's versions hunk by hunk and keep the best combination: event-hub's fixes go into shop, and anything shop does better (handling, messages, checks) comes back into event-hub. Keep only real project differences apart (names, database list, shop's `deploy-config.yml` step). When a unit finishes, both repos have the same logic, and each repo's commit message names what came from the other.

`optivem/shop` has the same Cloud Run + Neon + Keycloak setup, so it has the same cold starts. Once Steps 1–5 are done here:

- [ ] Step 6: In `optivem/shop`, create `plans/<timestamp>-reduce-cloud-run-cold-start-latency.md` that lists the event-hub commits from Steps 1–4 and the min-instances decision. Use shop's service and secret names (`shop-*` instead of `event-hub-*`), and check shop's equivalents of `backend/Dockerfile`, `.github/workflows/_deploy-cloud-run.yml` and `.github/actions/deploy-keycloak-cloud/action.yml` before editing. Then execute it there: port the changes, run one acceptance dispatch, and re-measure with the ported `scripts/measure-latency.sh`.
