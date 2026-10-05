# Calendar two-way inbound sync (1.6.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-05 |
| **Re-verified** | 2026-10-05 — Pest CalendarInboundPull + Integration + ProviderPush (18) + Playwright `test:e2e:calendar` (6) green |
| **Status** | **Go for production** |
| **Scope** | Inbound Google/Outlook pull as read-only `external` events; Sync now + hourly schedule; catalog **calendar 1.5.0 → 1.6.0** |
| **Companion** | [Calendar deployment](./calendar) · [Overview](/user-guide/calendar-overview) · [CHANGELOG](/changelog/) |

---

## Executive summary

Calendar **1.5.0** pushed EloSync → provider. **1.6.0** adds inbound pull: connected users get provider events as `source=external` (view-only). EloSync-owned mapped events are not overwritten. Soft-fail pull; `POST /calendar/integrations/sync` + hourly `calendar:pull-provider-events`. Also restores tenant API routes for calendar integrations (index/authorize/disconnect/sync).

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| `listEvents` Google + Microsoft + fake | **Pass** |
| Ingest External only; skip EloSync-owned mappings | **Pass** (Pest) |
| External read-only (policy + resource) | **Pass** |
| Never push External (`shouldPushToProvider`) | **Pass** |
| Hourly schedule + Sync now UI | **Pass** |
| Catalog migrate-only **1.6.0** | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.6.0**.
2. Confirm scheduler runs `calendar:pull-provider-events` hourly; Horizon **`calendar-sync`**.
3. Connect Google/Outlook → Sync now → External events appear; edit blocked in SPA.

## Rollback

Catalog `down` → **1.5.0** with matching code. Existing External rows remain but stop refreshing.
