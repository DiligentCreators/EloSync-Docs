# Calendar Project/Contact/Company overlay push (1.7.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-08 |
| **Re-verified** | 2026-10-08 — Pest `CalendarEventProviderPushTest` + catalog bump **1.7.0**; headed Playwright `test:e2e:calendar` **7/7** (integrations + one-session overlay-sync + workflow) |
| **Status** | **Go for production** |
| **Scope** | One-way EloSync → Google/Outlook push extended to **Project / Contact / Company** overlays; catalog **calendar 1.6.0 → 1.7.0** |
| **Companion** | [Calendar deployment](./calendar) · [Overview](/user-guide/calendar-overview) · [Developer guide](/developer-guide/calendar) · [CHANGELOG](/changelog/) |

---

## Executive summary

Calendar **1.5.0** already pushed Meeting/Task/Lead overlays. **1.7.0** opens the same soft-fail `PushCalendarEventToProviderJob` path for Project date-range overlays and Contact/Company follow-up overlays (`CalendarEventSourceEnum::shouldPushToProvider()`). **External** remains non-pushable. Dual-provider single-column mapping debt is unchanged from **1.4.0**.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Push gate includes Project / Contact / Company | **Pass** (enum + Pest) |
| External never queued | **Pass** |
| Soft-fail; broken provider never blocks writes | **Pass** |
| Horizon **`calendar-sync`** | **Pass** (unchanged) |
| Catalog migrate-only **1.7.0** + CatalogSeeder | **Pass** |
| SPA Sync copy + Playwright | **Pass** |
| Live Google/Microsoft overlay push | **Post-deploy QA** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.7.0** (do **not** `db:seed`).
2. Confirm Horizon workers process **`calendar-sync`**.
3. Admin → Calendar → **Sync** → copy mentions Project/Contact/Company overlays.
4. With OAuth connected: Project with dates / Contact or Company follow-up → provider calendar; clear dates/follow-up → provider cancel.

## Rollback

Roll back catalog bump (`down` → **1.6.0**) with matching code. After rollback, only manual + Meeting/Task/Lead overlays push again.
