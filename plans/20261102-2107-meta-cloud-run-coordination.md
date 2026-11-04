# 2026-11-02 21:07 UTC — Plan coordination meta-plan: Cloud Run follow-ups

> 🤖 **Picked up by agent** — `bfdf944406b0` at `2026-11-04T08:46:32Z`

**Plans analysed:** 5 in-scope (plan **E** added 2026-11-03), 3 referenced-only (`plans/deferred/*`; none are dependencies of an in-scope plan)

**Live environment (updated 2026-11-03, after U4):** GCP project `event-hub-ef289c` (us-central1), rebuilt by `./teardown-gcp.sh` → `./setup-gcp.sh`; Neon project `event-hub` (`noisy-wildflower-82769848`). The deployer `github-deployer@event-hub-ef289c.iam.gserviceaccount.com` is a Search Console owner of `techexcellence.io`. Prod is `v1.0.229` at `events.techexcellence.io`; prod test user `prod-check` (`CUSTOMER`, realm `shop-prod`), password in Secret Manager `event-hub-prod-check-password`. The old project `event-hub-686953` is pending deletion with its domain mappings removed.

## ▶ Next executable step (resume here)

U5 (C Step 8) is done (2026-11-04, `aeb2317`): the domain setup, the teardown ordering, certificates and the latency fallback are documented in `terraform/README.md#custom-domains`. The run.app entries stay in the Keycloak client (user decision).

Next is **U6** = B Steps 1–5 (`/execute-plan plans/20261102-1953-reduce-cloud-run-cold-start-latency.md`). Pre-authorized by the user on 2026-11-04: `--min-instances 1` on prod Keycloak if its cold start is still over ~10 s. Since `882e758`, acceptance is also on custom domains (`events-acc.`, `events-e2e.`).

## Per-plan status snapshot

| Plan | Status | Items done / total | Touched files (primary) | Notes |
|---|---|---|---|---|
| `20261030-1931-deploy-pipeline-to-gcp-cloud-run` (**A**) | done, deleted 2026-11-03 | — | — | Step 10 proven by U4 (teardown → setup → acceptance 41673649275) |
| `20261102-1953-reduce-cloud-run-cold-start-latency` (**B**) | refined; next after U5 | 0 / 6 | `scripts/measure-latency.sh` (new), `backend/Dockerfile`, `.github/workflows/_deploy-cloud-run.yml`, `.github/actions/deploy-keycloak-cloud/action.yml`, `README.md`; Step 6 in `optivem/shop` | U4 done, so B is unblocked (Wave 4 batch B) |
| `20261102-1954-custom-domains-for-cloud-run` (**C**) | refined; Steps 1–8 done | 8 / 9 | `README.md`, `.github/scripts/set-keycloak-client-urls.sh`; Step 9 in `optivem/shop` | Step 7 passed in U4; Step 9 must port the teardown ordering and `--force-override` |
| `20261102-2015-sync-gcp-scripts-to-shop` (**D**) | done, deleted 2026-11-03 (`db0a68c`) | — | — | shop already carried the merge (shop `33c832c8`, `ef3eeba1`); shop checkout is at `/home/vscode/shop` |
| `20261103-1158-frontend-tag-prefix` (**E**) | done, deleted 2026-11-03 | — | — | prod `v1.0.229` published `frontend-v1.3.215`; QA without `-f version=` resolved `v1.0.229-rc.27` |

## Dependency graph

```
C Steps 1,4 (user) ─► C Steps 5,6 ─► A Step 10 ─┐
                                                ├─► C Step 7 ─► C Step 8 ─► C Step 9 (shop)
                                                │
             (needs-decision #1, default edge)  └─► B Steps 1–5 ─► B Step 6 (shop)

E Steps 1,2 ─────────────────────────────────────► E Step 3 (verified inside U4's prod run)

D (shop) ─────────────────────────────────────────► C Step 9 (shop), B Step 6 (shop)   [file order, not a declared edge]
```

