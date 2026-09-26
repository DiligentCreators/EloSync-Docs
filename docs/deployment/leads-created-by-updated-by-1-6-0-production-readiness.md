# Leads created_by / updated_by (leads 1.6.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-26 |
| **Status** | **Go for production** after migrate-first deploy + staging smoke |
| **Scope** | Tenant Leads module catalog **1.5.0 → 1.6.0** — denormalized `created_by` / `updated_by`, list/board/export filters, SPA columns + filters + overview |
| **Backend** | Columns + batched activity backfill; `LeadService` write + note/tag/follow-up touch paths; list/board filters (`system` = null); API `creator` / `updater`; catalog bump + CatalogSeeder; Pest `LeadCreatedByUpdatedByTest` |
| **Frontend** | Table columns, Created by / Updated by filters (`ActorFilterSelect`), board badge, peek + record overview; Playwright `leads.created-by.spec.ts`; import e2e queue-worker hint |
| **Docs** | User / developer / API / database + changelog + hubs **1.6.0** + this audit |

**Companion docs:** [Leads deploy](/deployment/leads) · [Upgrade](/deployment/upgrade) · [User guide](/user-guide/leads) · [Developer guide](/developer-guide/leads) · [API](/api/tenant-v1-leads) · [Changelog](/changelog/) · [Playwright](/developer-guide/playwright)

---

## Executive summary

Operators needed fast “who created / who last changed this lead?” filters without joining `lead_activities` on every list/board query. This ship **denormalizes** `leads.created_by` and `leads.updated_by` (nullable FKs → `users`, `nullOnDelete`), backfills from existing activity on migrate (batched), and keeps columns in sync on create/update/convert/restore/delete **and** notes / tag sync / follow-up mutations going forward.

SPA adds table columns, list filters (including **System** for null actors), board “By …” badge, and peek/record overview fields. No new permissions, no platform-shell changes (platform freeze).

**Go / No-Go:** **Go** — all audit residuals remediated.

| Gate | Result |
|------|--------|
| Migrate-only catalog bump `leads` **1.5.0 → 1.6.0** + CatalogSeeder sync | **Pass** |
| Schema: nullable FKs + `(tenant_id, created_by|updated_by)` indexes | **Pass** |
| Batched backfill from `lead_activities` (created type → earliest actor → latest updater) | **Pass** |
| `LeadService::create` sets both from authenticated actor; system/webhook leaves null | **Pass** |
| Notes / tags / follow-ups stamp `updated_by` when actor present | **Pass** (I1 remediated) |
| Client cannot mass-assign `created_by` / `updated_by` (update `fill` allowlist) | **Pass** |
| List/board/stats share `created_by` / `updated_by` filters (`system` → `whereNull`) | **Pass** |
| Eager load `creator` / `updater`; API embeds + export columns | **Pass** |
| Import / Meta / custom webhook use `LeadService::create` (actor or null) | **Pass** |
| Duplicate-notification path prefers `created_by` over activity scan | **Pass** |
| Pest `LeadCreatedByUpdatedByTest` (4) | **Pass** (35 assertions, local 2026-09-26) |
| Playwright `leads.created-by.spec.ts` one-session human flow | **Pass** |
| Import e2e documents / fails clearly without `imports` worker | **Pass** (I2 remediated) |
| User / developer / API / database / changelog / roadmap hubs | **Pass** |
| New permission / env / queue / seeder required for cutover | **N/A** |

---

## Security summary

| Control | Status |
|---------|--------|
| No new endpoints or Spatie permissions | Pass |
| Module gate `module:leads` + existing `leads.*` unchanged | Pass |
| Tenant isolation unchanged (columns on tenant `leads`) | Pass |
| Request payloads cannot set actor columns | Pass |
| Filter values are user id or `system` — no extra PII beyond existing list embeds | Pass |
| Soft-delete / restore still permission-gated; restore stamps `updated_by` | Pass |

### Findings

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **I1** | Info | Notes, tags, follow-ups alone did not bump `updated_by` | **Remediated** — `LeadService` stamps `updated_by` on note add, tag sync (when tags/follow-up change), follow-up create/update/complete |
| **L1** | Low | Migrate backfill was O(leads × 2) per-row activity lookups | **Remediated** — chunk 500 with aggregate MIN/MAX activity id queries per chunk |
| **L2** | Low | Pre-`created` activity leads stayed null | **Remediated** — fall back to earliest activity with `user_id` for `created_by`; latest actor (else created_by) for `updated_by`. True orphans remain **System** |
| **I2** | Info | Playwright import specs timed out without queue worker | **Remediated** — `npm run test:e2e:leads` prints worker hint; import helper throws actionable Status:completed timeout; import spec documents worker command |

