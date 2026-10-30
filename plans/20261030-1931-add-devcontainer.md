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

**Step 4, run by a human or with `@devcontainers/cli` allowed:** the `.devcontainer/` files exist but have never been built. Reopen the repo in the container and run the checks in Step 4. `devcontainer-lock.json` was derived from `shop`'s lockfile, not generated, so also run `devcontainer upgrade --workspace-folder .` from PowerShell. Don't use Git Bash: it sets both `HOME` and `USERPROFILE`, which doubles the `~/.claude/commands` mount path.

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

- [ ] Step 4: Verify in a fresh container: `post-create.sh` reports no missing tools, `./gradlew build` passes in `backend/`, the frontend builds, and the local stub stack starts with smoke tests green

## Open questions

None — all resolved before execution: `gcloud` and `terraform` are included now, and this plan runs before `plans/20261030-1931-deploy-pipeline-to-gcp-cloud-run.md`.
