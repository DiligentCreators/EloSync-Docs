# Calendar webhook-driven inbound sync (1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-08 |
| **Re-verified** | 2026-10-08 — Pest watch/webhook + catalog bump **1.8.0**; headed Playwright Sync panel asserts near-real-time copy (**7/7**) |
| **Status** | **Go for production** |
| **Scope** | Near-real-time provider → EloSync ingest via Google/Graph watches; hourly pull kept as backstop; catalog **calendar 1.7.0 → 1.8.0** |
| **Companion** | [Calendar deployment](./calendar) · [Two-way inbound 1.6.0](./calendar-two-way-inbound-1-6-0-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

**1.6.0** added hourly/Sync-now inbound pull. **1.8.0** registers provider push-notification watches on OAuth connect and Sync now, exposes public `POST /webhooks/calendar-sync/{provider}`, and renews watches daily (`calendar:renew-provider-watches`). Webhooks queue the existing `PullCalendarEventsFromProviderJob` — no parallel ingest path. Soft-fail watches never block EloSync writes.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| `createWatch` / `renewWatch` / `stopWatch` Google + Graph + fake | **Pass** (Pest) |
| Watch meta on `calendar_provider_connections.meta` | **Pass** |
| Webhook validation (Google headers / Graph handshake + clientState) | **Pass** |
| Soft-fail watches | **Pass** |
| Hourly pull retained | **Pass** |
| Horizon **`calendar-sync`** | **Pass** |
| Catalog migrate-only **1.8.0** | **Pass** |
| Live sandbox Google/Microsoft webhook | **Post-deploy QA** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.8.0** (do **not** `db:seed`).
2. Ensure public webhook URL is reachable (same host as `APP_URL` or configure `config/calendar-sync.php` webhook path / public base).
3. Confirm scheduler: `calendar:pull-provider-events` hourly **and** `calendar:renew-provider-watches` daily; Horizon **`calendar-sync`**.
4. Connect Google/Outlook → Sync now → “Near real-time” badge; create an event in the provider → appears as External without waiting for the hourly job.

## Rollback

Catalog `down` → **1.7.0** with matching code. Existing watches may keep firing until expired/stopped; stop via disconnect or provider console if needed.
