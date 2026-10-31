# 2026-10-31 11:37:25 UTC — manual test of the event-hub HTML screen prototype

## TL;DR

**Why:** Automated checks showed the prototype's screens exist, link up and don't overflow sideways, but they can't judge whether the journeys make sense or whether the screens match the user flow.
**End result:** A person has clicked every path in `docs/prototype/` against `docs/speaker-organizer-user-flow.html`, on phone and desktop widths, and every problem found is either corrected or noted here.

## Outcomes

- Every journey below has been clicked through by hand.
- Each screen has been judged against its step in the user flow.
- Any problems found are recorded under `## Findings`, then corrected.

## ▶ Next executable step (resume here)

This is manual work. Open `docs/prototype/index.html` by double-clicking it, then do Step 1 of `## Steps`. Keep `docs/speaker-organizer-user-flow.html` open beside it.

## Open questions

None. All are decided, and the screen changes are already made.

1. `speaker-date-closed` no longer has speaker navigation, because this speaker has no event.
2. `speaker-after-event` now links to `speaker-propose-talk`.
3. The "covering" banner on `coordinator-home` alone is enough.
4. The made-up "Waiting for reply" row on `coordinator-home` stays, because it's sample data.

## Steps

- [ ] Step 1: Speaker journey. Start at `email-invitation.html`, then go through sign-up, date, agenda and materials, waiting for review, event details, day of event and after the event.
- [ ] Step 2: Organizer journey. Start at `organizers-speakers.html`, then go through speaker detail, propose date, invitation status, confirm date, materials status, review, approve, publish, day of event and after the event.
- [ ] Step 3: Exit and exception paths.
  - Date doesn't work: `speaker-date`, `coordinator-other-date`, `speaker-date-closed`.
  - No reply to the invitation: `email-reminder-reply`, `coordinator-invitation-status`, back to `organizers-speakers`.
  - Missed deadline: `email-reminder-3-weeks`, `coordinator-cancel-event`.
  - Review doesn't pass: `coordinator-review`, `speaker-update-materials`, back to review.
  - Speaker drops out: `speaker-cant-make-it`, `coordinator-speaker-dropped`.
  - Reschedule: `organizers-reschedule`, `coordinator-confirm-date`.
  - Past speaker proposes a talk: `speaker-after-event`, `speaker-propose-talk`, `organizers-speakers`.
- [ ] Step 4: Role switcher. On a few screens, switch between Speaker, Coordinator and Organizers, and check each lands on that role's home screen.
- [ ] Step 5: Phone and desktop. Repeat one journey at phone width, using the browser's device toolbar or a real phone, and check that text, tables and buttons are readable and easy to tap.
- [ ] Step 6: Record any problems under `## Findings`, and run `/execute-plan` on this file to apply the corrections.

## Findings

None yet. For each problem, add the screen, what you expected and what you saw.
