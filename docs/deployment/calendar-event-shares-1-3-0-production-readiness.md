# Calendar event shares (1.3.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-28 |
| **Re-verified** | 2026-09-28 — Playwright Calendar **4/4** (share ACL); local catalog `calendar=1.3.0` |
| **Status** | **Go for production** (merge/deploy remaining) |
| **Scope** | Manual-event shares (`viewer` / `editor`); catalog **calendar 1.2.0 → 1.3.0** |
| **Companion** | [Calendar deployment](./calendar) · [Depth rollup](./depth-wa-cal-ai-2026-09-28-production-readiness) · [Overview](/user-guide/calendar-overview) · [CHANGELOG](/changelog/) |

---

## Executive summary

Organizers (and `calendar.view_all`) can share a **manual** calendar event with workspace users as **viewer** (list/view, `read_only`) or **editor** (mutate when they also have Spatie update/delete). Meeting invitee ACL from **1.2.0** is unchanged. No named team calendars, no Google/Outlook sync.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Share grants visibility without `view_all` | **Pass** |
| Viewer `read_only`; editor can mutate manual events | **Pass** |
| Nested share CRUD API + Pest | **Pass** |
| SPA Share manager + Playwright | **Pass** — e2e **4/4**; viewers hide Edit/Cancel when `read_only` |
| Catalog migrate-only **1.3.0** + CatalogSeeder | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — `calendar_event_shares` + catalog → **1.3.0** (do **not** `db:seed`).
2. Smoke: create manual event → Share as viewer → open as sharee → **View only**; share as editor → edit succeeds.

## Rollback

Roll back catalog bump (`down` → **1.2.0**) and drop shares table migration after code rollback.
