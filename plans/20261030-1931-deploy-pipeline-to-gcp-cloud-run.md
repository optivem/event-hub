# 2026-10-30 19:31:32 UTC — Deploy the pipeline to GCP Cloud Run

> 🤖 **Picked up by agent** — `bfdf944406b0` at `2026-10-31T13:26:24Z`

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

Step 1: copy `terraform/`, `setup-gcp.sh` and `teardown-gcp.sh` from `optivem/shop` (public; not checked out here) into this repo, adapt them to `event-hub`, and add `neonctl` to the dev container. Do not copy `teardown-everything.sh`: it deletes every other GCP project too. Then do Steps 3 and 4, and hand the user the Step 2 command.

## Steps

- [ ] Step 1: Port the infrastructure from `optivem/shop`: `terraform/`, `setup-gcp.sh`, `teardown-gcp.sh`, Artifact Registry cleanup policy, and the shared `<system>-db` + `<system>-keycloak-admin-password` secrets. Once the project exists, `setup-gcp.sh` also runs `gcloud auth application-default set-quota-project` for it, so Terraform's application-default credentials stop warning about a missing quota project
- [ ] Step 2: Provision GCP and Neon with `./setup-gcp.sh`, with one database per stack: `event_hub_acceptance_real`, `event_hub_acceptance_stub`, `event_hub_qa`, `event_hub_prod`, `event_hub_keycloak`
- [ ] Step 3: Add cloud-only images: `docker/keycloak/Dockerfile.cloud` + `cloud-realm.jq` (the realm import must list every stack's frontend URL up front, because `--import-realm` skips a realm that already exists) and a Flyway Dockerfile under `db/` (only `db/migrations` exists today)
- [ ] Step 4: Add a reusable deploy workflow, adapted from `_deploy-stage-cloud.yml`, `_acceptance-stage-cloud.yml` and `multitier-java-acceptance-stage-cloud.yml` in `optivem/shop`: copy images to Artifact Registry, deploy Keycloak, external systems, migrations job, backend and frontend, then wait for endpoints
- [ ] Step 5: Switch `acceptance-stage.yml` to it: replace both `deploy-docker-compose` steps and the `localhost` endpoints, and point `docker/systems.yaml` and the test URLs at the deployed stacks; get one green manual run
- [ ] Step 6: Switch `qa-stage.yml` to it; get one green run including `qa-signoff.yml`
- [ ] Step 7: Add a prod realm without the password-grant test client and test users, and make sure no test suite runs against prod except login-free smoke tests
- [ ] Step 8: Switch `prod-stage.yml` to it. The agent stops here without dispatching and hands the user the exact command, because a prod run publishes a real tag and a public GitHub Release
- [ ] Step 9: Remove what is now unused: `docker-compose.pipeline.*.yml`, Docker Hub logins and `DOCKERHUB_*` checks that only served them; set `deploy` in `gh-optivem.yaml` to the matching value
- [ ] Step 10: Prove it is reproducible: the user runs `./teardown-gcp.sh`, then `./setup-gcp.sh`, then one acceptance dispatch

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
