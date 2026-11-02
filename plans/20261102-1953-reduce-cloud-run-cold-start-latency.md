# 2026-11-02 19:53:27 UTC — Reduce Cloud Run cold-start latency

> Portable: `event-hub` and `optivem/shop` share the same Cloud Run + Neon + Keycloak setup. To use this plan in `optivem/shop`, copy the file into its `plans/` folder and replace `event-hub` with `shop` in service and secret names. File paths (`.github/workflows/_deploy-cloud-run.yml`, `.github/actions/deploy-keycloak-cloud/action.yml`, `backend/Dockerfile`, `terraform/neon.sh`) are the event-hub ones; check the shop equivalents before editing.

## TL;DR

**Why:** After the Cloud Run deployment, prod works (login and order creation succeeded on 2026-11-02) but feels slow. Every service scales to zero, so the first request after idle waits on several cold starts in a row: Keycloak (JVM), the Spring Boot backend (JVM), and a suspended Neon database.
**End result:** We have measured cold and warm latency for each hop, applied the free startup fixes, and made an explicit cost decision on keeping prod warm. The first prod interaction after idle is fast enough to demo, and idle cost stays known and accepted.

## Outcomes

- A repeatable measurement of cold vs warm latency per hop (frontend, Keycloak, backend, backend→Neon)
- Backend JVM startup tuned for Cloud Run (no extra cost)
- An explicit decision on `--min-instances` for prod Keycloak and prod backend, with the monthly cost written down
- The same changes applied in `optivem/shop`

## ▶ Next executable step (resume here)

Resolve the open questions below first (`/refine-plan` this file). Then Step 1: measure.

## Findings so far (2026-11-02)

- No service sets `--min-instances`, so all of them scale to zero (`_deploy-cloud-run.yml`, `deploy-keycloak-cloud/action.yml`).
- Warm requests from the dev container take ~0.5–0.7 s each (frontend `/`, backend `/health`, Keycloak well-known), even for trivial endpoints. Most of that is likely network distance to `us-central1` plus TLS, not the app.
- Keycloak already uses `kc.sh build` + `start --optimized`, so its remaining cold start is JVM + Quarkus boot + DB connection.
- The backend runs plain `java -jar app.jar` on `eclipse-temurin:21-jre-alpine`, with no CDS, no JVM flags for a 1 vCPU / 1 GiB container, and `--cpu-boost` on.
- Neon lives in `aws-us-east-2`. The free plan suspends compute after 5 min idle, and the first query after that waits for it to wake up.
- The frontend is static nginx (Vite build). Its cold start should be small.

## Open questions

1. **Keep prod warm?** Use `--min-instances 1` on prod Keycloak and prod backend. Without it, the first user after idle waits for cold starts in a row. With it, each warm instance costs roughly $10–15/month at 1 vCPU / 1 GiB with request-based CPU (check the GCP pricing calculator), and Neon still suspends unless the backend keeps a connection alive. *Recommendation:* decide after Step 1's numbers. If cold start is over ~10 s, set min-instances 1 on **prod Keycloak only**, since it is shared by every stack and is the slowest boot. Acceptance and QA keep scaling to zero.
2. **Neon autosuspend:** a paid Neon plan can turn autosuspend off, or the backend can be pinged on a schedule. *Recommendation:* neither for now. Measure the wake-up cost in Step 1 first; it is usually well under a second.
3. **Region:** if most users are in Europe, `us-central1` + `aws-us-east-2` adds ~100+ ms per round trip. *Recommendation:* keep the region unless Step 1 shows network as the main cost. Moving it means re-running `./teardown-gcp.sh` / `./setup-gcp.sh` and rebuilding the Keycloak image.

## Steps

- [ ] Step 1: Measure. Add `scripts/measure-latency.sh` that, for a stack's URLs, does a cold request (after ≥15 min idle) and then 3 warm requests to: frontend `/`, Keycloak `/realms/<realm>/.well-known/openid-configuration`, backend `/health`, and one backend endpoint that hits the DB. Print `curl -w` timings (`time_connect`, `time_starttransfer`, `time_total`). Also read the startup lines from Cloud Run logs (`gcloud run services logs read <service> --limit 50`): Spring's "Started … in X seconds" and Keycloak's "started in Xs". Write the numbers into this plan.
- [ ] Step 2: Backend JVM startup (free). In `backend/Dockerfile`, add an AppCDS archive step (Spring Boot 3.3+: `java -Djarmode=tools -jar app.jar extract`, then a training run with `-XX:ArchiveClassesAtExit`, then start with `-XX:SharedArchiveFile`). Set `JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1"` (C1 only, for faster startup) and leave `--cpu-boost` on. Re-measure and keep whatever helps. If startup is still over ~10 s, consider `spring.main.lazy-initialization=true` for prod only, or GraalVM native image (bigger change, separate plan).
- [ ] Step 3: Keycloak startup (free). Confirm `start --optimized` is in effect: the logs should show no augmentation/build step at boot. If realm import runs on every boot, check that `--import-realm` skips existing realms quickly. Consider `--memory 2Gi`, which on Cloud Run also allows more CPU headroom with `--cpu-boost`. Re-measure.
- [ ] Step 4: Apply the decision from open question 1. If accepted, add `--min-instances 1` to prod Keycloak and/or the prod backend deploy only. Acceptance and QA stay at 0. Write the monthly cost into the README section that says idle cost is ~$0.
- [ ] Step 5: Copy the changes from Steps 2–4 into `optivem/shop`, then run one acceptance dispatch in each repo to confirm nothing regressed.
