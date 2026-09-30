# Calendar Google/Outlook sync (1.4.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-30 |
| **Re-verified** | 2026-09-30 — branch `feature/calendar-google-outlook-sync` code review; Pest **`CalendarIntegrationTest`** (7) + **`CalendarEventProviderPushTest`** (6); Playwright **`calendar-integrations.spec.ts`** (panel smoke) |
| **Status** | **Go for production** (merge/deploy remaining; live Google/Microsoft OAuth smoke **post-deploy QA**) |
| **Scope** | Per-user OAuth connect; one-way **EloSync → provider** push for **manual** events only; catalog **calendar 1.3.0 → 1.4.0** |
| **Companion** | [Calendar deployment](./calendar) · [Overview](/user-guide/calendar-overview) · [Developer guide](/developer-guide/calendar) · [CHANGELOG](/changelog/) |

---

## Executive summary

Workspace admins with `calendar.manage_integrations` open **Calendar → Sync** to connect **Google Calendar** or **Microsoft Outlook** (platform OAuth apps in env — not per-tenant). When the **organizer** creates, updates, or cancels a **manual** event, `CalendarEventSubscriber` queues `PushCalendarEventToProviderJob` on the **`calendar-sync`** Horizon queue; provider HTTP failures are logged and **never block** calendar writes.

Meeting/task/lead/project overlays, named team calendars, and inbound (two-way) sync remain **deferred**.

**Known Phase-1 limitation:** `calendar_events.external_provider` / `external_event_id` store a **single** provider mapping. If the organizer connects **both** Google and Microsoft, create may push to both, but update/cancel only reliably targets the last-written mapping — document for operators; dual-connect is supported but not fully symmetric.

**Go / No-Go:** **Go** for engineering deploy. Optional follow-up: one real Google + one real Microsoft connect/push smoke per environment.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Per-user connections (`calendar_provider_connections`); encrypted tokens | **Pass** |
| Providers `google` \| `microsoft` via `CalendarSyncProviderRegistry` | **Pass** |
| OAuth: platform env credentials + fixed callback `/api/oauth/calendar-sync/{provider}/callback` | **Pass** |
| Integration API gated by `calendar.manage_integrations` (admin role default) | **Pass** |
| Push job soft-fail; manual source only; disconnect stops push | **Pass** (Pest) |
| `CALENDAR_SYNC_PROVIDERS_FAKE` / provider `fake()` forced in `testing`; not for production | **Pass** |
| Horizon supervisor includes **`calendar-sync`** queue | **Pass** (`config/horizon.php`) |
| SPA **Calendar → Sync** panel + Playwright panel smoke | **Pass** |
| Catalog migrate-only **1.4.0** + `calendar.manage_integrations` permission migration | **Pass** |
| Live Google/Microsoft OAuth + provider calendar verify | **Post-deploy QA** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — `calendar_provider_connections`, `external_*` on `calendar_events`, permission + catalog → **1.4.0** (do **not** `db:seed`).
2. Set platform env: `GOOGLE_CALENDAR_*`, `MICROSOFT_CALENDAR_*`, `APP_URL` (HTTPS), `FRONTEND_URL`; register callback on each OAuth app (see [Calendar deployment](./calendar)).
3. Confirm Horizon workers process **`calendar-sync`** (push is async).
4. Smoke (when OAuth apps available): admin → Calendar → **Sync** → Connect Google → create manual event → event appears in Google Calendar; update title in EloSync → provider event updates; cancel in EloSync → provider event cancelled; Disconnect → new events no longer push.

## Rollback

Roll back catalog bump (`down` → **1.3.0**) and drop sync migrations after code rollback. Existing manual events and shares **1.3.0** behavior unchanged; provider connections table can be dropped on rollback migration.
