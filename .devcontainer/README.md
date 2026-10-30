# Dev Container

Reproducible development environment with `gcloud`, `gh`, `terraform`, Docker, Node 22, Java 21, and Claude Code pre-installed, plus what the system tests need (`gh optivem`, Chromium OS libraries). Works identically on Windows, macOS, and Linux.

## Prerequisites

Install once on your host machine:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine (Linux) — **must be running**
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- A `~/.claude/commands` folder — it is bind-mounted into the container, and the container will not start without it

## Setup

1. Open the `event-hub/` folder **directly** in VS Code:
   - If a folder or workspace is already open: **File → Close Folder** (or **Close Workspace**) first.
   - **File → Open Folder…** → navigate to and select the `event-hub/` folder itself (not a parent), then click **Select Folder**.
   - Verify the Explorer sidebar shows `EVENT-HUB` at the top and contains `gh-optivem.yaml` and `.devcontainer/` at the root. If it shows any other folder name, you opened the wrong level.
   - The `.devcontainer/` must sit at the root of the opened folder — multi-root workspaces and parent directories will not work.
2. Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → **Dev Containers: Reopen in Container**.
   - ⚠️ Do **not** pick **Dev Containers: Add Dev Container Configuration Files…** — that creates a new config from templates. The repo already ships one in `.devcontainer/`.
3. First launch builds the image (~3-5 min); subsequent launches are instant.
4. [.devcontainer/post-create.sh](post-create.sh) runs automatically and verifies tooling.

**Troubleshooting:** if you see an **"Add configuration to workspace / user data folder"** prompt or a template picker (Alpine, C#, Show all templates…), VS Code did **not** detect the existing config. Cancel, close the folder, and reopen `event-hub/` directly — do not pick a template, or you'll overwrite the shared config.

**Troubleshooting (Windows):** if the container fails to start with `accessing specified distro mount service: stat /run/guest-services/distro-services/ubuntu.sock: no such file or directory`, Docker Desktop's WSL integration for your distro (e.g. Ubuntu) isn't running. In Docker Desktop → **Settings → Resources → WSL Integration**, enable your distro and click **Apply & Restart**. If it's already enabled, run `wsl --shutdown`, restart Docker Desktop, and try again. This often breaks after a Docker Desktop update, because the distro integration service doesn't always come back up.

**Troubleshooting (Windows):** if every git command in the container prints `warning: safe.directory 'C:/...' not absolute`, your Windows `~/.gitconfig` has `safe.directory` entries with Windows paths, and Dev Containers copies that file into the container. The warnings are harmless, but the proper fix is on the host. `safe.directory` is only needed for repos owned by a *different* user. Check the folder's owner with `(Get-Acl <folder>).Owner` in PowerShell. If it's your own account, the entries are stale, so remove them on Windows with `git config --global --unset-all safe.directory`. If git on Windows later reports "dubious ownership", fix the ownership with `takeown /f <folder> /r /d y` instead of adding `safe.directory` entries back.

## Run the system locally

Run these inside the container terminal. Docker runs inside the container, and the stack ports are forwarded, so the frontend opens from the host browser at <http://localhost:3312> (stub) or <http://localhost:3311> (real).

```bash
gh auth login
gh extension install optivem/gh-optivem
docker compose -f docker/docker-compose.local.stub.yml up -d --build
```

See [system-test/README.md](../system-test/README.md) for running the tests.

## Deploy to Google Cloud Run

`gcloud` and `terraform` are included ahead of the GCP move. The provisioning scripts arrive with `plans/20261030-1931-deploy-pipeline-to-gcp-cloud-run.md`; until then there is nothing to deploy from here.

Run these inside the container terminal:

```bash
gh auth login
gcloud auth login --no-launch-browser
./setup-gcp.sh
gh workflow run acceptance-stage.yml
```

What each step does:
- `gh auth login` — authenticates GitHub CLI (opens browser)
- `gcloud auth login --no-launch-browser` — authenticates Google Cloud CLI (prints a link to open in the host browser)
- `./setup-gcp.sh` — creates GCP project, enables APIs, configures Workload Identity Federation, sets GitHub repo variables/secrets
- `gh workflow run …` — triggers the acceptance-stage workflow against the newly provisioned cloud infra

To tear everything down later: `./teardown-gcp.sh`

## Pinned tool versions

Versions are pinned in [devcontainer.json](devcontainer.json). Update in one place; every dev gets the same env.

| Tool      | Version |
|-----------|---------|
| gh        | 2.67.0  |
| gcloud    | 590.0.1 |
| terraform | 1.10.3  |
| node      | 22      |
| java      | 21      |
| claude    | latest  |

## Claude Code

Login state lives in the `event-hub-claude-config` volume, so it survives rebuilds. `CLAUDE_CONFIG_DIR` points at `~/.claude` so that `.claude.json` (normally in `$HOME`, which is wiped on rebuild) is stored in the volume too. Your host's personal slash commands (`~/.claude/commands`, e.g. `/execute-plan`, `/create-plan`, `/commit`) are bind-mounted read-only on top of it. Edit them on the host; the container sees changes immediately. The host folder must exist before the container starts.

## Rebuilding after config changes

Command Palette → **Dev Containers: Rebuild Container**.
