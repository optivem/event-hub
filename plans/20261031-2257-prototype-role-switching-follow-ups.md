# 2026-10-31 22:57:41 UTC — prototype follow-ups: browser check, role switching, last organizer

## TL;DR

**Why:** Organizer management, the top-right account menu and the shared profile were built with no browser to look at them. One person holding several roles isn't solved yet, and the prototype lets an administrator remove every organizer.
**End result:** The new screens are confirmed to work at desktop and phone width, the rules for several roles and for the last organizer are written down, and the prototype shows both.

## Outcomes

What we get out of this — the goals and deliverables:

- The account menu, phone header and profile pages look right for speaker, organizer and administrator at desktop and phone width.
- A person with several roles has one login and one profile, and moves between roles from the account menu, which shows only the roles they hold.
- A person who is both a speaker and an administrator can find their own events without logging out.
- A community can't be left without an organizer.
- It's clear who can add a new administrator.
- `docs/use-cases.md` records the rules for several roles and for the last organizer.

## ▶ Next executable step (resume here)

Do step 1, which needs a person with a browser. Serve `docs/prototype` and open `administrator/administrator-community.html`, `organizer/organizer-home.html`, `organizer/organizer-profile.html`, `administrator/administrator-profile.html` and `speaker/speaker-profile.html` at desktop and phone width. Record any problems under `## Findings`.

## Steps

- [ ] Step 1: Check in a browser, at desktop and phone width: the account menu opens and closes on organizer and administrator screens, the phone header keeps the logo and account menu on one row with the nav below (the shared phone header rule in `docs/prototype/organizer/styles.css` changed), and the profile form renders for all three roles, including `speaker-profile.html?onboarding`. Record problems under `## Findings`.
- [ ] Step 2: Fix anything found in step 1.
- [ ] Step 3: Add the agreed rules for several roles and the last organizer to `docs/use-cases.md`.
- [ ] Step 4: Add one sample person who holds several roles, since each prototype currently uses a different made-up person.
- [ ] Step 5: Add the role switcher to the account menu on the speaker, organizer and administrator screens. This touches every speaker screen, so commit or set aside the uncommitted speaker changes first.
- [ ] Step 6: Block removing the last organizer on `administrator-organizers.html` and `administrator-remove-organizer.html`, and block removing the last administrator in the same way.
- [ ] Step 7: Add the new paths to `plans/20261031-1137-manual-test-html-prototype.md`.

## Findings

## Resolved decisions

- Role switching: one login per person, with roles on the account and one shared profile. The account menu shows a switcher listing only the roles the person holds, and they land on the view they used last.
- Last organizer: removing the last organizer is blocked, with a message on the Organizers tab explaining why.
- New administrators: an existing administrator adds them, using the same invitation flow as organizers.
- Administrators can remove themselves, but removing the last administrator is blocked the same way as the last organizer.
