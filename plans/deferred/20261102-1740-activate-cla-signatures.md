# 2026-11-02 17:40:09 UTC — Activate CLA signature collection

> **Deferred.** Start this only when EventHub gets its first pull request from an outside contributor. Until then, every commit is ours, so there's nothing to sign.

## TL;DR

**Why:** EventHub is AGPL-3.0, and we may sell it as SaaS to meetup groups. To keep the right to relicense or sell commercial licenses, every outside contributor must sign `CLA.md`. The CLA workflow (`.github/workflows/cla.yml`) is already in place but disabled, because it can't store signatures yet: the signatures repo and its token don't exist.
**End result:** when an outside contributor opens a pull request, the CLA bot asks them to sign. Their signature is recorded in the private `optivem/cla-signatures` repo, and the pull request can only be merged once they've signed.

## Outcomes

- Outside pull requests show a passing CLA check once the contributor has signed.
- Signatures (contributor GitHub usernames) are stored in the private `optivem/cla-signatures` repo, never in event-hub, in line with our rule of keeping personal identifiers out of repo files.
- `CLA.md` has been reviewed by a lawyer before we rely on it commercially.

## ▶ Next executable step (resume here)

Wait for the trigger: the first pull request from someone outside optivem. Then do Step 1. Creating the repo and the token is manual, because Claude Code isn't allowed to create the repo.

## Steps

- [ ] Step 1: Create the private signatures repo with a `main` branch: `gh repo create optivem/cla-signatures --private --add-readme`.
- [ ] Step 2: Create a fine-grained personal access token with **Contents: read and write** on `optivem/cla-signatures` only. Add it to event-hub as the Actions secret `CLA_SIGNATURES_TOKEN`.
- [ ] Step 3: Re-enable the CLA workflow. It was disabled on 2026-11-02 so outside pull requests don't hit a failing check before this plan is activated: `gh workflow enable cla --repo optivem/event-hub`. Then, on the outside pull request, comment `recheck`. Confirm the bot posts the signing instructions, and that after the contributor signs, `signatures/event-hub-cla.json` appears in `optivem/cla-signatures` and the check turns green.
- [ ] Step 4: Optional, but do it before selling EventHub commercially: have a lawyer review `CLA.md`. It's a standard template, not legal advice.
- [ ] Step 5: Move this plan out of `plans/deferred/`, or delete it once done.
