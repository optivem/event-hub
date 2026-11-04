# 2026-11-03 23:02 UTC — Organizer prototype: assignment follow-ups

## TL;DR

**Why:** The organizer prototype (`docs/prototype/organizer/`) was reviewed screen by screen. Two decisions were made and committed: organizers are assigned when the invitation is sent, and the Events list is grouped by whose turn it is. The review is not finished, and one design question is still open.
**End result:** The review of the Events tabs and the date-reservation screens is finished, the host and co-host question is answered, and the prototype is published somewhere the user can click through on a phone.

## Outcomes

- Every Events tab (Assigned to me, Unassigned, All, Past) and every date-reservation screen has been looked at in a browser and commented on
- The host and co-host question has a decision, and the prototype shows it
- The prototype can be opened on a phone

## ▶ Next executable step (resume here)

Step 1: ask the user whether the host and co-host do different things, then continue the screen-by-screen review from the **All** tab.

## Steps

- [ ] Step 1: **Host and co-host.** Ask whether they have different duties or are interchangeable reviewers. If different (for example only the host publishes or approves), add a role per assignee to the assignee pickers (`organizer-propose-date.html`, `organizer-confirm-date.html`, `organizer-assignees.html`, `assignees.js`) and to the Assignees cards. If interchangeable, change nothing. On the Day of event screen, "co-host" already means the speaker added as a Meetup co-host, so use another word for organizers (for example "second host")
- [ ] Step 2: Review the **All** and **Past** tabs of `organizer-events.html` with the user, one at a time, and apply their comments
- [ ] Step 3: Load the four date-reservation screens in a browser and check the new Assignees picker and cards render correctly: `organizer-propose-date.html`, `organizer-invitation-status.html`, `organizer-other-date.html`, `organizer-confirm-date.html`. Also check the Date accepted and Other months rows on the All tab
- [x] Step 4: Published on 2026-11-04 from `docs/prototype/` (leaving out `speaker/$S/dialog.png`) as the artifact https://claude.ai/artifact/NHgZ4UQQGFw3sCQN3eToac. Not yet checked there: that the account menu and role switching work on the artifact host (`account.js` finds the role from `/organizer/` in the URL path)
- [ ] Step 5: **Investigate the leftover git stash, then delete it or keep it.** `git stash list` shows `stash@{0}: autostash`, made on 2026-10-31 13:46 UTC. It edits two plans that have since been finished and deleted: `plans/20261031-1137-manual-test-html-prototype.md` (deleted in `e2936b8`) and `plans/20261031-1327-speaker-and-organizer-ux-prototypes.md` (deleted in `1b74094`). Look at `git stash show -p stash@{0}`. If nothing in it is still needed, `git stash drop`. If something is, move it into a current plan first

## Decisions

- **Assign when the invitation is sent** (committed `a8a64f8`): the organizer who sends it is ticked by default, and *Confirm the date* keeps the picker for changes. Reservation has real work (the reply, the reminder, proposing another date, confirming) that needs an owner. Before, those tasks showed to every organizer and nobody owned them
- **Assignee and "waiting on" are separate** (committed `cc364cd`): the assignee is the stable owner and says which tab an event is in. "Waiting on" is whose turn it is, derived from the event's state and never stored, and it moves back and forth between you, a co-assignee and the speaker. Assigned to me has two cards, **Your turn** and **Waiting on others**, and the All tab shows a "Waiting on: X" tag on each row
- **Keep "Waiting on others"** rather than "Waiting for the speaker": several assignees are valid (a host and a co-host), so a wait on a co-assignee is real
- **Unassigned means one thing:** an event whose assignees were all removed
- **Not changed:** the speaker screens, and Potential speakers, where an uninvited proposal still has no assignees because nobody has invited them
