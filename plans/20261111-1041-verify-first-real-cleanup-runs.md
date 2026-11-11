# 2026-11-11 10:41:26 UTC — Verify the first real cleanup runs after the GHCR fixes

## TL;DR

**Why:** On 2026-11-11 the GHCR cleanup actions got three fixes: package names are now URL-encoded (actions `b0a9502`), orphan-manifest inspection fails hard (actions `3253c81`), and event-hub's package list is corrected. Only dry runs have exercised the fixes so far. Shop has been skipping its 7 packages for months, so its first real run will delete things for the first time.
**End result:** The first scheduled, real `cleanup` runs (23:00 UTC, 2026-11-11) in event-hub and shop are confirmed green. They deleted roughly what the dry runs predicted, and every image that is still tagged remains intact.

## Outcomes

- Both runs are green, with all 3 steps green and no 404s or `::error` lines.
- Every configured package was processed. In event-hub that's `event-hub/backend` and `event-hub/frontend`. In shop it's the 7 `shop/monolith-system-*` and `shop/multitier-*` packages.
- The orphan step protected live children: "protected child digests" is non-zero for every package. Dry-run baselines were 8 and 10 for event-hub and about 850–970 per shop package.
- Deletion counts are close to the dry-run baselines:
  - event-hub: 0 deployments, 1 prerelease item, 0 orphans.
  - shop: 12 deployments, 8 prerelease items, 1 orphan manifest.
- The latest tag of each package still resolves with all of its children, so no live image was broken.

## ▶ Next executable step (resume here)

Step 1, any time after 2026-11-11 23:30 UTC. For each repo, run `gh run list --repo optivem/<repo> --workflow cleanup.yml --event schedule --limit 1`, and confirm the newest run started after 2026-11-11 23:00 UTC and concluded `success`. If a run failed, stop and run `/fix-bug <run link>`.

## Steps

- [ ] Step 1: Find the first scheduled run after 2026-11-11 23:00 UTC in `optivem/event-hub` and `optivem/shop` (`gh run list --workflow cleanup.yml --event schedule --limit 1`). Confirm both concluded `success`. On a failure, run `/fix-bug <run link>` and stop.
- [ ] Step 2: For each run, check the logs: `gh run view <id> --log | grep -E "Fetching Docker versions|^.*Package |protected child|404|::error|Deleted|deleted|Dry run"`. Confirm every package is listed, there are no 404s or `::error` lines, protected child digests are non-zero per package, and the deletion counts are near the Outcomes baselines. Investigate any count that is far above its baseline, especially orphan deletions.
- [ ] Step 3: Confirm that tagged images still resolve. For each package, run `docker buildx imagetools inspect ghcr.io/optivem/<package>:<latest tag>`, getting the latest tag from `gh api /orgs/optivem/packages/container/<package-url-encoded>/versions --jq '.[0].metadata.container.tags'`. It should resolve without `manifest unknown` and list its platform/attestation children. On Windows Git Bash, prefix `gh api` with `MSYS_NO_PATHCONV=1`.
- [ ] Step 4: If everything checks out, delete this plan and commit.
