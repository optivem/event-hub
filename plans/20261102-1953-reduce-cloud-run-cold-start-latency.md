# 2026-11-02 19:53:27 UTC — Reduce Cloud Run cold-start latency

## TL;DR

**Why:** After the Cloud Run deployment, prod works (login and order creation succeeded on 2026-11-02) but feels slow. Every service scales to zero, so the first request after idle waits on several cold starts in a row: Keycloak (JVM), the Spring Boot backend (JVM), and a suspended Neon database.
**End result:** We have measured cold and warm latency for each hop, applied the free startup fixes, and made an explicit cost decision on keeping prod warm. The first prod interaction after idle is fast enough to demo, and idle cost stays known and accepted.

**Ordering gate (decided 2026-11-03):** execute only after the U4 rebuild, that is after Step 10 of `plans/20261030-1931-deploy-pipeline-to-gcp-cloud-run.md` plus Step 7 of `plans/20261102-1954-custom-domains-for-cloud-run.md` (teardown → setup → custom-domain switch). The rebuild and the URL switch change what we would measure, so no `run.app` baseline is taken before that. See `plans/20261104-1928-meta-cloud-run-coordination.md`.

## Outcomes

- A repeatable measurement of cold vs warm latency per hop (frontend, Keycloak, backend, backend→Neon)
- Backend JVM startup tuned for Cloud Run (no extra cost)
- An explicit decision on `--min-instances 1` for prod Keycloak only (applied only if its cold start is over ~10 s), with the monthly cost written down
- The same changes applied to `optivem/shop` afterwards (see the last section)

## ▶ Next executable step (resume here)

Steps 1–5 are done in event-hub. The only unit left is Step 6, the shop port (Wave 5, U8 in `plans/20261104-1928-meta-cloud-run-coordination.md`). Per the meta-plan it runs after Wave 4 (the Keycloak realms plan) and after U1, so check the meta-plan's order before you start. Shop lives at `/home/vscode/shop`.

## Findings so far (2026-11-02)

- No service sets `--min-instances`, so all of them scale to zero (`_deploy-cloud-run.yml`, `deploy-keycloak-cloud/action.yml`).
- Warm requests from the dev container take ~0.5–0.7 s each (frontend `/`, backend `/health`, Keycloak well-known), even for trivial endpoints. Most of that is likely network distance to `us-central1` plus TLS, not the app.
- Keycloak already uses `kc.sh build` + `start --optimized`, so its remaining cold start is JVM + Quarkus boot + DB connection.
- The backend runs plain `java -jar app.jar` on `eclipse-temurin:21-jre-alpine`, with no CDS, no JVM flags for a 1 vCPU / 1 GiB container, and `--cpu-boost` on.
- Neon lives in `aws-us-east-2`. The free plan suspends compute after 5 min idle, and the first query after that waits for it to wake up.
- The frontend is static nginx (Vite build). Its cold start should be small.

## Measurements (2026-11-04, before Steps 2–3)

`scripts/measure-latency.sh <stack>` from the dev container. Times are `time_total` in seconds, one cold request after ≥15 min idle, then 3 warm ones. Idle check: no stage run between 09:43 and 10:00 UTC (`gh run list`). Cloud Run logs weren't readable (local `gcloud` auth had expired).

| Hop | prod cold | acc-stub cold | acc-real cold | warm (all stacks) |
|---|---|---|---|---|
| frontend `/` | 1.3 | 1.1 | 0.6 | 0.4–0.6 |
| Keycloak well-known | 1.2 (was warm) | 0.45 | 0.43 | 0.4–0.6 |
| backend `/health` | 20.4 | 18.7 | 21.0 | 0.4–0.5 |
| backend `/api/orders` (DB), right after `/health` | n/a (prod realm has no password grant) | 2.5 | 1.5 | 0.5–0.9 |

- **Network:** TCP connect ~0.05–0.07 s, TCP + TLS ~0.2 s, and a warm trivial request ~0.45 s. So about half of every warm request is network and TLS from the dev container, and the rest is the domain mapping plus the app. The region stays as it is.
- **Backend:** the cold start (~20 s) is the main cost. Locally with 1 CPU / 1 GiB and no database, Spring's "Started BackendApplication in X seconds" was ~14 s.
- **Keycloak:** it stayed warm through the idle window (something kept calling it, likely an open browser session), so its cold start comes from the deploy log instead. After hours of idle, the 08:48 acceptance run's first well-known request took 24.5 s. Locally with 1 CPU and existing realms, "started in" was ~18 s. The log shows no build step at boot (`start --optimized` is in effect), and `--import-realm` skips both existing realms in <1 s.
- **Neon:** no measurable wake-up. With the backend kept warm by `/health` only, the first DB query after 8 min without DB traffic took 0.64 s against 0.49 s warm. Open pool connections (backend and Keycloak share the compute) probably keep it from suspending. Neon stays as it is.

## Re-measure (2026-11-04, after Steps 2–3)

Same script and method. acc-stub at 10:57 UTC (backend idle ~30 min). acc-real, and acc-stub again, at 11:26 UTC after 21 min with no stage run and no request from this container. Cloud Run logs still not read (no `gcloud` auth).

