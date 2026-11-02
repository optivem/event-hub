# 2026-10-30 19:31:32 UTC — Deploy the pipeline to GCP Cloud Run


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

Only user steps remain. Step 8: the user creates a real user in `shop-prod` and logs in to prod (how-to below). Step 10: the user runs teardown/setup and one acceptance dispatch. No agent work is left until Step 10 reports a failure.

## Steps

- [ ] Step 8: `prod-stage.yml` deployed `v1.0.227` to Cloud Run (run 41439611882, release `v1.0.227`); prod frontend https://event-hub-prod-frontend-992033658880.us-central1.run.app uses the `shop-prod` realm. Only one item remains: the user creates a real user in `shop-prod` (the realm has no users and registration is off) and logs in to prod. How: read the Keycloak admin password with `gcloud secrets versions access latest --secret=event-hub-keycloak-admin-password --project=<event-hub GCP project>` (username `admin`; the bootstrap password only applies on first start), sign in at https://event-hub-keycloak-992033658880.us-central1.run.app/admin, switch to `shop-prod`, Users → Add user (email verified on), Credentials → set password with Temporary off, Role mapping → `ADMIN` and/or `CUSTOMER`. Keep the password in a password manager, never in the repo
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
