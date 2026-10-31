# 2026-10-31 11:37:25 UTC — manual test of the event-hub HTML screen prototype

## TL;DR

**Why:** Automated checks showed the prototype's screens exist, link up and don't overflow sideways, but they can't judge whether the journeys make sense or whether the screens match the user flow.
**End result:** A person has clicked every path in `docs/prototype/` against `docs/speaker-organizer-user-flow.html`, on phone and desktop widths, and every problem found is either corrected or noted here.

## Outcomes

- Every journey below has been clicked through by hand.
- Each screen has been judged against its step in the user flow.
- Any problems found are recorded under `## Findings`, then corrected.

## ▶ Next executable step (resume here)

This is manual work. Open `docs/prototype/index.html` by double-clicking it, then do Step 1 of `## Steps`. It links to the two prototypes, and each starts at its own login screen. Keep `docs/speaker-organizer-user-flow.html` open beside it.

## Open questions

None. All are decided, and the screen changes are already made.

1. `speaker-date-closed` no longer has speaker navigation, because this speaker has no event.
2. `speaker-after-event` now links to `speaker-propose-talk`.
3. The made-up "Waiting for reply" row on `organizer-home` stays, because it's sample data.

## Steps

- [ ] Step 1: Speaker journey, in `docs/prototype/speaker/`. Start at login, `index.html`, then go through `email-invitation`, `speaker-set-password`, `speaker-date`, `speaker-home`, `speaker-agenda-materials`, `speaker-home-waiting`, `speaker-event-details`, `speaker-day-of` and `speaker-after-event`.
- [ ] Step 2: Organizer journey, in `docs/prototype/organizer/`. Start at login, `index.html`, then go through `organizer-home`, `organizer-speaker-detail`, `organizer-propose-date`, `organizer-invitation-status`, `organizer-confirm-date`, `organizer-materials-status`, `organizer-review`, `organizer-approve`, `organizer-publish`, `organizer-day-of` and `organizer-after-event`.
- [ ] Step 3: Exit and exception paths. Each prototype stands alone, so start each side from its own login.
  - Date doesn't work. Speaker: `speaker-date`, `speaker-date-closed`. Organizer: `organizer-home`, `organizer-other-date`, then `organizer-invitation-status` or "No slot left".
  - No reply to the invitation. Speaker: `email-invitation`, `email-reminder-reply`. Organizer: `organizer-invitation-status`, back to `organizer-home#potential-speakers`.
  - Missed deadline. Speaker: `speaker-home`, `email-reminder-1-month`, `email-reminder-3-weeks`. Organizer: `organizer-materials-status`, `organizer-cancel-event`.
  - Review doesn't pass. Speaker: `speaker-home-waiting`, `speaker-update-materials`, back to `speaker-home-waiting`. Organizer: `organizer-review`, "Send back to speaker", then `organizer-cancel-event` for a missed update.
  - Speaker drops out. Speaker: `speaker-event-details`, `speaker-cant-make-it`. Organizer: `organizer-home`, `organizer-speaker-dropped`, then `organizer-home#potential-speakers`.
  - Reschedule. Organizer: `organizer-reschedule`, `organizer-confirm-date`.
  - Past speaker proposes a talk. Speaker: `speaker-after-event`, `speaker-propose-talk`. Organizer: the proposal appears in `organizer-home#potential-speakers`.
- [ ] Step 4: Phone and desktop. Repeat one journey at phone width, using the browser's device toolbar or a real phone, and check that text, tables and buttons are readable and easy to tap.
- [ ] Step 5: Record any problems under `## Findings`, and run `/execute-plan` on this file to apply the corrections.

## Findings

None yet. For each problem, add the screen, what you expected and what you saw.
