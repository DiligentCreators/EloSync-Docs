# Calendar — Developer Guide

> **Status: Implemented (v1)**  
> Meetings depends on Calendar (required) and projects via `upsertFromSource`. No calendar assignment in v1.

## Ownership

| Concept | Owner |
|---------|--------|
| `calendar_events` table / CRUD / Week·Day·Month·Agenda UI | Calendar module |
| Meeting booking, host assignment, Zoom/Meet, reminders | [Meetings](/developer-guide/meetings) module (calls `CalendarEventService`) |

## Model

`App\Models\CalendarEvent` — `BelongsToTenant`, `LogsActivity`, `SoftDeletes`.

Key fields: `organizer_id`, `starts_at`, `ends_at`, `all_day`, `timezone`, `status` (`scheduled`|`cancelled`), `source` (`manual`|`meeting`|`project`|`task`|`lead`), nullable `source_type`/`source_id` (Meetings uses morph alias `meeting`; Projects/Tasks/Leads use `project` / `task` / `lead`), nullable `external_provider` (`google`|`microsoft`) / `external_event_id` (Calendar sync mapping — **1.4.0**).

**Excluded:** `assignee_id`, named team calendars, two-way Google/Outlook sync, pushing sourced overlays.

## Visibility

- Without `calendar.view_all`: `organizer_id = actor` **or** meeting projection where the actor is a `meeting_attendees.user_id` row for `source_type=meeting` / `source_id`
- With `calendar.view_all` or Owner superadmin: all tenant events
- Update / cancel / delete remain organizer-only (or `view_all` / superadmin) — invitees are read-only
- Resource includes `read_only: true` when the viewer is not the organizer and lacks `view_all`
- `POST` always sets `organizer_id` to the authenticated user; `organizer_id` / `assignee_id` are **prohibited** on requests

## Service contract (Meetings-ready)

`App\Services\Tenant\CalendarEventService`:

- `createForOrganizer`, `update`, `cancel`, `delete`
- `listInRange`, `upcoming`
- `upsertFromSource` — used by Meetings, Projects, Tasks, and Leads; unused by Calendar UI for create

## Overlays (1.1.0)

When Calendar is entitled:

| Source | Projector | Projection |
|--------|-----------|------------|
| `meeting` | Meetings | Host event |
| `project` | Projects | All-day on `starts_on` / `ends_on` |
| `task` | Tasks | Timed window from `due_at` (+1h); cleared when completed/cancelled/no due |
| `lead` | Leads | Timed window from `next_follow_up_at` (+1h); cleared when converted/closed/archived/no follow-up |

Catalog version **1.1.0** (overlays). **1.2.0** invitee ACL. **1.3.0** shares. **1.4.0** OAuth push. **1.5.0** Meeting/Task/Lead overlay push. **1.6.0** inbound pull (`source=external`). Pest: overlay + push + `CalendarInboundPullTest.php`.

## Google / Outlook sync (1.4.0–1.6.0)

Per-user push for **manual** + Meeting/Task/Lead (`shouldPushToProvider()`). **1.6.0** inbound: `listEvents` → ingest as `External` (read-only; never pushed). EloSync-owned mappings skipped on pull. `POST /calendar/integrations/sync` + hourly `calendar:pull-provider-events`. Project/Contact/Company overlays stay deferred.

| Concept | Owner |
|---------|-------|
| Config | `config/calendar-sync.php` — `google.client_id/secret`, `microsoft.client_id/secret/tenant`, `oauth_callback_path`, `providers.fake` |
| Connection model | `App\Models\CalendarProviderConnection` (`BelongsToTenant`, `SoftDeletes`) — `tenant_id`, `user_id`, `provider` (`CalendarSyncProviderEnum`: `google`\|`microsoft`), encrypted `access_token`/`refresh_token`, `expires_at`, `status` (`CalendarProviderConnectionStatusEnum`), `external_calendar_id`, `meta` json |
| Providers | `App\Services\CalendarSync\Providers\GoogleCalendarProvider`, `MicrosoftCalendarProvider` — implement `CalendarSyncProviderInterface` (`authorizationUrl`, `exchangeCode`, `refreshAccessToken`, `pushEvent`, `updateEvent`, `cancelEvent`); driver resolution via `CalendarSyncProviderRegistry` |
| Orchestration | `App\Services\Tenant\CalendarSyncService` — `statusForUser`, `hasPlatformCredentials`, `authorizationUrl`, `disconnect`, `pushEvent($event, $action)` |
| Controller | `App\Http\Controllers\Tenant\Api\V1\CalendarIntegrationController` — `index` (status), `authorizeProvider` (redirect URL), `disconnect`; web OAuth `callback` lives on `routes/web.php` (no tenant auth on the callback route itself, nonce-verified) |
| Queue job | `App\Jobs\Tenant\PushCalendarEventToProviderJob` (`calendar-sync` queue, `tries=3`, `backoff=[5,30,120]`) — dispatched from `CalendarEventSubscriber` on create/update/cancel/delete when `source->shouldPushToProvider()` (manual + meeting + task + lead) |

