# 2026-10-31 10:46:23 UTC — event-hub clickable HTML screen prototype

> 🤖 **Picked up by agent** — `b642e73d14f3` at `2026-10-31T10:50:15Z`

## TL;DR

**Why:** The user flow in `docs/speaker-organizer-user-flow.html` shows who does what and when, but not what any screen looks like. Screens need testing with real clicks before the frontend is built, and a plain HTML prototype gives that without a Figma dependency.
**End result:** A clickable HTML prototype, versioned in this repo and opened by double-clicking a file, walks through every in-app step of the flow for the speaker, the speaker coordinator and the other organizers, like a Figma prototype. Nothing in it is wired to a backend.

## Outcomes

What we get out of this — the goals and deliverables:

- A click-through prototype in `docs/prototype/`, with one HTML file per screen, that opens from the file system with no server, build step or install.
- It behaves like a Figma prototype: fixed screens linked together, where forms don't save what is entered.
- Every screen is a responsive web page that works on phone, tablet and desktop for all roles.
- One screen for each in-app step of the flow, grouped by role: speaker, speaker coordinator, other organizers.
- The speaker's whole journey can be clicked through, from the invitation link to the post-event thank-you.
- The organizers' journey can be clicked through: filtering, proposing a date, reviewing, approving and publishing.
- The main exit and exception paths have screens too: date doesn't work, review doesn't pass, speaker drops out.
- The emails that remain (invitation and reminders) are shown as mock emails, so the link into the app can be clicked.
- A neutral look, using one shared stylesheet, so screens read as one product and can later guide the real frontend.
- All names and data are made up, with no real people.

## ▶ Next executable step (resume here)

Run Step 6 of `## Steps`: open `docs/prototype/index.html` with the user and click through every path against `docs/speaker-organizer-user-flow.html`, correcting the screens. The gap recommendations and Step 5 of `plans/20261031-1011-speaker-organizer-user-flow.md` are still open, so build on the page as it stands and adjust screens if they change.

## Screen list

Files are flat in `docs/prototype/`, prefixed by role. "G" refs are the gaps in `docs/speaker-organizer-user-flow.html`. ★ marks a screen with no node of its own in the flow.

**Mock emails**

| File | Flow step | Links to |
|---|---|---|
| `email-invitation.html` | Invitation email with sign-up link | `speaker-sign-up` |
| `email-reminder-reply.html` | Reminder after 1 week (G4) | `speaker-sign-up` |
| `email-reminder-1-month.html` | Reminder at 1 month | `speaker-agenda-materials` |
| `email-reminder-3-weeks.html` | Final reminder, coordinator copied | `speaker-agenda-materials` |

**Speaker**

| File | Flow step |
|---|---|
| `speaker-propose-talk.html` | Past speaker proposes a talk on the intake form (G1) |
| `speaker-sign-up.html` | Create account from the link, or sign in if returning (G2) |
| `speaker-date.html` | Date works? Accept, or offer other months (G5) |
| `speaker-date-closed.html` | No date fits: try again later |
| `speaker-home.html` ★ | Status and task list for the speaker's event |
| `speaker-agenda-materials.html` | Accept calendar invite, agree to guidelines, fill in agenda, share draft slides and repository (SECOND, G6) |
| `speaker-home-waiting.html` ★ | Agenda and materials handed in, waiting for review |
| `speaker-update-materials.html` | Review didn't pass: update within 1 week (G12) |
| `speaker-event-details.html` | StreamYard link, 17:00 start, Meetup group, like and share tasks (THIRD, G6) |
| `speaker-cant-make-it.html` | Can't make it: tell organizers (G15) |
| `speaker-day-of.html` | Co-host status, join StreamYard, 60 min talk and 30 min Q&A (G16) |
| `speaker-after-event.html` | Thank-you, share repository, reply to YouTube comments, done (G16) |

**Speaker coordinator**

| File | Flow step |
|---|---|
| `coordinator-home.html` ★ | Shared status of every speaker and event |
| `coordinator-propose-date.html` | Propose a date and invite the speaker (FIRST) |
| `coordinator-invitation-status.html` | Reply countdown, reminder sent, no reply returns the slot to Filtering (G3, G17) |
| `coordinator-other-date.html` | Speaker's months: propose another date, or no slot left (G5) |
| `coordinator-confirm-date.html` | Confirm date, send calendar invite, open agenda step (SECOND) |
| `coordinator-materials-status.html` | Agenda and materials checks at 1 month, 3 weeks and 2 weeks (G8, G11) |
| `coordinator-review.html` | Review against guidelines, shorten title, pass or send back (G18) |
| `coordinator-approve.html` | Approve and share event details (THIRD) |
| `coordinator-cancel-event.html` | Event cancelled: missed deadline or missed update (G10, G12) |
| `coordinator-speaker-dropped.html` | Speaker dropped out: cancel, arrange a new speaker (G15) |
| `coordinator-day-of.html` | Add speaker as Meetup co-host (G16) |
| `coordinator-after-event.html` | Send thank-you, prompt to reply to YouTube comments (G16) |

**Other organizers**

| File | Flow step |
|---|---|
| `organizers-speakers.html` | Potential speakers, including intake proposals (G1) |
| `organizers-speaker-detail.html` | Topics and practical notes, technical topic? Invite or not invited |
| `organizers-publish.html` | Publish checklist: Meetup, LinkedIn, Twitter (G14) |
| `organizers-reschedule.html` | Ask to reschedule after confirmation (G9), which returns to `coordinator-confirm-date` |

**Covered without a screen of their own**

- Waiting for review was first planned as a status on `speaker-home`, but screens are fixed, so it became the `speaker-home-waiting` screen in the Speaker table.
- Another organizer covering a coordinator step uses the same coordinator screens, with a "covering" banner.
- Automatic reminder checks are shown as statuses on `coordinator-invitation-status` and `coordinator-materials-status`.

**Agreed decisions**

- G7, disagreeing with the guidelines, has no screen until organizers agree it, because the flow doesn't draw it.
- Asking a potential speaker about topics happens outside the app, with answers noted on `organizers-speaker-detail`, because the speaker has no account yet.
- The role switcher jumps to a role's home screen, because the links between screens already carry the journey. Other organizers' home is `organizers-speakers`.

## Steps

- [ ] Step 6: Click through every path with the user against the user flow, and correct the screens.