| Hop | acc-stub cold (10:57 / 11:26) | acc-real cold | warm |
|---|---|---|---|
| frontend `/` | 0.6 / 0.5 | 0.9 | 0.4–0.5 |
| Keycloak well-known | warm both times | **22.3** | 0.4–0.5 |
| backend `/health` | **10.3 / 11.3** (was 18.7) | **7.2** (was 21.0) | 0.4–0.5 |
| backend `/api/orders` (DB) | 1.3 / 1.3 | 1.0 | 0.4–0.5 |

- **Backend:** AppCDS + C1 halved the cold start on Cloud Run (~20 s → 7–11 s).
- **Keycloak:** C1-only JIT barely helped on Cloud Run (24.5 s → 22.3 s), though it halved the local boot. That's over the ~10 s threshold, so Step 4 applies.

## Done so far

- Step 1: `scripts/measure-latency.sh` (`73a655d`) and the table above.
- Step 2 (`997ba59`): `backend/Dockerfile` extracts the jar, makes an AppCDS archive in a training run (`-Dspring.context.exit=onRefresh`, with Hibernate's JDBC metadata access off and dummy auth settings, so it needs no database), and starts with `-XX:SharedArchiveFile`. `JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1"`. Local start (1 CPU / 1 GiB): ~14 s before, ~7–10 s with C1 only, ~4–6 s with CDS as well. Both are kept. The Cloud Run re-measure is still to do.
- Step 3 (`f5112ef`): `docker/keycloak/Dockerfile.cloud` sets `JAVA_OPTS_APPEND=-XX:TieredStopAtLevel=1`, which took the local boot from ~18 s to ~9 s. `--memory 2Gi` made no difference locally (the boot is CPU-bound), so it isn't applied. Deployed as Keycloak revision `event-hub-keycloak-00002`.
- Acceptance run 41812494001 (`f5112ef`) is green with both changes. The scheduled run 41814043950 is green as well.
- Step 4: Keycloak's cold start is 22.3 s, so `--min-instances 1` went in (`3283903`, ~$13/month). **Reverted the same day (user decision, 2026-11-04): the project stays at $0.** The deploy now sets `--min-instances 0` explicitly (`gcloud run deploy` keeps an old value when the flag is left out), so Keycloak cold-starts in ~22 s again. Info: the warm instance was live for about 26 min (revision `00003` at 11:32 UTC to revision `00004` at 11:58 UTC, run 41824941276). That's a one-time ~$0.01 (1,560 s × 1 vCPU + 1 GiB at ~$0.000005/s), most likely covered by Cloud Run's monthly free tier (180,000 vCPU-seconds), so probably billed as $0. Not checked against the billing account. The ongoing cost is $0/month again. A free option if that becomes a problem: a Cloud Scheduler ping to the well-known URL every 10 min (3 free jobs per billing account; Cloud Run doesn't guarantee an idle instance stays up, and check whether a warm Keycloak keeps Neon from suspending).
- Step 5: the first dispatch (41821154748) skipped everything: the acceptance gate doesn't count a change under `.github/actions/` as a workflow change. Then `force=true` (41821351077) went green and deployed Keycloak revision `event-hub-keycloak-00003` with `--min-instances 1`.

## Open questions

All resolved before execution (2026-11-03):

- **Keep prod warm:** decide after Step 1's numbers. If the cold start is over ~10 s, set `--min-instances 1` on **prod Keycloak only** (shared by every stack, slowest boot; roughly $10–15/month). Acceptance and QA keep scaling to zero
- **Neon autosuspend:** neither a paid plan nor a scheduled ping for now. Step 1 measures the wake-up cost first
- **Region:** keep `us-central1` unless Step 1 shows network as the main cost
- **Ordering:** execute only after U4 (Cloud Run plan Step 10 + custom-domains plan Step 7); no `run.app` baseline before that

## Apply to optivem/shop

**Two-way merge (user rule, 2026-11-03):** don't copy files from one repo to the other. For each shared file, compare shop's and event-hub's versions hunk by hunk and keep the best combination: event-hub's fixes go into shop, and anything shop does better (handling, messages, checks) comes back into event-hub. Keep only real project differences apart (names, database list, shop's `deploy-config.yml` step). When a unit finishes, both repos have the same logic, and each repo's commit message names what came from the other.

`optivem/shop` has the same Cloud Run + Neon + Keycloak setup, so it has the same cold starts. Once Steps 1–5 are done here:

- [ ] Step 6: In `optivem/shop`, create `plans/<timestamp>-reduce-cloud-run-cold-start-latency.md` that lists the event-hub commits from Steps 1–4 and the min-instances decision (reverted: shop stays at `--min-instances 0` too). Use shop's service and secret names (`shop-*` instead of `event-hub-*`), and check shop's equivalents of `backend/Dockerfile`, `.github/workflows/_deploy-cloud-run.yml` and `.github/actions/deploy-keycloak-cloud/action.yml` before editing. Then execute it there: port the changes, run one acceptance dispatch, and re-measure with the ported `scripts/measure-latency.sh`.
