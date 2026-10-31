# 2026-10-31 10:11:57 UTC — UX diagram of the Tech Excellence meetup speaker process

## TL;DR

**Why:** The meetup organizing procedure exists only as a long document of timing notes, email templates and leftover drafts. The real flow — who acts when, what each check branches to, and where a speaker drops out — is hard to see, so gaps and inconsistencies stay hidden. event-hub will replace these emails with in-app steps, keeping email only for the speaker invitation and step reminders, so that UX needs designing first.
**End result:** A single UX diagram shows the future event-hub journey from first contact to the post-event thank-you, across speaker, speaker coordinator and the other organizers, on a timeline relative to the event date, with every decision point and exit path visible.

## Outcomes

What we get out of this — the goals and deliverables:

- One diagram, versioned in this repo, that shows the whole process at a glance, from filtering potential speakers through to the event itself and the post-event thank-you.
- It is clear who owns each step: the other organizers filter speakers, the speaker coordinator handles the emails, and the speaker responds.
- Every decision has both of its branches drawn: speaker replies or not, materials received or not, and the end point of each path.
- It designs the event-hub flow for both of its user groups, organizers and speakers, as a single full view for the plan's author. It is not published or sent to speakers, so internal rules stay in.
- Timing is readable relative to the event date: 1 month, 3 weeks and 2 weeks before.
- Each of today's emails (FIRST, SECOND, THIRD) is shown as the in-app step that replaces it, labelled so it maps back to the template. The speaker invitation and reminders are the only emails left, and they are drawn distinctly.
- Gaps found in the source procedure are listed next to the diagram, so organizers can fix them via #organizers.

## ▶ Next executable step (resume here)

Run Step 1 of `## Steps`: extract the actors, steps, decisions, timing and email touchpoints, then stop before Step 2 if the extraction contradicts the plan. The sources are not in the repo, so ask the user to paste the procedure and sample thread again. Build the page in Step 2 under `docs/`. The `## Open questions` don't block this.

## Steps

- [ ] Step 1: Extract the process into a structured list of actors, steps, decisions, timing and email touchpoints, using the "Timing" section as the source of truth up to the THIRD EMAIL. The day-of and post-event steps come from "Other Stuff (Ignore)" and the sample thread, so mark them on the diagram as unconfirmed by the written procedure. For each email, record what it achieves (request, confirmation, deadline, instructions) so it can become an in-app step. Check it against the sample speaker email thread supplied in planning. Neither source goes into the repo. Only anonymized findings do, with relative timing and no calendar dates, talk titles or company details.
- [ ] Step 2: Build the diagram as one self-contained HTML page (inline SVG and CSS, no external scripts or fonts) that opens in any browser and prints cleanly to PDF, using swimlanes (Speaker / Speaker coordinator / Other organizers) with phases along the timeline: Filtering → Date reservation → Agenda & materials → Reminders → Review → Publish & announce → Day of event (speaker joins StreamYard at 17:00, co-host setup, audience questions via YouTube chat) → After the event (speaker shares repository, thank-you email, YouTube comment follow-up). Details confirmed by the sample thread:
  - The SECOND EMAIL goes out as soon as the date is confirmed, together with the Google invite. Its due date is 1 month before the event.
  - The reminders chase both the agenda and the materials.
  - The coordinator reviews what the speaker sent (guidelines, title length, shortening the title if needed) before publishing. The "Timing" section has no such step.
  - The THIRD EMAIL goes out when review passes, about 2 weeks before the event, and the announcement follows the next day.
  - Exception paths to draw: an organizer asks to reschedule after confirmation, and another organizer covers while the coordinator is away. In the app, status is shared, so Reply All is no longer needed.
  - The steps above describe today's process. Draw each as the in-app action that replaces it.
  - In-app design decisions:
    - First contact: a new speaker gets one invitation email with a link. It and the reminders are the only emails.
    - Speaker access: speakers have accounts, and the invitation link leads to creating one.
    - Publishing: a checklist the organizer ticks off for Meetup, LinkedIn and Twitter. Automated posting is deferred to a separate plan.
    - Reminders: automatic at 1 month and 3 weeks before the event when the agenda or materials are missing. They go to the speaker, and the coordinator is copied on the final one.
- [ ] Step 3: GDPR constraint: refer to everyone by role only, in the diagram and every committed file. No personal names (organizers or speakers), email addresses or profile links.
- [ ] Step 4: Add a short "Gaps in the procedure" list beside the diagram.
- [ ] Step 5: Check the rendered diagram with the user against the source procedure, step by step, and correct it.

## Open questions

Gaps in the source procedure. None block drawing: if unanswered, use the proposal where there is one, and list the item under "Gaps in the procedure" beside the diagram:

4. **Cancellation path:** The final reminder says the event may be cancelled, but "Timing" has no cancellation step. A cancellation email exists only under "Ignore". Proposed: draw "no materials by 2 weeks before → cancel event" as an end point and list it as a gap.
5. **Speaker can't make the date:** The template marks "tell us which months" as IGNORE, and its "Alternate" email offers one last slot. In the sample thread the coordinator and speaker went back and forth over several months until a date fit. Is the current rule the single alternate slot or the back-and-forth loop? Proposed: draw the loop, since that is what happened in practice.
6. **After no reply to the FIRST EMAIL:** "Ignore them" ends the path for that speaker. Does the slot go to the next speaker via filtering? Should the diagram draw that loop?
7. **Publishing owner:** An "Ignore" note gives the LinkedIn and Twitter announcements to one specific organizer. Should the publish step get its own "Announcements owner" lane, or sit under "Other organizers"?
8. **Checks with no follow-up:** The Google invite acceptance and joining the Meetup group are both requested but never checked in "Timing". Draw them as speaker tasks only, or add checks?
9. **Due date after a reschedule:** In the sample thread the event moved 1 week earlier, but the due date wasn't changed, so it fell about 3 weeks before the event instead of 1 month. Should a reschedule reset the due date? Proposed: list this as a gap.
10. **Speaker-initiated proposals:** In the sample thread a past speaker pitched a new talk, and the coordinator sent an intake form and said the organizers would be in touch if they went ahead. The procedure doesn't cover this. Proposed: draw it as a second way into Filtering. Who decides on these proposals?
