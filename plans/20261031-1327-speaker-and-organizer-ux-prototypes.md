# 2026-10-31 13:27:47 UTC — Separate speaker and organizer UX prototypes

> 🤖 **Picked up by agent** — `bfdf944406b0` at `2026-10-31T13:35:54Z`

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

Run Step 10. The prototypes and all the docs are done. Step 10 clicks through both prototypes from login, `docs/prototype/speaker/index.html` and `docs/prototype/organizer/index.html`, including the exit and exception paths, and checks for dead links. `plans/20261031-1137-manual-test-html-prototype.md` lists the paths. Stay on `main`.

## Steps

- [ ] Step 10: Click through both prototypes from login, including the exit and exception paths, and check for dead links.
