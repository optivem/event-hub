# 2026-11-02 10:28 UTC — Plan coordination meta-plan: prototype and user flow plans

> 🤖 **Picked up by agent** — `bfdf944406b0` at `2026-11-02T11:43:23Z`

## Target state

When all waves are done:

- **All four plans are finished, in this order:** the open questions in `2256` and `2257` are answered, then the user flow walkthrough (`1011`) and role switching (`2257`), then organizer views and assignees (`2256`), and last the manual test (`1137`).
- **What you see in the prototype:** one sample person who holds several roles and switches between them from the account menu. Organizers land on My events, with All events and Potential speakers as their own pages. Only an event's assignees can approve it, and the last organizer can't be removed.
- **Docs agree with the prototype:** `docs/use-cases.md` has the rules for several roles, the last organizer and assignees. `docs/speaker-organizer-user-flow.html` has been checked against the source procedure and then updated for assignees.
- **Tested once, at the end:** `1137` covers every journey, including the paths `2256` and `2257` added, against the final user flow. Its findings are corrected.
- **No rework from file clashes:** plans that share files run one after the other in the order above, so no session edits a screen that another session has changed underneath it.
- **Unchanged:** no plan is merged or rewritten. Each runs as written with `/execute-plan`, and the deploy plan (`20261030-1931`) isn't part of this.

## ▶ Next executable step (resume here)

Do Step 6 of `## Steps`: run the manual test in `plans/20261031-1137-manual-test-html-prototype.md` in headless Chromium, covering every journey, including steps 2b–2e added by the role-switching and organizer-views plans. Record findings, fix them, and delete that plan. The organizer home is now `organizer-my-events.html`, and the review is split into `organizer-review-agenda.html` and `organizer-review-materials.html`.

How to run this meta-plan: all questions were asked upfront, so steps run via subagents without stopping. Browser checks run in headless Chromium at desktop (1280) and phone (390) width, and the user reviews a list of pages at the end. A step is done when the plan it names is deleted because it's complete. Then delete the step here and point this block at the next one.

## Steps

- [ ] Step 6 (Wave 3, after Step 5): `plans/20261031-1137-manual-test-html-prototype.md` — the user clicks through every journey and records findings, then `/execute-plan` on it applies the corrections.

**Plans analysed:** 4 in-scope, 0 referenced-only

In scope: `20261031-1011`, `20261031-1137`, `20261031-2256`, `20261031-2257`. `20261030-1931-deploy-pipeline-to-gcp-cloud-run.md` sorts before the range and no in-scope plan references it.

## Per-plan status snapshot

| Plan | Status | Steps done / total | Touched files (primary) | Notes |
|---|---|---|---|---|
| `20261031-1011-speaker-organizer-user-flow` | Partly executed (only Step 5 left) | 0 / 1 remaining | `docs/speaker-organizer-user-flow.html` | Manual walkthrough with the user against the source procedure. No open questions. |
| `20261031-1137-manual-test-html-prototype` | Ready, open questions all decided | 0 / 6 | Its own `## Findings`; any `docs/prototype/**` screen a finding corrects | Manual click-through. Two other plans add steps to this file. |
| `20261031-2256-organizer-views-and-event-assignees` | ⚠️ 2 open questions block Step 1 | 0 / 9 | `docs/use-cases.md`, `docs/prototype/organizer/*` (home replaced, new All events and Potential speakers pages, nav on every organizer page, `organizer-confirm-date`, `organizer-review`, `organizer-approve`), `docs/prototype/administrator/administrator-remove-organizer.html`, speaker screens (Step 7, only if OQ1 is yes), `docs/speaker-organizer-user-flow.html`, `plans/20261031-1137-…` | Nothing changed yet. |
| `20261031-2257-prototype-role-switching-follow-ups` | ⚠️ 4 open questions block Steps 2–7; Step 1 can run now | 0 / 7 | `docs/prototype/organizer/styles.css` (Step 2 fixes), `docs/use-cases.md`, the account menu on every speaker, organizer and administrator screen, sample person data in all three prototypes, `administrator-organizers.html`, `administrator-remove-organizer.html`, `plans/20261031-1137-…` | Step 1 needs a person with a browser. Step 5 asks for uncommitted speaker changes to be committed first; the tree is clean today, so that's already met. |

