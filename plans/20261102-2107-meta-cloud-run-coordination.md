# 2026-11-02 21:07 UTC — Plan coordination meta-plan: Cloud Run follow-ups

**Plans analysed:** 4 in-scope, 3 referenced-only (`plans/deferred/*`; none are dependencies of an in-scope plan)

**Live environment (updated 2026-11-02, after U0):** `./setup-gcp.sh` succeeded and created GCP project `event-hub-686953` (us-central1), the Neon project `event-hub` (5 databases), both secrets and the `GCP_*` / `SYSTEM_NAME` repo variables. `CUSTOM_DOMAIN=techexcellence.io` is set. The deployer is `github-deployer@event-hub-686953.iam.gserviceaccount.com`; it is not yet a Search Console owner (C Step 1).

## ▶ Next executable step (resume here)

User track (blocks everything in event-hub): C Step 1, add `github-deployer@event-hub-686953.iam.gserviceaccount.com` as an owner of `techexcellence.io` in Webmaster Central. Then C Step 4: CNAMEs `events`, `events-qa`, `auth` → `ghs.googlehosted.com.` at Namecheap, run QA and prod once, and wait for `✅ … is ready`. Then U3: `/execute-plan plans/20261102-1954-custom-domains-for-cloud-run.md` (agent does C Steps 5–6).

In parallel, any time: U1 (plan D) in an `optivem/shop` checkout. It touches only shop and blocks nothing in event-hub until Wave 5.

## Per-plan status snapshot

| Plan | Status | Items done / total | Touched files (primary) | Notes |
|---|---|---|---|---|
| `20261030-1931-deploy-pipeline-to-gcp-cloud-run` (**A**) | refined; only Step 10 left | 9 / 10 | none planned; `setup-gcp.sh` only if `ACCOUNT_STATE_INVALID` recurs | Step 10 is explicitly after **C** Step 6. User runs teardown → setup → acceptance |
| `20261102-1953-reduce-cloud-run-cold-start-latency` (**B**) | refined (2026-11-03); gated on U4 | 0 / 6 | `scripts/measure-latency.sh` (new), `backend/Dockerfile`, `.github/workflows/_deploy-cloud-run.yml`, `.github/actions/deploy-keycloak-cloud/action.yml`, `README.md`; Step 6 in `optivem/shop` | Open questions resolved; executes after U4 |
| `20261102-1954-custom-domains-for-cloud-run` (**C**) | refined; Steps 2–3 done | 2 / 9 (Step 1 partly done: `CUSTOM_DOMAIN` set, domain verified) | `.github/workflows/_deploy-cloud-run.yml`, `.github/actions/deploy-keycloak-cloud/action.yml`, `.github/actions/build-cloud-images/action.yml`, `docker/keycloak/Dockerfile.cloud`, `docker/keycloak/{cloud,prod}-realm.jq`, `README.md` / deploy docs; Step 9 in `optivem/shop` | Steps 1 and 4 are user steps (Search Console, DNS) |
| `20261102-2015-sync-gcp-scripts-to-shop` (**D**) | refined, ready | 0 / 5 | `optivem/shop`: `teardown-gcp.sh`, `setup-gcp.sh`, `terraform/state-backend.sh` | Runs from a shop checkout; doesn't need event-hub's live environment |

## Dependency graph

```
C Steps 1,4 (user) ─► C Steps 5,6 ─► A Step 10 ─┐
                                                ├─► C Step 7 ─► C Step 8 ─► C Step 9 (shop)
                                                │
             (needs-decision #1, default edge)  └─► B Steps 1–5 ─► B Step 6 (shop)

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
| U1 | **D** (all) | standalone, in `optivem/shop` | shop `teardown-gcp.sh`, `setup-gcp.sh`, `terraform/state-backend.sh` |
| U3 | **C** Steps 1, 4 (user), 5, 6 (agent) | standalone | `_deploy-cloud-run.yml`, `deploy-keycloak-cloud/action.yml`, `build-cloud-images/action.yml`, `docker/keycloak/*` |
| U4 | **A** Step 10 + **C** Step 7 | atomic single session | none planned (pipeline runs); `setup-gcp.sh` only if a service-account wait turns out to be needed |
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
- **U0 + C Step 1 (user):** ~~`./setup-gcp.sh`~~ (done 2026-11-02, project `event-hub-686953`), then add `$(gh variable get GCP_SERVICE_ACCOUNT)` as an owner in Webmaster Central. `CUSTOM_DOMAIN` is already set and `techexcellence.io` is verified (2026-11-02).

### Wave 2 — after the user track of Wave 1

**Batch A (serial, 1 session):**
- **U3:** C Step 4 (user: CNAMEs `events`, `events-qa`, `auth` → `ghs.googlehosted.com.`, run QA and prod once, wait for `✅ … is ready`), then C Steps 5 and 6 (agent). `/execute-plan plans/20261102-1954-custom-domains-for-cloud-run.md`.

### Wave 3 — after C Step 6 lands

**Batch A (serial, 1 session, user and agent together):**
- **U4:** A Step 10 + C Step 7, atomic (Consolidation #1): `./teardown-gcp.sh` → `./setup-gcp.sh` → re-add the new deployer service account as a Search Console owner → wait about 5 min → `gh workflow run acceptance-stage.yml` → QA → prod → login on `events.techexcellence.io`. If `ACCOUNT_STATE_INVALID` comes back, add the service-account wait to `setup-gcp.sh` and a matching step to plan **D**, or to shop directly if D has already landed.

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

## Out of scope of this meta-plan

- Whether each plan's content is correct (use the plan's own refine cycle).
- Actual execution (use `/execute-plan` against each plan in turn).
- `plans/deferred/*` (CLA activation, AGPL in the gh-optivem config, import/export of all data): none of them is gated by or gates the plans above.
