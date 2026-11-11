# 2026-11-11 09:49:55 UTC — Fix the cleanup workflow's GHCR package 404s

## TL;DR

**Why:** The scheduled `cleanup` workflow (run 42946054776) failed in "Cleanup Prereleases". The `bad array subscript` crash is already fixed in optivem/actions `39288c7`, and `v1` points there. That same commit made a 404 on any listed package fail the run. Every package lookup still returns 404, for two reasons. First, event-hub lists stale `shop/*` package names. Second, the shared actions put the package name (which contains `/`) into the API path without URL-encoding it.
**End result:** The cleanup actions URL-encode package names, so they can actually list and delete GHCR versions. event-hub's `cleanup.yml` targets its real packages (`event-hub/backend`, `event-hub/frontend`). The scheduled cleanup goes green in event-hub and in shop, and it really prunes images instead of skipping them.

## Outcomes

- `cleanup-prereleases` and `cleanup-ghcr-orphan-manifests` reach the right GHCR endpoints for packages with a `/` in the name. No more 404s.
- event-hub's `cleanup` workflow runs all three steps green and prunes `event-hub/backend` and `event-hub/frontend`.
- shop's cleanup, which was silently skipping all 7 packages, now prunes them and does not hard-fail.

## ▶ Next executable step (resume here)

Step 1. In the optivem/actions checkout (`<workspace>/academy/actions`), replace `$package` with a URL-encoded copy (`pkg_enc="${package//\//%2F}"`) in the `/orgs/$owner/packages/container/$package/...` paths at `cleanup-prereleases/cleanup-prereleases.sh:109` (list) and `:245` (DELETE), and at `cleanup-ghcr-orphan-manifests/cleanup-ghcr-orphan-manifests.sh:94` (list) and `:161` (DELETE). Keep the human-readable `$package` in log messages. Ship it first, because shop and event-hub both fail hard until it lands.

## Steps

- [ ] Step 1: optivem/actions: URL-encode the package name at the 4 sites listed above. Then grep every action for other `packages/container/$` sites (for example any `check-*`/ghcr helpers) and fix them the same way.
- [ ] Step 2: optivem/actions: run `cleanup-prereleases.sh` locally with dry-run against `optivem/event-hub` and packages `event-hub/backend,event-hub/frontend`. Confirm both list their versions (`event-hub%2Fbackend` returned 12 versions in the diagnosis) and that there are no 404s. Commit via `/commit`, then move the `v1` tag per the actions repo's release convention.
- [ ] Step 3: event-hub: in `.github/workflows/cleanup.yml:58` and `:67`, set `container-packages: event-hub/backend,event-hub/frontend`. Commit via `/commit`.
- [ ] Step 4: Verify: `workflow_dispatch` event-hub `cleanup` with `dry-run=true`. All three steps should go green and list both packages. Then dispatch shop's `cleanup` with `dry-run=true` and confirm all 7 packages list with no 404.
