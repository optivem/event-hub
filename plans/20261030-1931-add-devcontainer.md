# 2026-10-30 19:31:32 UTC — Add a dev container

## TL;DR

**Why:** `event-hub` has no `.devcontainer/`, so everyone installs Java, Node, Docker and the CLIs by hand. The GCP move adds `gcloud` and `terraform` to that list.
**End result:** Opening the repo in a dev container gives the full toolchain at the versions CI uses, adapted from `academy/shop/.devcontainer` and trimmed to what this repo needs.

## Outcomes

What we get out of this — the goals and deliverables:

- A fresh machine can build and test the backend, frontend and system tests with only Docker and VS Code installed
- Java 21 and Node 22 match `backend-commit-stage.yml` and `frontend-commit-stage.yml`
- `docker-compose.local.*.yml` runs inside the container, so the system can be started and tested there
- `gh`, `gcloud` and Claude Code logins survive a container rebuild
- `./setup-gcp.sh` can run from inside the container, with no local install of `gcloud` or `terraform`

## ▶ Next executable step (resume here)

**Step 1:** create `.devcontainer/devcontainer.json` from `academy/shop/.devcontainer/devcontainer.json`, applying the table below, and regenerate `devcontainer-lock.json` for the trimmed feature set. Then continue through Step 4's verification.

## What to take from `academy/shop`

| Item in `shop` | `event-hub` | Reason |
|---|---|---|
| Base image `devcontainers/base:ubuntu-24.04` | Keep | Same setup |
| `gh` 2.67.0 | Keep | `gh optivem` and all GitHub work |
| `docker-in-docker` | Keep | Local compose stacks |
| Node 22 | Keep | Frontend and system tests |
| Java 21 (Temurin, no Gradle) | Keep | Backend; the repo ships `gradlew` |
| `gcloud` 590.0.1 | Keep | GCP plan |
| `terraform` 1.10.3 | Keep | GCP plan |
| Claude Code feature | Keep | Same workflow as `shop` |
| .NET 8 | **Drop** | No .NET code here |
| PowerShell | **Drop** | Only needed for `shop`'s multi-language tooling, as far as this repo shows |
| Volumes `shop-*-config` | **Rename** to `event-hub-*-config` | Avoid sharing login state with `shop` |
| `~/.claude/commands` bind mount | Keep | Personal slash commands; the host folder must exist first |
| `CLAUDE_CONFIG_DIR` | Keep | Keeps `.claude.json` in the volume |
| Extensions: Terraform, Cloud Code, GitHub Actions, Docker | Keep, **add** `vscjava.vscode-java-pack` | Backend is Java; `shop` relies on the Java feature alone |
| `post-create.sh` | Adapt | Drop the `dotnet` and `pwsh` checks; use `system-test` instead of `system-test/typescript` for Playwright deps |
| `forwardPorts: []` | **Change** to `3311, 8311, 8391, 9311, 3312, 8312, 8392, 9312` | The local stacks are opened from the host browser |
| README | Adapt | Keep the setup and Windows troubleshooting sections; update the deploy commands |

## Steps

- [ ] Step 1: Add `.devcontainer/devcontainer.json` and regenerate `devcontainer-lock.json`
- [ ] Step 2: Add `.devcontainer/post-create.sh`, adapted as in the table
- [ ] Step 3: Add `.devcontainer/README.md`, adapted as in the table, and link it from the root `README.md`
- [ ] Step 4: Verify in a fresh container: `post-create.sh` reports no missing tools, `./gradlew build` passes in `backend/`, the frontend builds, and the local stub stack starts with smoke tests green

## Open questions

- **Terraform and `gcloud` before the GCP plan lands?** Recommended: include them now; they are only used once `plans/20261030-1931-deploy-pipeline-to-gcp-cloud-run.md` runs, and including them avoids a second rebuild.
- **Plan order:** Recommended: do this plan first, so the GCP provisioning can run from inside the container.