Declared edges: A Step 10 after C Step 6 (A's own text). Inside C, Step 9 comes after Steps 1 and 4–8, and inside B, Step 6 comes after Steps 1–5. The B edge and the D → shop-port edges are not declared in the plans; see Conflicts and Needs-decision. No cycles.

## Conflicts

### 1. The shared live environment: A Step 10's teardown wipes what C and B rely on (coordination conflict)
- A Step 10 runs `./teardown-gcp.sh` → `./setup-gcp.sh`. That deletes the Cloud Run services, the domain mappings (which go with the project) and the deployer service account, and the new project's service account gets a new email (`github-deployer@event-hub-<new-suffix>…`).
- C Step 1 adds the deployer service account as a Search Console owner of `techexcellence.io`, and Cloud Run domain mapping needs that owner. After every rebuild, the **new** service account must be added as an owner again, or the deploy's `ensure-domain-mapping.sh` can't create the mappings. Recreated mappings also re-provision their certificates (about 15 min, up to 24 h).
- B Step 1 measures cold and warm latency on the live stacks; a teardown halfway through makes those numbers meaningless.
- **Resolution:** run exactly one rebuild, A Step 10, after C Step 6 as A already says, and fold C Step 7 into the same session (Consolidation #1). Re-adding the service account as an owner is an explicit step right after that setup. B measures only after that rebuild.

### 2. `.github/workflows/_deploy-cloud-run.yml`: C Steps 5, 6, 8 vs B Steps 3, 4 (soft conflict)
- C Step 6 rewrites "Resolve Stack Settings" (`FRONTEND_URL`, `KEYCLOAK_URL`). C Step 5 adds a step that sets the Keycloak client URLs through the admin API. B Step 4 adds `--min-instances 1` to the prod backend deploy.
- Different regions of the file. Safe one after the other; unsafe as parallel sessions.
- **Resolution:** serialise, C first (Wave 2), B later (Wave 4).

### 3. `.github/actions/deploy-keycloak-cloud/action.yml`: C Steps 5, 6 vs B Steps 3, 4 (soft conflict)
- C changes `KC_HOSTNAME` and the wait endpoint, and adds the admin-API client update. B may add `--memory 2Gi` and `--min-instances 1` to the Keycloak deploy.
- **Resolution:** same as #2: C first, B later.

### 4. `README.md`: C Step 8 vs B Step 4 (soft conflict)
- C Step 8 documents the domain setup and the Firebase / load balancer fallback. B Step 4 writes the monthly min-instances cost into the "idle cost ~$0" section.
- **Resolution:** C Step 8 before B (Wave 4, batch A before batch B).

### 5. `optivem/shop` `setup-gcp.sh` / `teardown-gcp.sh`: D vs C Step 9 (soft conflict)
- D rewrites shop's teardown (idempotency, `--yes`, banner) and the Keycloak password prompt in setup. C Step 9 adds domain mappings and DNS hints to the same two scripts.
- **Resolution:** D first (it's ready now, Wave 1); C Step 9 later ports onto D's result.

### 6. `optivem/shop` `_deploy-cloud-run.yml` / Keycloak action: C Step 9 vs B Step 6 (soft conflict)
- Same shape as #2 and #3, on shop's copies.
- **Resolution:** serialise in Wave 5: C Step 9, then B Step 6.

## Consolidation findings (decided)

### 1. A Step 10 + C Step 7: one atomic session
- Both are "run the pipeline end to end on the result and confirm". A Step 10 = teardown → setup → acceptance. C Step 7 = acceptance → QA → prod plus a real login on `events.techexcellence.io`. Run separately, they mean two full pipeline runs, and C Step 7 would test a project that A Step 10 then throws away.
- **Resolution (recommended):** keep both plans as written, but do them in **one session**: teardown → setup → re-add the new deployer service account as a Search Console owner → wait about 5 min (the `ACCOUNT_STATE_INVALID` lesson) → acceptance → QA → prod → wait for the certificates → login on `events.` / `events-qa.`. When it passes, delete A's Step 10 (and with it plan A) and C's Step 7. **Why:** one rebuild proves both reproducibility and the custom domains, with no plan rewrite.
- **Alternative considered:** merge into a fresh plan. Rejected: both are refined, and these are just two checkboxes.

### 2. Getting the environment back (no plan owns it): a pre-step for C
- Right now there is no project, and C's Step 1 owner step needs `GCP_SERVICE_ACCOUNT`, which doesn't exist.
- **Resolution (recommended):** the user runs `./setup-gcp.sh` as the first Wave 1 user action, then finishes C Step 1 by adding the **new** service account as an owner. **Why:** C Steps 4–6 need live services, and this rebuild is unavoidable anyway.

## Execution units (post-consolidation)

| Unit | Plans | Type | Touched files (primary) |
|---|---|---|---|
| U0 | none (environment) | user pre-step | none; runs `./setup-gcp.sh` |
| U1 | **D** (all) | standalone, two-way merge shop ↔ event-hub | shop and event-hub `teardown-gcp.sh`, `setup-gcp.sh`, `terraform/state-backend.sh` |
| U3 | **C** Steps 5, 6 (agent; user Steps 1, 4 done 2026-11-03) | standalone | `_deploy-cloud-run.yml`, `deploy-keycloak-cloud/action.yml`, `build-cloud-images/action.yml`, `docker/keycloak/*` |
| U4 | **A** Step 10 + **C** Step 7 | atomic single session | none planned (pipeline runs); `setup-gcp.sh` only if a service-account wait turns out to be needed |
| U9 | **E** Steps 1–2 (Step 3 rides on U4) | standalone | `prod-stage.yml`, `bump-patch-version.yml`, remote tags |
| U5 | **C** Step 8 | standalone | Keycloak realm config, `README.md` / deploy docs |
| U6 | **B** Steps 1–5 | standalone | `scripts/measure-latency.sh`, `backend/Dockerfile`, `_deploy-cloud-run.yml`, `deploy-keycloak-cloud/action.yml`, `README.md` |
| U7 | **C** Step 9 | standalone, in `optivem/shop` | shop scripts, deploy workflow, Keycloak config |
| U8 | **B** Step 6 | standalone, in `optivem/shop` | shop `backend/Dockerfile`, deploy workflow, Keycloak action |

## Needs-decision (all resolved 2026-11-03)

### 1. Does B (cold-start latency) wait until after U4?
- B declares no ordering, but it measures the live stacks, and U4's rebuild plus the URL switch (custom-domain mapping is preview and itself adds latency) change what it would measure. It also shares three files with C.
- **Decided (2026-11-03):** yes. B is refined now (U2) and executes only after U4. **Why:** measuring before the switch would mean measuring again afterwards anyway.

## Execution waves

### Wave 1 — can start now

**Batch A (parallel-safe, 1 agent session + 1 user track):**
- **U1:** plan **D**, all steps. Agent session in an `optivem/shop` checkout: `/execute-plan` with the plan's path (it lives in event-hub: `../event-hub/plans/20261102-2015-sync-gcp-scripts-to-shop.md`, or copy it into shop's `plans/`). Touches only shop files.
- **U0 + C Step 1 (user):** ~~`./setup-gcp.sh`~~ (done 2026-11-02, project `event-hub-686953`), then ~~add `$(gh variable get GCP_SERVICE_ACCOUNT)` as an owner~~ (done 2026-11-03). `CUSTOM_DOMAIN` is already set and `techexcellence.io` is verified (2026-11-02).

### Wave 2 — after the user track of Wave 1

**Batch A (serial, 1 session):**
- **U3:** C Steps 5 and 6 (agent). C Step 4 was done on 2026-11-03. `/execute-plan plans/20261102-1954-custom-domains-for-cloud-run.md`.

**Batch B (parallel-safe with A: disjoint files):**
- **U9:** plan **E** Steps 1–2. Must land before U4, so U4's prod release proves it (E Step 3).

### Wave 3 — after C Step 6 lands

**Batch A (serial, 1 session, user and agent together):**
- **U4:** A Step 10 + C Step 7, atomic (Consolidation #1): `./teardown-gcp.sh` → `./setup-gcp.sh` → re-add the new deployer service account as a Search Console owner → wait about 5 min → `gh workflow run acceptance-stage.yml` → QA → prod → login on `events.techexcellence.io`; also check E Step 3 on that prod release. If `ACCOUNT_STATE_INVALID` comes back, add the service-account wait to `setup-gcp.sh` and a matching step to plan **D**, or to shop directly if D has already landed.

### Wave 4 — after Wave 3 passes

**Batch A:** **U5** (C Step 8): small, touches `README.md` and the Keycloak config.
**Batch B (serial after A, shares `README.md`, `_deploy-cloud-run.yml` and the Keycloak action):** **U6** (B Steps 1–5): measure (needs ≥15 min idle for cold numbers), tune, decide min-instances, run acceptance.

### Wave 5 — shop ports (after Wave 4, and after U1)

**Batch A:** **U7** (C Step 9 in shop): first ask the user which domain shop uses.
**Batch B (serial after A, shares shop's deploy workflow and Keycloak action):** **U8** (B Step 6 in shop).

## Pre-execute checks (apply before any wave starts)

- `grep -l -i "picked up by agent" plans/*.md plans/deferred/*.md`: today another session tore down and reconfigured the environment while an acceptance run was in flight. Check this before touching the live environment.
- `git pull --ff-only && git status`: confirm no uncommitted changes to the files the wave touches.
- `gh variable list`: confirm the `GCP_*` variables exist before any pipeline run (they're missing right now).
- Only one session at a time runs `./setup-gcp.sh`, `./teardown-gcp.sh` or a stage workflow.

## Autonomous execution (decided 2026-11-03)

`/execute-plan` on this meta-plan executes the units in wave order, not just the coordination. The main session orchestrates. Each unit runs in a subagent with the child plan's path, the unit's steps, this section's rules and its touched files. Independent units in one batch run in parallel. After each unit: verify (build, tests, pipeline run), delete the done steps from the child plan, refresh both ▶ blocks, commit and push.

**Pre-authorized by the user:**
- Running `./teardown-gcp.sh` and `./setup-gcp.sh` for U4, unattended, once U3 and U9 are green. Prod is down while it rebuilds. Answer the teardown confirmation with the project ID from `gh variable get GCP_PROJECT_ID`.
- Triggering `acceptance-stage.yml`, `qa-stage.yml` and `prod-stage.yml`.
- Cloning `optivem/shop` (it lives at `/home/vscode/shop`: `/workspaces` is root-owned) and pushing to its `main` (U1, U7, U8).
- Plan E Step 2: re-creating `v1.3.212`–`214` as `frontend-v1.3.x` and deleting the bare tags.

**User gates (stop, give the exact command or step, and wait):**
- **QA sign-off:** `gh workflow run qa-signoff.yml -f version=<rc> -f result=approved` is the release decision and is always the user's. Before a prod run, stop here.
- **Search Console owner** after every `./setup-gcp.sh`: a web-only step. Give the user the new `GCP_SERVICE_ACCOUNT` email and the owners link `https://www.google.com/webmasters/verification/details?hl=en&domain=techexcellence.io`.
- ~~**U7:** which domain shop uses.~~ Decided 2026-11-03: `shop.optivem.com` (`shop.`, `shop-qa.`; acceptance stays on `run.app`).
- Anything outside the pre-authorized list that is destructive, spends money beyond the known Cloud Run idle cost, or deletes remote state.

**Run rules:**
- **Parallel agents in one checkout:** stage only your own paths and check `git diff --cached --name-only` before committing; on 2026-11-03 a parallel commit (`6a1ccae`) swept in another unit's staged deletions.
- **Shop units (U1, U7, U8) are a two-way merge (user rule, 2026-11-03):** don't copy files from one repo to the other. For each shared file, compare shop's and event-hub's versions hunk by hunk and keep the best combination: event-hub's fixes go into shop, and anything shop does better (handling, messages, checks) comes back into event-hub. Keep only real project differences apart (names, database list, shop's `deploy-config.yml` step). When a unit finishes, both repos have the same logic, and each repo's commit message names what came from the other. A unit can therefore also commit to event-hub.
- Claude Code's auto-mode classifier blocks `./teardown-gcp.sh` and dispatching `prod-stage.yml` even though they are pre-authorized above (2026-11-03): give the user the exact command to run instead.
- Only one stage workflow at a time (QA and prod share the Keycloak instance).
- Prod's `bump-patch-version` pushes to `main`: run `git pull --rebase` before every push.
- After a mapping is created, poll `curl https://<domain>/` for up to 30 min before calling a certificate stuck.

## Out of scope of this meta-plan

- Whether each plan's content is correct (use the plan's own refine cycle).
- `.github/workflows/cleanup.yml:58,67` lists `shop/...` container packages, a likely leftover from the port from `optivem/shop` (noted in plan E); check separately.
- `plans/deferred/*` (CLA activation, AGPL in the gh-optivem config, import/export of all data): none of them is gated by or gates the plans above.
