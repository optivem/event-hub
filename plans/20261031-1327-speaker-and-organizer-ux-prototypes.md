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
- Exit and exception paths (date doesn't work, no reply, missed deadline, review doesn't pass, speaker drops out, reschedule) are still reachable within the prototype they belong to.

## ▶ Next executable step (resume here)

Planning is still open: settle `## Open questions` with `/refine-plan`, then run Step 1. It moves the existing screens in `docs/prototype/` into the two folders, and everything after it depends on that layout.

## Steps

- [ ] Step 1: Split `docs/prototype/` into `docs/prototype/speaker/` and `docs/prototype/organizer/`. Speaker gets the 12 `speaker-*` screens. Organizer gets the 12 `coordinator-*` and 4 `organizers-*` screens, renamed to `organizer-*` (`organizers-speakers` becomes `organizer-speakers`, and so on). Fix all links, and give each prototype what it needs from `styles.css`.
- [ ] Step 2: Add a login screen to each prototype as its entry point, and make it each prototype's `index.html`.
- [ ] Step 3: Add a post-login home for the organizer that brings together the merged screens: events (from `coordinator-home`) and potential speakers (from `organizers-speakers`).
- [ ] Step 4: Rewrite the flow so each prototype reads naturally from login: update "Next in the flow" links and navigation, and remove the role switcher.
- [ ] Step 5: Remove all coordinator wording from screens and mock emails, and drop anything that only existed because of the split, such as handoffs between coordinator and other organizers.
- [ ] Step 6: Replace the "All screens" `index.html` with a short landing page linking to the two prototypes.
- [ ] Step 7: Update `docs/speaker-organizer-user-flow.html` to the two roles.
- [ ] Step 8: Update `plans/20261031-1137-manual-test-html-prototype.md` to the new journeys and file names, and drop its role switcher step.
- [ ] Step 9: Click through both prototypes from login, including the exit and exception paths, and check for dead links.

## Open questions

- Inferred: "2 prototypes" means reworking the existing HTML screens into two separate folders, rather than starting again from scratch or in a design tool.
- Speaker first arrival: the speaker's first step today is the invitation email, then `speaker-sign-up`. Recommendation: login is the entry point with a "Create your account" link to sign-up, and the invitation email links there too.
- Past speakers proposing a talk: `speaker-propose-talk` has no invitation. Recommendation: reach it from the speaker's home after login.
- Mock emails: which prototype do they belong to? Recommendation: all four go in the speaker prototype, since the speaker receives them. The organizer prototype shows a "speaker receives this email" note instead.
- Login method: email and password, or Google sign-in? The prototype only needs one screen with no real authentication. Recommendation: match whatever the real app will use, otherwise email and password.
- The "covering" banner on `coordinator-home` (kept by a decision in the manual test plan): does it still mean anything once all organizers are the same role? Needs checking against the screen; recommendation is to remove it if it's about one organizer covering for the coordinator.
- Does the role merge reach beyond the prototype? Any real role or permission model in the app or other plans would need the same change.