No open residuals.

---

## Change inventory

### Backend

- Migration `2026_09_26_112037_add_created_by_and_updated_by_to_leads_table` — columns, FKs, indexes, **batched** activity backfill with created-type + earliest-actor fallbacks.
- Migration `2026_09_26_112040_bump_leads_module_to_1_6_0` — `DefaultModuleRegistrar::bumpVersion('leads', '1.6.0')`.
- Migration `2026_09_26_133208_remediates_leads_created_by_updated_by_backfill` — idempotent re-fill for rows still null (L1/L2 remediations on already-migrated DBs).
- `CatalogSeeder` leads version **1.6.0**.
- `Lead` model: fillable + `creator` / `updater` relations.
- `LeadService`: create stamps; update/assign/stage/convert/restore/delete; **notes/tags/follow-ups** via `touchUpdatedBy`; list/board filters; eager loads.
- `ListLeadResource` (+ show resources): `created_by` / `updated_by` + embedded users.
- `LeadsExport`: Created by / Updated by name columns.
- `LeadEventSubscriber`: duplicate notify prefers `created_by`.
- Factory / Pest: `LeadCreatedByUpdatedByTest` (create/update, filters, system, **touch paths**).

### Frontend

- `ActorFilterSelect` + leads list filters / URL params.
- Table columns, board badge, peek + record overview.
- Types: lead `creator` / `updater`.
- Playwright: `e2e/tests/leads/leads.created-by.spec.ts`; import queue-worker hint + clear timeout error.

### Docs

- Changelog delivery note; user guide + overview; developer guide; API query params; database schema; product roadmap hubs **1.6.0**.
- This production readiness audit (residuals closed); Upgrade + Leads deploy + Playwright cross-links.

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `herd php artisan test --compact tests/Feature/Tenant/Lead/LeadCreatedByUpdatedByTest.php` | **4 passed**, 35 assertions | Create/update; list/board filters; system; note/tag `updated_by` |
| Playwright `e2e/tests/leads/leads.created-by.spec.ts` | **Pass** | Single demo login session |
| Companion Leads import e2e | **Pass with worker** | Requires `queue:work --queue=imports,default`; timeout message documents the requirement |

---

## Staging smoke

1. Confirm catalog `leads.version` = **1.6.0** after migrate (do **not** `db:seed`).
2. Open Leads **Table** → columns **Created by** / **Updated by** visible.
3. Create a lead as a known user → row shows that name; filter **Created by** = that user keeps the row; **System** hides it.
4. Edit the lead as a second user → **Updated by** updates; **Created by** unchanged.
5. Add a note (or change tags) as a third user → **Updated by** becomes that user.
6. Board: search the lead → “By …” badge matches creator.
7. Peek + full record Overview show Created by / Updated by.
8. Spot-check one webhook/import lead → **System** (or importer when import ran as a user).
9. Export CSV → Created by / Updated by columns populated.

---

## Deploy

1. Deploy **Backend** with both migrations.
2. `php artisan migrate --force` (central catalog bump + each tenant DB columns/backfill).
3. `php artisan queue:restart` (no new queues; restart picks up code).
4. Deploy **Frontend** (filters/columns).
5. Deploy **Docs**.
6. Staging smoke above.

No new env keys. No RBAC migration. No `db:seed`.

### Rollback

- Redeploy previous Backend + run migration `down` only if columns must be dropped (data loss of denormalized stamps; activity history remains).
- Prefer leave columns in place and roll back SPA only if UI must revert — old API ignores unused embeds safely; new filters ignore unknown query params on old Backend until upgraded.

---

## Sign-off

| Role | Decision | Date |
|------|----------|------|
| Engineering | **Go** — I1/L1/L2/I2 remediated | 2026-09-26 |
| Ops | ☐ Staging smoke | |
| Product | **Go** — Updated by includes notes/tags/follow-ups | 2026-09-26 |

**Current decision (2026-09-26):** **Go** — residuals closed; merge after CI green; migrate-first; complete staging smoke before production traffic.