Routes (tenant, `can:calendar.manage_integrations`):

```
GET    /calendar/integrations              status per provider for the authenticated user
GET    /calendar/integrations/{provider}/authorize   OAuth authorize URL
DELETE /calendar/integrations/{provider}   disconnect
```

Web (platform, no tenant scope on the route itself):

```
GET /api/oauth/calendar-sync/{provider}/callback   OAuth callback, redirects to `/#/calendar?integrations=…`
```

**Push behavior:**

- Pushes to **every** connected provider for the event's organizer (a user may connect both Google and Microsoft).
- `created` always calls `pushEvent()` on the driver (never `updateEvent()`), even if `external_event_id` is already set from a different provider.
- `updated` calls `updateEvent()` only when the connection's provider matches the currently-stored `external_provider`; otherwise it treats the connection as unsynced and calls `pushEvent()`.
- `cancelled`/`deleted` calls `cancelEvent()` only against the mapped provider.
- **Known Phase-1 limitation:** `external_provider`/`external_event_id` on `calendar_events` is a single-value mapping, not per-provider. If a user has both Google and Microsoft connected, only the last-written provider's ID is persisted, so update/cancel is only guaranteed to reach the most-recently-synced provider — see the [production readiness audit](/deployment/calendar-google-outlook-sync-1-4-0-production-readiness).
- Failures are caught, `report()`-ed, and logged (`calendar-sync.push-failed`) — a broken provider connection never blocks calendar writes (mirrors `LiveChatConversationService`'s soft-fail pattern).
- `GoogleCalendarProvider`/`MicrosoftCalendarProvider` expose a `fake()` escape hatch that is forced on in `testing` (and never enabled in `production`), so Pest never makes real HTTP calls even without `Http::fake()`.

**Excluded:** `assignee_id`, named team calendars, two-way (inbound) sync, pushing Project/Contact/Company overlays, Customer Portal visibility.

## Frontend

| Piece | Location |
|-------|----------|
| Page | `src/pages/calendar/calendar-page.tsx` |
| Time grid (Week/Day + DnD) | `src/pages/calendar/calendar-time-grid.tsx` (`@dnd-kit/core`) |
| Form / detail | `calendar-event-form-dialog.tsx`, `calendar-event-detail-sheet.tsx` |
| Datetime helpers | `src/lib/datetime.ts` (`appTimezone`, `moveEventToSlot`, …) |
| API | `calendarService` in `src/api/services.ts` |
| E2E | `e2e/tests/calendar/`, `npm run test:e2e:calendar` |

Drag-and-drop on Week/Day calls `PUT /calendar/events/{id}` with new `starts_at` / `ends_at` (15-minute snap). Display and inputs use the workspace timezone from settings. `starts_at` / `ends_at` / `cancelled_at` use `UtcDateTime` + `UtcIso` so non-UTC workspace timezones do not shift absolute instants.

## Permissions

Configured in `config/tenant-permissions.php` + default role map:

| Role | Grants |
|------|--------|
| admin | all including `view_all` and `manage_integrations` |
| manager | all except `delete`; includes `view_all`; no `manage_integrations` |
| staff | `view`, `create`, `update`, `delete` (own only via policy); no `view_all`, no `manage_integrations` |

`manage_integrations` (Calendar sync connect/disconnect) is admin-only, mirroring Meetings' `manage_integrations`.

## Registration

Migrate-only:

- `2026_07_20_230514_create_calendar_events_table.php`
- `2026_07_21_040000_register_calendar_module.php`
- `2026_07_21_040001_add_calendar_permissions.php`
- `2026_09_30_150000_create_calendar_provider_connections_table.php`
- `2026_09_30_150001_add_external_provider_to_calendar_events_table.php` (adds `external_provider`/`external_event_id`, unique index on tenant+provider+external id)
- `2026_09_30_150002_add_calendar_manage_integrations_permission.php`
- `2026_09_30_150003_bump_calendar_module_version_to_1_4_0.php`

Also listed in `CatalogSeeder` for fresh/local/CI.

## Dashboard

`DashboardWidgetService` registers widget id `calendar` (upcoming events), gated by `module:calendar` + `calendar.view`, scoped by `calendar.view_all`.

## Audit & activity

- Spatie `LogsActivity` on `CalendarEvent` records attribute changes.
- `App\Listeners\CalendarEventSubscriber` (registered in `AppServiceProvider`) writes platform audit entries (`activity` log name `platform`) for `calendar_event_created|updated|cancelled|deleted`, mirroring Leads/Tasks/Communication Templates.

## Tests

- Pest: `tests/Feature/Tenant/Calendar/CalendarEventTest.php`, `MeetingInviteeCalendarAclTest.php`, `CalendarIntegrationTest.php`, `CalendarEventProviderPushTest.php`
- Playwright: `npm run test:e2e:calendar` (includes invitee view-only + `calendar-overlay-sync.spec.ts`)

## Explicit non-goals (v1)

Assignment, named team calendars / department auto-share, two-way (inbound) Google/Outlook sync, pushing Project/Contact/Company overlays to providers. Meetings/Zoom/Meet live in the Meetings module.
