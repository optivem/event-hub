# 2026-11-02 19:53:27 UTC — Port the Cloud Run cold-start fixes from optivem/shop

## TL;DR

**Why:** Prod on Cloud Run works but is slow after idle: Keycloak, the backend and Neon each start or wake up cold, one after another. The fix is being done first in `optivem/shop`, whose setup this repo copied.
**End result:** event-hub has the same latency fixes as shop (backend JVM startup tuning, Keycloak tuning, and the min-instances decision), adapted to event-hub's names, and one acceptance dispatch passes.

## ▶ Next executable step (resume here)

⏳ Deferred: blocked until `optivem/shop` finishes its "Reduce Cloud Run cold-start latency" plan. When it does, list shop's commits here and turn Step 1 into concrete edits.

## Steps

- [ ] Step 1: Port shop's changes to `backend/Dockerfile`, `.github/workflows/_deploy-cloud-run.yml` and `.github/actions/deploy-keycloak-cloud/action.yml`, using event-hub's service and secret names. Then run one acceptance dispatch, and re-measure prod cold and warm latency. — ⏳ Deferred: waiting on optivem/shop
