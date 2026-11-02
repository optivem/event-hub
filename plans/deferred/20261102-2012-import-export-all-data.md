# 2026-11-02 20:12:59 UTC — Import and export all data (site migration)

> **Deferred.** Start this only once the event domain is built (events, organizers, speakers, talks, materials). The data it should migrate doesn't exist yet: the database today holds only the shop-template `orders` and `coupons`, and those aren't worth exporting.

## TL;DR

**Why:** A community running Event Hub should be able to move its whole instance, the way WordPress sites migrate: from one host to another, from self-hosted to the SaaS or back, or into a fresh environment. This also gives them a backup they own and lowers lock-in, which suits the AGPL/SaaS positioning.
**End result:** An administrator clicks **Export** and downloads one file holding all of the instance's data. On another instance, an administrator uploads that file with **Import** and gets the same data back. The format is versioned and documented, so old exports keep importing after the schema changes.

## Outcomes

What we get out of this — the goals and deliverables:

- An administrator can download a single export archive (e.g. `eventhub-export-<date>.zip`) of all instance data from the admin area
- An administrator can upload that archive on another instance and see identical data afterwards (round-trip: export → import → export gives the same content)
- The archive carries a manifest: format version, app version, Flyway schema version, export time, and per-table row counts
- Imports from older format versions still work (upgrade on import). Imports from newer versions are refused with a clear message
- Import is all-or-nothing: if it fails, nothing changes (one DB transaction)
- Only administrators can export or import. The endpoints are covered by the authorization tests
- The format is documented in `docs/`, so anyone can read or produce an export without our code

## ▶ Next executable step (resume here)

Deferred until the event domain exists (see the note at the top). When it does: design only, no code yet. Settle the **Open questions** below (scope of "all data", import mode, and whether to wait for the event domain) with `/refine-plan`. Then Step 1 becomes executable.

## Steps

- [ ] Step 1: Define the export format: a zip with `manifest.json` and one JSON (or JSONL) file per entity. Write it up in `docs/data-export-format.md`
- [ ] Step 2: Backend: `GET /api/admin/export` streams the archive. Read everything in one read-only transaction so the snapshot is consistent
- [ ] Step 3: Backend: `POST /api/admin/import` (multipart). Validate the manifest and versions, then in one transaction clear the tables, insert the rows keeping their IDs, and reset the sequences (`setval`)
- [ ] Step 4: Frontend: an admin "Import / Export" page with an Export button, an Import upload, a "this replaces all data" confirmation, and the result summary (row counts)
- [ ] Step 5: Tests: a component test for the round-trip and for rejecting a bad or newer version, authorization tests (non-admin → 403), a Pact contract for both endpoints, and an acceptance test for the round-trip through the UI
- [ ] Step 6: Size limits: set and document a max upload size (Cloud Run caps request bodies at 32 MiB). Stream instead of buffering
- [ ] Step 7: Update `docs/use-cases.md` with **Export Data** and **Import Data** under Administrator

## Open questions

- **What counts as "all data"?** It's the event domain from `docs/use-cases.md`: events, organizers, speakers, talks, materials. Should we design it generically (e.g. every table Flyway owns), so new entities are included automatically? Generic is my recommendation.
- **Users and roles live in Keycloak, not the database.** Do we include them, so people keep their logins and roles after migrating, or are they out of scope (re-invite on the new instance)? Passwords can't be moved cleanly in any case.
- **Uploaded files** (speaker materials, later): when they exist, they go into the archive like WordPress's `wp-content/uploads`. Agreed?
- **Import mode:** replace everything (WordPress-migration style, simplest and my recommendation), or also offer merge/append? Merge raises ID and unique-key conflicts (`order_number`, coupon `code`).
- **Format:** JSON per entity (readable, survives schema changes, my recommendation), or a raw `pg_dump` (faster, but tied to Postgres and the exact schema)?
- **Multi-tenant SaaS:** if one deployment will host several communities, export and import must be scoped per community. Is that on the roadmap, so the format should carry a community/tenant ID from day one?
- **Personal data (GDPR):** the export contains speaker and organizer profiles. Is an admin-only download acceptable, or should the archive be encrypted or password-protected?
