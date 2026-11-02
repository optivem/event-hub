# 2026-10-31 22:56 UTC — organizer views and event assignees

## TL;DR

**Why:** The organizer home mixes every event, potential speakers and prototype shortcuts on one page, so an organizer can't see what's theirs. Nothing in the product says who is responsible for reviewing an event.
**End result:** Organizers land on My events, can see everything in All events, and an agenda or materials task is approved only when all of the event's assignees have approved it.

## Outcomes

- My events is the organizer's home and shows the events assigned to them.
- All events shows every event with its assignees and approval count.
- Potential speakers has its own page.
- Events can have one or more assignees, and only assignees can review and approve.
- A task is approved only when every assignee has approved it.
- `docs/use-cases.md` and the prototype describe the same behaviour.

## ▶ Next executable step (resume here)

Do Step 1 of `## Steps`. No files have been changed for this plan yet.

## Resolved decisions

1. Agenda and materials are approved separately. This catches a wrong agenda before the speaker builds slides around it. It means a new agenda review step, the checklist divided between the two, and agenda-only feedback in the speaker's flow. The speaker can still work ahead, but materials built on an agenda that's later sent back may need rework.
2. An event gets its assignees at date confirmation. The confirming organizer chooses one or more, defaulting to themselves, so the event appears in My events from the start.

## Decisions

### What assignment means

- Being assigned to an event means being responsible for reviewing and approving it. It is not general ownership.
- Only assignees can use **Passes**, **Send back to speaker** and **Approve and share**. Other organizers can read the review but not act on it.
- All other work stays open to every organizer: inviting, confirming dates, tracking materials, publishing, rescheduling and cancelling. An event doesn't stall on those while an assignee is away.

### Approval rule

A task is approved only when every assignee has approved it. One assignee is the same rule with one person, so there is no separate approval path.

| Situation | Behaviour |
|---|---|
| One assignee sends it back and another has already approved | It goes to the speaker straight away |
| Speaker resubmits | All approvals on that task are cleared |
| An assignee edits the title after someone else approved | Approvals are cleared |
| An assignee is away and the event is stuck | Any organizer can reassign or remove them |
| An assignee is removed | Their pending approval goes away, and the task completes if everyone left has approved |
| The last assignee is removed | The event goes back to unassigned |
| An assignee is added partway through | They must approve any unapproved task, and finished tasks stay approved |

### Views

- **My events (home):** the events assigned to you. Events waiting on your approval come first. Once you've approved, an event drops down even if it's waiting on another assignee. Events waiting on the speaker sit below those.
- **All events:** one row per event, showing assignees, status and approval count. Unassigned events stand out, and the list can be filtered by assignee.
- **Potential speakers:** moved to its own page, because proposals don't belong to an event yet.
- **Task progress:** each task shows who has approved and who's pending, for example "Agenda: 1 of 2 approved. Waiting for [name]".

## Steps

- [ ] Step 1: In `docs/use-cases.md`, add an Assign Reviewers use case and describe the assignment and approval rules.
- [ ] Step 2: Replace `organizer-home.html` with My events, and add All events and Potential speakers pages. The current "Speakers and events" table has one row per speaker, so All events needs one row per event.
- [ ] Step 3: Turn the "Other steps for this event" card on the home page into next-action items in My events.
- [ ] Step 4: Change the top nav on every organizer page to My events, All events, Potential speakers and Settings. Materials, Publish and Reschedule move inside the event, because they only make sense for a specific event. Update links that point to `organizer-home.html#potential-speakers`.
- [ ] Step 5: Add assignee selection to `organizer-confirm-date.html`, defaulting to the confirming organizer, and add a way to reassign from the event.
- [ ] Step 6: Update `organizer-review.html` and `organizer-approve.html` to show assignees and approval progress, and add a sample read-only state for organizers who aren't assigned.
- [ ] Step 7: Split the review into agenda and materials steps and update the speaker's screens and the phases on both sides.
- [ ] Step 8: Update `administrator-remove-organizer.html` to deal with the events the organizer is assigned to.
- [ ] Step 9: Update `docs/speaker-organizer-user-flow.html` and the manual test steps in `plans/20261031-1137-manual-test-html-prototype.md`.
