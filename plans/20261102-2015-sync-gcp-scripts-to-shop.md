# 2026-11-02 20:15:01 UTC — Sync the fixed GCP setup and teardown scripts to optivem/shop

## TL;DR

**Why:** Running `./teardown-gcp.sh` in event-hub on 2026-11-02 found three bugs. `optivem/shop` has the same bugs, because event-hub's scripts were ported from it. Shop's teardown says the GitHub variables were removed when none were, and running it a second time breaks.
**End result:** Shop's `teardown-gcp.sh` deletes its GitHub variables, says so in the closing banner when something fails, and can be run again safely. Running it twice ends with "already clean" and exit 0. Shop's GCP helper scripts also include event-hub's ADC quota-project handling.

## Outcomes

- Shop's teardown deletes the GitHub repo variables. It no longer passes the unsupported `--yes` flag to `gh variable delete`
- If any delete fails, step 3 and the closing banner both say so ("Teardown Complete — with warnings"), instead of a ✅
- Running teardown again is idempotent: no `exit 1`, no Terraform "No outputs found" text leaking into `PROJECT_ID`, and leftover Neon or GitHub pieces still get cleaned up
- The confirmation prompt names the **GCP** project ID
- Shop-specific behaviour is kept: step 4 still removes `deploy-config.yml`

## ▶ Next executable step (resume here)

Step 1, in a checkout of `optivem/shop`: port the event-hub teardown commits `dd19381`, `e1e1269` and `1d4d5b4` into shop's `teardown-gcp.sh` by hand. Don't copy the file over; shop has an extra step 4 (see the Findings below).

## Findings (2026-11-02, compared with shop `main`)

- Shop's `teardown-gcp.sh` has all three bugs: `gh "$kind" delete "$name" --yes` (line 117), `terraform output -raw project_id/system_name` (lines 51–52), `exit 1` on an empty state (lines 47 and 56), and the prompt "Type the project ID to confirm" (line 71).
- Shop's teardown has a 4th step that event-hub doesn't have: it removes `deploy-config.yml` (setup writes that file), and its banner says "Your GitHub Actions will fall back to Docker deployment." Keep both, and renumber the steps as `n/4`.
- Shop's `setup-gcp.sh` is not affected by today's bugs. It reads `terraform output -raw` straight after `apply`, so the outputs always exist there. Its other differences from event-hub are shop-specific (database list, `deploy-config.yml`, workflow name), apart from the ADC item below.
- Event-hub has a `set_adc_quota_project` helper in `terraform/state-backend.sh` that shop lacks. Event-hub calls it from `use_state_project_for_quota` and from `setup-gcp.sh` once the project exists. It stops Terraform warning about a missing quota project, and stops a quota project left over from a torn-down system from breaking later calls.

## Steps

- [ ] Step 1: Port the teardown fixes into shop's `teardown-gcp.sh`. Use event-hub's `teardown-gcp.sh` (as of `1d4d5b4`) as the reference:
  - Read the Terraform outputs with `terraform output -json` + `jq` (`.project_id.value // empty`), not `-raw`
  - When there's no state project or no `project_id`, don't exit. Fall back to `SYSTEM_NAME` or a name derived from the repo, using the same rule as `terraform/main.tf`. Skip the Terraform step with "(skipped: no GCP project in the Terraform state)"
  - Before confirming, list which GitHub variables actually exist (`LEFTOVER_VARIABLES`). If there's no project, no Neon project and no variables, print "✅ Nothing to tear down — already clean." and exit 0. Decide whether a leftover `deploy-config.yml` also counts as "something to tear down" in shop (recommended: yes)
  - Prompt: "Type the GCP project ID to confirm". With no GCP project, ask for the system name instead
  - Drop `--yes` from `gh variable delete`. Set `GH_DELETE_FAILED=1` on any real failure, and show it in step 3 and in the closing banner ("Teardown Complete — with warnings" plus a `gh variable delete <name>` hint)
  - Wrap the billing lookup and `terraform destroy` in `if [[ -n "$PROJECT_ID" ]]`, and keep the `cd -` balanced: step 4 currently relies on `cd -` from the terraform directory
- [ ] Step 2: Port `set_adc_quota_project` into shop's `terraform/state-backend.sh`, and call it from `use_state_project_for_quota` and from `setup-gcp.sh` after the project is created (event-hub `setup-gcp.sh`, right after `DB_PREFIX=`).
- [ ] Step 3: Verify in shop. Run `bash -n` on both scripts. Run `./teardown-gcp.sh < /dev/null` against shop's live project: it must stop at the prompt and print the right GCP project, Neon project and variable list, with no Terraform warning text. Don't confirm unless a real teardown is wanted. If shop is ever torn down, run it a second time and expect "already clean" with exit 0.
- [ ] Step 4: Commit in shop, listing the event-hub commits that were ported.
