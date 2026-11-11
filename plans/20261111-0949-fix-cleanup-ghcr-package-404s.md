# 2026-11-11 09:49:55 UTC — Fix the cleanup workflow's GHCR package 404s

## TL;DR

**Why:** The scheduled `cleanup` workflow (run 42946054776) failed in "Cleanup Prereleases". The `bad array subscript` crash is already fixed in optivem/actions `39288c7`, and `v1` points there. That same commit made a 404 on any listed package fail the run. Every package lookup still returns 404, for two reasons. First, event-hub lists stale `shop/*` package names. Second, the shared actions put the package name (which contains `/`) into the API path without URL-encoding it.
**End result:** The cleanup actions URL-encode package names, so they can actually list and delete GHCR versions. event-hub's `cleanup.yml` targets its real packages (`event-hub/backend`, `event-hub/frontend`). The scheduled cleanup goes green in event-hub and in shop, and it really prunes images instead of skipping them.

## Outcomes

- `cleanup-prereleases` and `cleanup-ghcr-orphan-manifests` reach the right GHCR endpoints for packages with a `/` in the name. No more 404s.
- event-hub's `cleanup` workflow runs all three steps green and prunes `event-hub/backend` and `event-hub/frontend`.
- shop's cleanup, which was silently skipping all 7 packages, now prunes them and does not hard-fail.

## ▶ Next executable step (resume here)

Step 4. The code is landed: actions `b0a9502` (auto-retagged to `v1` by `update-v1.yml`) and event-hub `cleanup.yml`. Dispatch event-hub `cleanup` with `dry-run=true` and confirm all three steps go green. Then dispatch shop's `cleanup` with `dry-run=true` and confirm all 7 packages list with no 404. If both pass, delete this plan.

## Steps

- [ ] Step 4: Verify: `workflow_dispatch` event-hub `cleanup` with `dry-run=true`. All three steps should go green and list both packages. Then dispatch shop's `cleanup` with `dry-run=true` and confirm all 7 packages list with no 404.
