# 2026-11-03 11:58 UTC — Give the frontend its own release-tag prefix

## TL;DR

**Why:** Prod tags the frontend component release as `v<frontend version>` (`v1.3.214`), the same prefix the system release uses (`v1.0.228`, RCs `v1.0.228-rc.N`). The frontend's `v1.3.x` sorts above every system `v1.0.x` tag. When no RC tag is left, QA's "Resolve Latest RC" falls back to the highest `v*` tag, picks a frontend tag, and fails because GHCR has no images under that tag. This happened on 2026-11-03.
**End result:** Frontend release tags are `frontend-v<version>`, like the backend's `backend-v<version>`. Only system releases and RCs use the bare `v` prefix, so a QA or prod run without `-f version=…` always resolves a system tag.

## Outcomes

- `prod-stage.yml` publishes `frontend-v<version>` and checks for an existing `frontend-v<version>` before tagging
- `bump-patch-version.yml` bumps `frontend/VERSION` when a `frontend-v*` tag advances
- The existing frontend tags `v1.3.212`–`v1.3.214` exist as `frontend-v1.3.212`–`frontend-v1.3.214` on the same commits, and the bare `v1.3.x` tags are gone
- The next prod release proves it: it publishes `frontend-v1.3.215`, and the bump commit says `post frontend-v1.3.215`

## ▶ Next executable step (resume here)

Step 2 (user): the `frontend-v1.3.212`–`frontend-v1.3.214` tags exist. Delete the bare tags: `git push origin :refs/tags/v1.3.212 :refs/tags/v1.3.213 :refs/tags/v1.3.214` (and `git tag -d v1.3.212 v1.3.213 v1.3.214` locally). Step 3 follows on the next prod release (U4).

## Findings (2026-11-03)

- `bump-patch-version.yml:36–38`: `VERSION` → `v`, `backend/VERSION` → `backend-v`, `frontend/VERSION` → `v`. Commit `6677649` fixed the **system** prefix (`multitier-java-v` → `v`); the frontend shared `v` before that.
- `prod-stage.yml:194–195` builds the "already released?" tag as `v${version}` for everything but the backend. `prod-stage.yml:236` publishes `v${frontend}`.
- `qa-stage.yml:49` and `prod-stage.yml:55` resolve with `tag-prefix: v`, so they see the frontend tags.
- Only three frontend tags exist: `v1.3.212`, `v1.3.213`, `v1.3.214`.
- GHCR image tags are a separate matter: `compose-tags` defaults to `v{version}` for both component images (`backend:v1.5.x`, `frontend:v1.3.x`). Each image has its own tag namespace and nothing resolves them by prefix, so they stay `v`.
- `optivem/actions/bump-patch-versions` probes the exact tag `{value}{current-version}` with `git ls-remote`; it does not search by prefix. `frontend-v` works the same as `backend-v`.
- Done: `prod-stage.yml` now checks and publishes `frontend-v<version>`; `bump-patch-version.yml` uses `frontend-v` for `frontend/VERSION`.

## Open questions

All resolved before execution (2026-11-03):

- **The old `v1.3.x` tags:** re-create them as `frontend-v1.3.x` on the same commits, then delete the bare ones. The user approved the remote tag deletion for `v1.3.212`, `v1.3.213` and `v1.3.214` in advance (Step 2 needs no further go-ahead)

## Steps

- [ ] Step 2 (pre-approved 2026-11-03): `frontend-v1.3.212`, `frontend-v1.3.213` and `frontend-v1.3.214` exist on the same commits as the bare tags. Only the deletion of the bare tags remains; the user runs `git push origin :refs/tags/v1.3.212 :refs/tags/v1.3.213 :refs/tags/v1.3.214`.
- [ ] Step 3: Verify on the next prod release (U4 in the meta-plan): it publishes `frontend-v1.3.215`, no `v1.3.215` appears, and the bump commit says `post frontend-v1.3.215`. Then run `qa-stage.yml` once **without** `-f version=` after the RC cleanup, and check that it resolves a system tag.

## Note (out of scope)

`.github/workflows/cleanup.yml:58,67` lists `shop/...` container packages. It looks like a leftover from the port from `optivem/shop`. Check separately.
