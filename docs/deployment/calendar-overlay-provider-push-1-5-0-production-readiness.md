# Calendar overlay provider push (1.5.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-05 |
| **Re-verified** | 2026-10-05 — Pest `CalendarEventProviderPushTest` (8) + Playwright `test:e2e:calendar` (6) green |
| **Status** | **Go for production** |
| **Scope** | One-way EloSync → Google/Outlook push extended to **Meeting / Task / Lead** overlays; catalog **calendar 1.4.0 → 1.5.0** |
| **Companion** | [Calendar deployment](./calendar) · [Overview](/user-guide/calendar-overview) · [Developer guide](/developer-guide/calendar) · [CHANGELOG](/changelog/) |

---

## Executive summary

Calendar **1.4.0** already pushed **manual** events via `PushCalendarEventToProviderJob`. **1.5.0** opens the same soft-fail path for calendar projections sourced from Meetings, Tasks, and Leads (`CalendarEventSourceEnum::shouldPushToProvider()`). When an overlay is created, updated, or cleared (soft-delete / cancel), the organizer’s connected providers receive create / update / cancel. Project, Contact, and Company overlays remain deferred. Two-way inbound sync remains deferred.

**Known limitation (unchanged from 1.4.0):** `calendar_events.external_provider` / `external_event_id` store a **single** provider mapping. Dual-connect (Google + Microsoft) update/cancel only reliably targets the last-written mapping.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** (no shell/auth redesign) |
| Push gate: manual + meeting + task + lead only | **Pass** (enum + subscriber) |
| Project / Contact / Company never queued | **Pass** (Pest) |
| Soft-fail; broken provider never blocks writes | **Pass** (existing 1.4.0 path) |
| Horizon **`calendar-sync`** queue | **Pass** (unchanged) |
| Catalog migrate-only **1.5.0** + CatalogSeeder | **Pass** |
| SPA Sync copy + Playwright one-session | **Pass** (`calendar-overlay-sync.spec.ts` + integrations) |
| Live Google/Microsoft overlay push | **Post-deploy QA** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.5.0** (do **not** `db:seed`).
2. Confirm Horizon workers process **`calendar-sync`**.
3. Admin → Calendar → **Sync** → copy mentions Meeting/Task/Lead overlays.
4. With OAuth connected: Task with `due_at` / Lead follow-up / Meeting → provider calendar; clear due or cancel meeting → provider cancel.

## Rollback

Roll back catalog bump (`down` → **1.4.0**) with matching code. Overlay rows and provider mappings from **1.4.0** remain; after rollback, only manual events push again.
