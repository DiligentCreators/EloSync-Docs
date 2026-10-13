# Calendar named-calendar provider sync/watches (1.10.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-13 |
| **Status** | **Go for production** (pending headed Playwright calendar integrations + named-calendar smoke after SPA deploy) |
| **Scope** | Secondary Google/Outlook calendars + watches for EloSync named calendars; per-provider `calendar_event_provider_mappings`; Google OAuth scope → full `calendar`; catalog **calendar 1.9.0 → 1.10.0** |
| **Companion** | [Calendar deployment](./calendar) · [Developer guide](/developer-guide/calendar) · [CHANGELOG](/changelog/) |

---

## Executive summary

**1.10.0** closes the deferred named-calendar provider sync/watches gap after **1.9.0** named calendars and **1.8.0** webhook inbound.

| Capability | Behavior |
|------------|----------|
| `calendar_provider_links` | One row per named calendar + provider; stores `external_calendar_id` + `meta.watch` |
| Create / Sync now / OAuth connect | `ensureNamedCalendarLinks` creates secondary provider calendars for calendars owned by the connected user and ensures watches |
| Outbound push | Named-calendar events push to the link’s secondary calendar via the link owner’s OAuth connection; personal events stay on primary |
| Per-provider mappings | `calendar_event_provider_mappings` keeps one external event id per provider (fixes dual-connect clobber on `calendar_events.external_*`) |
| Inbound | Pull for each link; ingest with `calendar_id` set; webhook resolves connection **or** link watch ids |
| Google scope | Config uses `https://www.googleapis.com/auth/calendar` (required to create secondary calendars). Existing Google connections must **reconnect** |

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** (Calendar depth only) |
| Soft-fail push / watch / link create | **Pass** (mirrors 1.4.0–1.8.0) |
| Pest `NamedCalendarProviderSyncTest` | **Pass** (5) |
| Catalog migrate-only **1.10.0** | **Pass** |
| SPA Manage calendars provider badges + Sync panel copy | **Pass** (code) |
| Playwright calendar integrations named-calendar copy | Pending headed run |

## Upgrade & staging smoke

1. `php artisan migrate --force` — `calendar_provider_links`, `calendar_event_provider_mappings`, catalog → **1.10.0** (do **not** `db:seed`).
2. Deploy Backend + SPA.
3. Admins who connected Google before 1.10.0: **Disconnect → Connect** (full calendar scope).
4. Smoke: connect Google/Outlook → create named calendar → confirm Manage calendars shows Google/Outlook synced badge → post event on that calendar → Sync now → External events on linked calendars stay scoped.

## Rollback

Prefer forward fix. Schema tables are additive; rolling code back leaves unused link/mapping rows inert.
