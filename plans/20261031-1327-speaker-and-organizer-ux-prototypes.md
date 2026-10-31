# 2026-10-31 13:27:47 UTC — Separate speaker and organizer UX prototypes

## TL;DR

**Why:** The current prototype is one set of screens across three roles (Speaker, Speaker coordinator, Other organizers), joined by a role switcher. That doesn't read like the product: nobody really switches roles, and the coordinator/organizer split isn't one we need.
**End result:** Two self-contained, click-through UX prototypes, one for the speaker and one for the organizer. Each starts at a login screen and follows the natural flow from there. Coordinator no longer exists as a role.

## Outcomes

What we get out of this — the goals and deliverables:

- A speaker prototype that starts at login and can be clicked end to end without touching any organizer screen.
- An organizer prototype that starts at login and can be clicked end to end, covering everything the coordinator and "other organizers" did today.
- Only two roles anywhere: Speaker and Organizer. No "coordinator" in screens, file names, mock emails or the user flow doc.
- No role switcher. Each prototype stands alone, and the only way across is an email or a note saying what the other side would see.
- Speakers can't create their own accounts. An organizer initiates each one, and the speaker only sets a password from the invitation.
- Exit and exception paths (date doesn't work, no reply, missed deadline, review doesn't pass, speaker drops out, reschedule) are still reachable within the prototype they belong to.

## ▶ Next executable step (resume here)

Run Step 1. It moves the existing screens in `docs/prototype/` into the two folders, and everything after it depends on that layout. Stay on `main`.

## Steps

- [ ] Step 1: Split `docs/prototype/` into `docs/prototype/speaker/` and `docs/prototype/organizer/`. Speaker gets the 12 `speaker-*` screens. Organizer gets the 12 `coordinator-*` and 4 `organizers-*` screens, renamed to `organizer-*` (`organizers-speakers` becomes `organizer-speakers`, and so on). Fix all links, and give each prototype what it needs from `styles.css`.
- [ ] Step 2: Add an email and password login screen to each prototype as its entry point, and make it each prototype's `index.html`. Speakers can't create their own accounts, so the speaker login has no sign-up link: the organizer creates the account by sending the invitation (`organizer-propose-date`, with a note saying so). Rework `speaker-sign-up` into a "Set your password" screen, reached only from the invitation email, which then continues to the date question. Returning speakers log in as normal. Link `speaker-propose-talk` from the speaker's home so past speakers reach it after login. Move all four mock emails into the speaker prototype, and show a "speaker receives this email" note at the matching organizer steps.
- [ ] Step 3: Add a post-login home for the organizer that brings together the merged screens: events (from `coordinator-home`) and potential speakers (from `organizers-speakers`).
- [ ] Step 4: Rewrite the flow so each prototype reads naturally from login: update "Next in the flow" links and navigation, and remove the role switcher.
- [ ] Step 5: Remove all coordinator wording from screens and mock emails, and drop anything that only existed because of the split, such as handoffs between coordinator and other organizers and the "Covering for ..." banner on `coordinator-home`.
- [ ] Step 6: Replace the "All screens" `index.html` with a short landing page linking to the two prototypes.
- [ ] Step 7: Update `docs/speaker-organizer-user-flow.html` to the two roles: merge the coordinator and other organizers lanes, drop the "Covers" note, and reword the gap table.
- [ ] Step 8: Update `plans/20261031-1137-manual-test-html-prototype.md` to the new journeys and file names, and drop its role switcher step and its "covering" banner decision.
- [ ] Step 9: Replace the leftover shop use cases in `docs/use-cases.md` (Customer, Eventhub Owner, orders, coupons) with Speaker and Organizer as actors and the use cases from the two prototypes. `docs/use-case-narrative.md` follows the same actors. Account creation is an Organizer use case; keep `registrationAllowed: false` in mind when the real realm is set up.
- [ ] Step 10: Click through both prototypes from login, including the exit and exception paths, and check for dead links.
