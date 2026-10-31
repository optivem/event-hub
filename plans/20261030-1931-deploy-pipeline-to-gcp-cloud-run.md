# 2026-10-30 19:31:32 UTC — Deploy the pipeline to GCP Cloud Run

> 🤖 **Picked up by agent** — `bfdf944406b0` at `2026-10-31T19:30:26Z`

## TL;DR

**Why:** The acceptance, QA and prod stages only simulate deployment: `deploy-docker-compose` starts the system on a throwaway GitHub runner at `localhost`, so nothing is ever really deployed and "production" disappears when the job ends.
**End result:** The acceptance, QA and prod stages of `event-hub` deploy the tested images to GCP Cloud Run with Neon Postgres, the system tests run against the deployed URLs, and the system costs ~$0 when idle. This follows the setup proven in `optivem/shop`.

## Outcomes

What we get out of this — the goals and deliverables:

- Acceptance deploys real and stub stacks to Cloud Run, and every existing suite passes against them
- QA and prod each run as a persistent stack at a stable `run.app` URL
- The deployed image has the same digest that was tested (copied from GHCR into Artifact Registry, not rebuilt)
- GitHub Actions authenticates to GCP keylessly through Workload Identity Federation
- The whole GCP project can be recreated from the repo with `./setup-gcp.sh` and removed with `./teardown-gcp.sh`
- Idle cost stays ~$0: services scale to zero and Artifact Registry keeps only the last N images
- Prod has no password-grant test client and no test users
- `docker-compose.local.*.yml` still works for local development

## ▶ Next executable step (resume here)

Step 7: add the `shop-prod` realm and take prod out of the `shop` realm (`cloud-realm.jq`). The human-only part of Step 6, the QA sign-off, is still open and blocks the prod run.

## Steps

- [ ] Step 6: `qa-stage.yml` is on Cloud Run and green (run 41236790333); only `qa-signoff.yml` remains. A human tests https://event-hub-qa-frontend-992033658880.us-central1.run.app, then runs `gh workflow run qa-signoff.yml --repo optivem/event-hub --ref main -f version=v1.0.227-rc.14 -f result=approved`. An agent must not dispatch it: it records a human approval and unlocks prod
- [ ] Step 7: Add a `shop-prod` realm as a new import file without the password-grant test client and test users, and remove the prod URL from the `shop` realm (an existing realm is not re-imported, so this needs `event_hub_keycloak` recreated), and make sure no test suite runs against prod except login-free smoke tests
- [ ] Step 8: Switch `prod-stage.yml` to it, passing `realm: shop-prod`. The agent stops here without dispatching and hands the user the exact command, because a prod run publishes a real tag and a public GitHub Release
- [ ] Step 9: Remove what is now unused: `docker-compose.pipeline.*.yml`, Docker Hub logins and `DOCKERHUB_*` checks that only served them; set `deploy` in `gh-optivem.yaml` to the matching value
- [ ] Step 10: Prove it is reproducible: the user runs `./teardown-gcp.sh`, then `./setup-gcp.sh`, then one acceptance dispatch. The Keycloak image bakes in the project number, so a new project needs that image rebuilt and `event_hub_keycloak` recreated

## Decisions

Open questions: none — all resolved before execution.

- **Stages:** change the existing stage workflows in place; no `*-cloud.yml` siblings.
- **Acceptance schedule:** daily cron instead of hourly (`0 3 * * *`), changed in Step 5.
- **GCP and Neon projects:** separate `event-hub-*` projects, not shop's.
- **External systems:** simulators stay in QA and prod until real ERP, Clock and Tax endpoints exist.
- **Keycloak:** one shared instance with a separate prod realm.
- **`./setup-gcp.sh`:** the user runs it, because it creates billable resources. It needs `gcloud` (logged in), `neonctl` and a billing account.
- **Timing:** start now, copying the current `optivem/shop` shape. Its reusable `_deploy-stage-cloud.yml` and `_acceptance-stage-cloud.yml` are the source for Step 4.
- **Run order:** Steps 1, 3 and 4 run before provisioning, because they do not change the running pipeline. Step 2 then blocks on the user.