## Dependency graph

```
20261031-1011 (user flow walkthrough) ───────────────┐
                                                     ├──►  20261031-2256 (organizer views, assignees) ──►  20261031-1137 (manual test)
20261031-2257 (role switching, last organizer) ──────┘                                                         ▲
        │                                                                                                      │
        └──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Edges and where they come from:

- `2256 → 1137` and `2257 → 1137`: file-edit chain. `2256` Step 9 and `2257` Step 7 both add new paths to `1137`'s steps. If `1137` runs first, those paths go untested.
- `1011 → 2256`: both edit `docs/speaker-organizer-user-flow.html` (`1011` Step 5, `2256` Step 9). Doing `1011` first means the walkthrough checks the page against the source procedure before assignee behaviour that isn't in that procedure gets added. This is an ordering decision (see Consolidation 1), not something either plan states.
- `2257 → 2256`: re-order decided in Consolidation 1. Neither plan states it.
- `1011 → 1137`: `1137` tests screens against the user flow page, so the page should be final first. Not stated by either plan; the wave order below already respects it, so it changes nothing.

No cycles.

## Conflicts

### 1. Organizer page headers and `docs/prototype/organizer/styles.css` — coordination conflict
- `2256` Step 2 replaces `organizer-home.html` with My events and adds two new pages; Step 4 rewrites the top nav on every organizer page.
- `2257` Step 1 checks `organizer/organizer-home.html` and the shared phone header rule in `styles.css`; Step 2 fixes what it finds; Step 5 adds the role switcher to the account menu on every organizer page.
- **Why:** the nav and the account menu sit in the same header on the same pages, and the phone header rule controls both. If `2256` runs first, `2257` Step 1 is checking a page that no longer exists in that shape.
- **Recommended resolution:** run `2257` first. `2256` then builds its new pages from a header that already has the switcher and the corrected phone layout.

### 2. `docs/prototype/administrator/administrator-remove-organizer.html` — hard conflict
- `2256` Step 8 makes removal deal with the events the organizer is assigned to.
- `2257` Step 6 blocks removing the last organizer.
- **Why hard:** both change what the same remove confirmation says and allows. Run in parallel, one overwrites the other.
- **Recommended resolution:** serialise, `2257` then `2256`. Step 8 of `2256` then adds assignee handling to a screen that already has the last-organizer block.

### 3. `docs/use-cases.md` — soft conflict
- `2256` Step 1 adds an Assign Reviewers use case. `2257` Step 3 adds the rules for several roles and the last organizer.
- **Recommended resolution:** serialise, same order as above. The sections don't overlap.

### 4. Speaker screens — soft conflict (only if `2256` OQ1 is yes)
- `2257` Step 5 adds the role switcher to every speaker screen. `2256` Step 7 splits the review and changes the speaker's screens and phases.
- **Recommended resolution:** serialise, same order.

### 5. `docs/speaker-organizer-user-flow.html` — soft conflict
- `1011` Step 5 corrects the page against the source procedure. `2256` Step 9 adds assignee behaviour.
- **Recommended resolution:** `1011` first (see Consolidation 1).

### 6. `plans/20261031-1137-manual-test-html-prototype.md` — coordination conflict
- `2256` Step 9 and `2257` Step 7 both add steps to this plan, and `1137` Step 5 applies corrections to any prototype screen.
- **Recommended resolution:** `1137` runs last, after both have added their paths (see Consolidation 2).

## Consolidation findings (decided)

### 1. `20261031-2257` + `20261031-2256` — re-order: `2257` first, then `2256`
- They share the organizer headers, `styles.css`, `administrator-remove-organizer.html`, `docs/use-cases.md` and possibly the speaker screens (Conflicts 1–4).
- **Resolution (recommended):** run them one after the other as separate sessions, `2257` first. **Why:** `2257` Step 1 checks screens that `2256` would replace, and the switcher plus last-organizer block are smaller changes that `2256`'s new pages can then copy, so this order needs no rework.
- **Alternative considered:** one atomic session for both. Rejected because each has its own manual browser check and open questions, so one session would be long and stop several times for the user.
- **Alternative considered:** merge into a fresh plan. Rejected because the plans don't overlap in content, only in files, so the right order is enough.

### 2. `20261031-1137` after `2256` and `2257` — re-order: `1137` last
- Both later plans add steps to `1137`, and `1137` judges screens against a user flow page that `1011` and `2256` still change.
- **Resolution (recommended):** run `1137` as the final wave. **Why:** one manual pass over the finished prototype costs less than testing now and repeating it after two rounds of screen changes.

## Execution units (post-consolidation)

| Unit | Plans | Type | Touched files (primary) |
|---|---|---|---|
| U0a | `2256` open questions | refine only | `plans/20261031-2256-…` |
| U0b | `2257` open questions | refine only | `plans/20261031-2257-…` |
| U1 | `20261031-1011` Step 5 | standalone, manual with user | `docs/speaker-organizer-user-flow.html` |
| U2 | `20261031-2257` Steps 1–7 | standalone | `docs/prototype/**` headers and account menu, `organizer/styles.css`, `administrator-organizers.html`, `administrator-remove-organizer.html`, `docs/use-cases.md`, `plans/20261031-1137-…` |
| U3 | `20261031-2256` Steps 1–9 | standalone | `docs/use-cases.md`, `docs/prototype/organizer/*`, `administrator-remove-organizer.html`, speaker screens (if OQ1 yes), `docs/speaker-organizer-user-flow.html`, `plans/20261031-1137-…` |
| U4 | `20261031-1137` Steps 1–5 | standalone, manual | `## Findings` in its own file; any `docs/prototype/**` screen a finding corrects |

## Execution waves

### Wave 0 — settle open questions (can start now)

**Batch A (parallel-safe, 2 sessions):**
- `/refine-plan plans/20261031-2256-organizer-views-and-event-assignees.md` — 2 open questions (separate agenda and materials approval; when assignees are set).
- `/refine-plan plans/20261031-2257-prototype-role-switching-follow-ups.md` — 4 open questions (role switching, last organizer, who adds administrators, last administrator).
- Each only edits its own plan file. You can also answer both in one session, since you're the one answering.

### Wave 1 — can start now; needs Wave 0 only for U2 Steps 2–7

**Batch A (parallel-safe, 2 sessions; both need you at a browser):**
- U1: `/execute-plan plans/20261031-1011-speaker-organizer-user-flow.md` — Step 5, touches `docs/speaker-organizer-user-flow.html` only.
- U2: `/execute-plan plans/20261031-2257-prototype-role-switching-follow-ups.md` — Step 1 can start before Wave 0; Steps 2–7 need its open questions answered. Touches prototype screens, `docs/use-cases.md` and `plans/20261031-1137-…`.
- Files don't overlap. The only limit is that both walkthroughs need you, so in practice you may run them one after the other.

### Wave 2 — after U1 and U2 land

**Batch A (1 session):**
- U3: `/execute-plan plans/20261031-2256-organizer-views-and-event-assignees.md` — Steps 1–9, with Step 7 only if OQ1 was answered yes. Builds on the role switcher and last-organizer block from U2 and the corrected user flow from U1.

### Wave 3 — after U3 lands

**Batch A (1 session, manual):**
- U4: `plans/20261031-1137-manual-test-html-prototype.md` — click through every journey, now including the paths `2256` and `2257` added, record findings, then `/execute-plan` it to apply corrections.

## Pre-execute checks (apply before any wave starts)

- `grep -l "PICKUP\|in-flight\|claimed by" plans/*.md plans/deferred/*.md 2>/dev/null`
- `git status` — confirm no uncommitted changes under `docs/prototype/`, `docs/use-cases.md` or `docs/speaker-organizer-user-flow.html`.
- Before Wave 2: confirm both Wave 0 refinements have landed in the plan files.

## Out of scope of this meta-plan

- Whether each plan's content is right (use `/refine-plan` or `/review-plan`).
- Actual execution (use `/execute-plan` on each plan in turn).
