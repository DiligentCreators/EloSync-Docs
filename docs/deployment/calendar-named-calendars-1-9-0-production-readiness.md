# Calendar named team/department calendars (1.9.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-08 |
| **Re-verified** | 2026-10-08 — Pest `NamedCalendarTest` (7) + catalog bump **1.9.0**; headed Playwright named-calendar in one-session overlay-sync + workflow (**7/7**) |
| **Status** | **Go for production** |
| **Scope** | EloSync-first named calendars with optional department auto-share; `calendar.manage_calendars`; catalog **calendar 1.8.0 → 1.9.0** |
| **Companion** | [Calendar deployment](./calendar) · [Developer guide](/developer-guide/calendar) · [CHANGELOG](/changelog/) |

---

## Executive summary

**1.9.0** adds a `calendars` table and nullable `calendar_events.calendar_id` (`null` = personal, unchanged). Visibility for named calendars: creator + department members/manager when Departments is entitled + `calendar.view_all` / manage. CRUD is gated by new `calendar.manage_calendars` (admin/manager defaults). Provider sync remains per-organizer OAuth — no separate team Google calendar resource. Overlay upserts stay `calendar_id = null`.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** (soft `hasModule('departments')` only) |
| CRUD authz (`manage_calendars`) | **Pass** (Pest) |
| Department member sees team event; outsider does not | **Pass** |
| Soft departments missing / unentitled | **Pass** |
| Personal calendar behavior unchanged when `calendar_id` null | **Pass** |
| Catalog migrate-only **1.9.0** + permission grant | **Pass** |
| SPA filter chips + manage dialog + event picker | **Pass** |
| Playwright named-calendar workflow | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — `calendars` table, `calendar_id` FK, permission grant, catalog → **1.9.0** (do **not** `db:seed`).
2. Confirm admin/manager have `calendar.manage_calendars`.
3. Deploy SPA — **Manage calendars**, filter chips, event form Calendar picker.
4. Smoke: create named calendar (optionally link department) → post event → filter → department member sees it; non-member staff does not (unless `view_all`).

## Rollback

Catalog/permission data migrations are forward-only in spirit; roll code + leave `calendars` / `calendar_id` rows inert if you must revert. Prefer forward fix.
