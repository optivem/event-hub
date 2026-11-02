# 2026-11-02 18:56:38 UTC — Set the AGPL-3.0 license in the gh-optivem config (conditional on a new gh optivem version)

> **Conditional: depends on a new `gh optivem` version.** This plan only applies once a new `gh optivem` release adds an AGPL-3.0 license option. The current version doesn't have one. Until that release exists, do nothing: the config has to keep saying `mit`. If no such release ever comes, this plan never runs.

## TL;DR

**Why:** EventHub is licensed under AGPL-3.0, but `gh-optivem.yaml` says `license: mit`. The installed `gh optivem` has no AGPL-3.0 option, so a comment explains the mismatch. Any `gh optivem` command that reads the license sees the wrong one.
**End result:** `gh-optivem.yaml` says `license: agpl-3.0` (or whatever spelling the release uses), the explanatory comment is gone, and `gh optivem config validate` passes on a released version.

## Outcomes

- `gh-optivem.yaml` names the real license, so the config and `LICENSE` agree
- The workaround comment is removed
- `gh optivem config validate` passes with the new value on a released (not a local dev) build

## ▶ Next executable step (resume here)

Gated: check whether a `gh optivem` release supports AGPL-3.0 (Step 1). If it doesn't, stop and leave this plan deferred. Do not edit `gh-optivem.yaml` before then.

## Steps

- [ ] Step 1: Check the gate. Run `gh extension upgrade optivem` and `gh optivem --version`, then look for an AGPL-3.0 value in the license options (`gh optivem init --help` or the release notes). If there is none, stop here.
- [ ] Step 2: In `gh-optivem.yaml`, change `license: mit  # gh-optivem has no agpl-3.0 option; ...` to `license: <the release's AGPL value>` and remove the comment
- [ ] Step 3: Run `gh optivem config validate` and `gh optivem config preflight` and confirm there are no new license errors. Then grep the repo for anything else that mentions the MIT workaround and fix it.
- [ ] Step 4: Commit on main and delete this plan file in the same commit.

## Decisions

- **Scope:** this plan only waits for the release and then updates event-hub. Adding the AGPL option to gh-optivem itself is not part of it.
