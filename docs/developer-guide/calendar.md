# Calendar — Developer Guide

> **Status: Implemented (v1 + 1.9.0 named calendars)**  
> Meetings depends on Calendar (required) and projects via `upsertFromSource`. No calendar `assignee_id` field.

## Ownership

| Concept | Owner |
|---------|--------|
| `calendar_events` table / CRUD / Week·Day·Month·Agenda UI | Calendar module |
| Meeting booking, host assignment, Zoom/Meet, reminders | [Meetings](/developer-guide/meetings) module (calls `CalendarEventService`) |

## Model

`App\Models\CalendarEvent` — `BelongsToTenant`, `LogsActivity`, `SoftDeletes`.

Key fields: `organizer_id`, `starts_at`, `ends_at`, `all_day`, `timezone`, `status` (`scheduled`|`cancelled`), `source` (`manual`|`meeting`|`project`|`task`|`lead`), nullable `source_type`/`source_id` (Meetings uses morph alias `meeting`; Projects/Tasks/Leads use `project` / `task` / `lead`), nullable `external_provider` (`google`|`microsoft`) / `external_event_id` (Calendar sync mapping — **1.4.0**), nullable `calendar_id` (named team/department calendar — **1.9.0**; `null` = personal, unchanged default).

**Excluded:** `assignee_id` field (overlays push via `shouldPushToProvider()` — see sync sections below).

## Visibility

- Without `calendar.view_all`: `organizer_id = actor` **or** meeting projection where the actor is a `meeting_attendees.user_id` row for `source_type=meeting` / `source_id` **or** the event belongs to a named calendar the actor may see (see **Named calendars** below)
- With `calendar.view_all` or Owner superadmin: all tenant events
- Update / cancel / delete remain organizer-only (or `view_all` / superadmin) — invitees and named-calendar members are read-only unless they are also the organizer
- Resource includes `read_only: true` when the viewer is not the organizer and lacks `view_all`
- `POST` always sets `organizer_id` to the authenticated user; `organizer_id` / `assignee_id` are **prohibited** on requests; `calendar_id` is optional (defaults to personal)

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

Catalog version **1.1.0** (overlays). **1.2.0** invitee ACL. **1.3.0** shares. **1.4.0** OAuth push. **1.5.0** Meeting/Task/Lead overlay push. **1.6.0** inbound pull (`source=external`). **1.7.0** Project/Contact/Company overlay push. **1.8.0** webhook-driven near real-time inbound. **1.9.0** named team/department calendars. Pest: overlay + push + inbound + watch/webhook + `NamedCalendarTest.php`.

## Google / Outlook sync (1.4.0–1.7.0)

Per-user push for **manual** + Meeting/Task/Lead/Project/Contact/Company (`shouldPushToProvider()`; External never). **1.6.0** inbound: `listEvents` → ingest as `External` (read-only; never pushed). EloSync-owned mappings skipped on pull. `POST /calendar/integrations/sync` + hourly `calendar:pull-provider-events`.

| Concept | Owner |
|---------|-------|
| Config | `config/calendar-sync.php` — `google.client_id/secret`, `microsoft.client_id/secret/tenant`, `oauth_callback_path`, `providers.fake` |
| Connection model | `App\Models\CalendarProviderConnection` (`BelongsToTenant`, `SoftDeletes`) — `tenant_id`, `user_id`, `provider` (`CalendarSyncProviderEnum`: `google`\|`microsoft`), encrypted `access_token`/`refresh_token`, `expires_at`, `status` (`CalendarProviderConnectionStatusEnum`), `external_calendar_id`, `meta` json |
| Providers | `App\Services\CalendarSync\Providers\GoogleCalendarProvider`, `MicrosoftCalendarProvider` — implement `CalendarSyncProviderInterface` (`authorizationUrl`, `exchangeCode`, `refreshAccessToken`, `pushEvent`, `updateEvent`, `cancelEvent`); driver resolution via `CalendarSyncProviderRegistry` |
| Orchestration | `App\Services\Tenant\CalendarSyncService` — `statusForUser`, `hasPlatformCredentials`, `authorizationUrl`, `disconnect`, `pushEvent($event, $action)` |
| Controller | `App\Http\Controllers\Tenant\Api\V1\CalendarIntegrationController` — `index` (status), `authorizeProvider` (redirect URL), `disconnect`; web OAuth `callback` lives on `routes/web.php` (no tenant auth on the callback route itself, nonce-verified) |
| Queue job | `App\Jobs\Tenant\PushCalendarEventToProviderJob` (`calendar-sync` queue, `tries=3`, `backoff=[5,30,120]`) — dispatched from `CalendarEventSubscriber` on create/update/cancel/delete when `source->shouldPushToProvider()` (manual + meeting + task + lead + project + contact + company; not external) |

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

**Excluded (this section):** `assignee_id`, Customer Portal calendar visibility. Named calendars, inbound pull, and webhooks are covered in later sections.

## Webhook-driven inbound sync (1.8.0)

Each connected account also gets a provider push-notification watch so inbound changes arrive near real-time instead of waiting for the hourly pull.

| Concept | Owner |
|---------|-------|
| Config | `config/calendar-sync.php` — `webhook_callback_path`, `watch.microsoft_ttl_minutes` (Graph `me/events` subscriptions cap at ~4230 min / 2.94 days), `watch.renew_within_days` |
| Watch state | `calendar_provider_connections.meta.watch` — `watch_id` (Google channel id / Graph subscription id), `resource_id` (Google only), `client_state` (Google channel token / Graph `clientState`, used to verify inbound requests), `expires_at`; `external_calendar_id` set alongside it (`primary` for Google) |
| Provider contract | `CalendarSyncProviderInterface::createWatch/renewWatch/stopWatch` — Google: POST `.../events/watch` then `channels/stop`; Microsoft: POST/PATCH/DELETE `https://graph.microsoft.com/v1.0/subscriptions`. Same `fake()` escape hatch (forced on in `testing`) as `listEvents` |
| Orchestration | `CalendarSyncService::ensureWatch` (no-op unless missing/near expiry), `renewWatch`, `stopWatch` (called from `disconnect()`), `resolveConnectionByWatch` (central-context lookup for the webhook) — all soft-fail: `report()` + `Log::warning('calendar-sync.watch-*-failed', …)`, never thrown |
| Webhook controller | `App\Http\Controllers\Central\CalendarSyncWebhookController` — Microsoft `?validationToken=` handshake (plain-text echo); Google verifies `X-Goog-Channel-Token` against `meta.watch.client_state` and ignores the initial `X-Goog-Resource-State: sync` message; Microsoft verifies each notification's `clientState`. Always responds `{"received": true}` and never surfaces errors to the provider |
| Renewal | `calendar:renew-provider-watches` (daily) — renews any watch inside `watch.renew_within_days` of `expires_at` |

Routes:

```
POST /webhooks/calendar-sync/{provider}   Google / Microsoft push notifications (no tenant scope on the route itself; connection resolved by watch id)
```

Watch is created on OAuth connect success and on **Sync now** (`CalendarIntegrationController::callback`/`sync`). The watch id is unique per provider across every tenant (single-database tenancy), so the webhook controller resolves the owning connection without any tenant context — the same model used by the OAuth callback. Hourly `calendar:pull-provider-events` remains the backstop for anything the webhook misses (provider outage, missed renewal, etc).

**Excluded:** Microsoft Graph lifecycle-notification endpoint (reminder-only subscriptions renew via the daily command instead).

## Named team/department calendars (1.9.0)

Named calendars let a tenant create shared calendars (e.g. "Sales team", "Ops") that are visible to more than just the organizer, without touching Personal calendar behavior (`calendar_id = null`).

| Concept | Owner |
|---------|-------|
| Model | `App\Models\Calendar` (`BelongsToTenant`, `LogsActivity`, `SoftDeletes`) — `name`, unique-per-tenant `slug`, nullable `department_id` (soft dependency — only settable when the `departments` module is entitled for the tenant), nullable `created_by` |
| Service | `App\Services\Tenant\CalendarService` — CRUD, `canManageAll()` (superadmin \| `calendar.view_all` \| `calendar.manage_calendars`), `isMember()` (creator, or department manager/member when departments is entitled), `assertCanPostEvents()` |
| Policy | `App\Policies\CalendarPolicy` — `viewAny`/`view` need `calendar.view`; `create`/`update`/`delete` need `calendar.manage_calendars` |
| Resource | `App\Http\Resources\Tenant\Api\V1\Calendar\CalendarResource` |

Routes (tenant, `module:calendar`):

```
GET    /calendar/calendars            can:calendar.view        — list calendars visible to the actor
POST   /calendar/calendars            can:calendar.manage_calendars
PUT    /calendar/calendars/{calendar} can:calendar.manage_calendars
DELETE /calendar/calendars/{calendar} can:calendar.manage_calendars
```

**Visibility** (`CalendarEventService::applyVisibilityScope`, mirrored in `CalendarEventPolicy::isNamedCalendarVisible` for single-event checks): an event with `calendar_id` set is visible to the calendar's creator, to department members/manager when `department_id` is set **and** the `departments` module is currently entitled for the tenant, and to anyone with `calendar.view_all`. Department-based visibility is re-checked live — uninstalling Departments stops department-based sharing without deleting the calendar or its events; creator visibility is unaffected by entitlement.

**Posting events:** creating or updating an event with a non-null `calendar_id` still requires `calendar.create`, and additionally requires membership in that calendar (creator, department member/manager, or an admin-level override via `canManageAll()`) — enforced in `CalendarEventService::resolveCalendarId()`.

**Overlays stay personal:** `upsertFromSource()` (Meetings/Projects/Tasks/Leads) never sets `calendar_id`; projected events are always personal to the organizer, matching provider push which keys off `organizer_id`/`source` only.

Catalog **calendar 1.8.0 → 1.9.0** (migrate-only + CatalogSeeder). New permission `calendar.manage_calendars` (admin/manager defaults, additive via `TenantPermissionSynchronizer`). Pest: `tests/Feature/Tenant/Calendar/NamedCalendarTest.php`.

**Excluded:** named-calendar provider push/watches, per-calendar notification digests.

## Frontend

| Piece | Location |
|-------|----------|
| Page | `src/pages/calendar/calendar-page.tsx` |
| Time grid (Week/Day + DnD) | `src/pages/calendar/calendar-time-grid.tsx` (`@dnd-kit/core`) |
| Form / detail | `calendar-event-form-dialog.tsx`, `calendar-event-detail-sheet.tsx` |
| Named calendars (create/edit/delete) | `calendar-manager-dialog.tsx` — gated by `calendar.manage_calendars`; department picker soft-gated by `hasModule('departments')` |
| Datetime helpers | `src/lib/datetime.ts` (`appTimezone`, `moveEventToSlot`, …) |
| API | `calendarService` in `src/api/services.ts` (`calendarService.calendars.*` for named calendars) |
| E2E | `e2e/tests/calendar/`, `npm run test:e2e:calendar` |

Drag-and-drop on Week/Day calls `PUT /calendar/events/{id}` with new `starts_at` / `ends_at` (15-minute snap). Display and inputs use the workspace timezone from settings. `starts_at` / `ends_at` / `cancelled_at` use `UtcDateTime` + `UtcIso` so non-UTC workspace timezones do not shift absolute instants.

The event list/filter chips (**All** / **Personal** / one per named calendar) pass `calendar_id` (`'personal'` or a calendar id) through to `GET /calendar/events`, server-filtered the same way as the visibility scope.

## Permissions

Configured in `config/tenant-permissions.php` + default role map:

| Role | Grants |
|------|--------|
| admin | all including `view_all`, `manage_integrations`, `manage_calendars` |
| manager | all except `delete`; includes `view_all`, `manage_calendars`; no `manage_integrations` |
| staff | `view`, `create`, `update`, `delete` (own only via policy); no `view_all`, no `manage_integrations`, no `manage_calendars` |

`manage_integrations` (Calendar sync connect/disconnect) is admin-only, mirroring Meetings' `manage_integrations`. `manage_calendars` (named calendar CRUD) is granted to admin **and** manager by default.

## Registration

Migrate-only:

- `2026_07_20_230514_create_calendar_events_table.php`
- `2026_07_21_040000_register_calendar_module.php`
- `2026_07_21_040001_add_calendar_permissions.php`
- `2026_09_30_150000_create_calendar_provider_connections_table.php`
- `2026_09_30_150001_add_external_provider_to_calendar_events_table.php` (adds `external_provider`/`external_event_id`, unique index on tenant+provider+external id)
- `2026_09_30_150002_add_calendar_manage_integrations_permission.php`
- `2026_09_30_150003_bump_calendar_module_version_to_1_4_0.php`
- …through `2026_10_08_160000_bump_calendar_module_to_1_8_0.php` (webhook-driven inbound sync; no schema change — reuses `calendar_provider_connections.meta`)
- `2026_10_08_163000_create_calendars_table.php`, `2026_10_08_163500_add_calendar_id_to_calendar_events_table.php`, `2026_10_08_164000_add_calendar_manage_calendars_permission.php`, `2026_10_08_170000_bump_calendar_module_to_1_9_0.php` (named team/department calendars)

Also listed in `CatalogSeeder` for fresh/local/CI.

## Dashboard

`DashboardWidgetService` registers widget id `calendar` (upcoming events), gated by `module:calendar` + `calendar.view`, scoped by `calendar.view_all`.

## Audit & activity

- Spatie `LogsActivity` on `CalendarEvent` records attribute changes.
- `App\Listeners\CalendarEventSubscriber` (registered in `AppServiceProvider`) writes platform audit entries (`activity` log name `platform`) for `calendar_event_created|updated|cancelled|deleted`, mirroring Leads/Tasks/Communication Templates.

## Tests

- Pest: `tests/Feature/Tenant/Calendar/CalendarEventTest.php`, `MeetingInviteeCalendarAclTest.php`, `CalendarIntegrationTest.php`, `CalendarEventProviderPushTest.php`, `CalendarProviderWatchTest.php`, `CalendarWebhookInboundSyncTest.php`, `NamedCalendarTest.php`
- Playwright: `npm run test:e2e:calendar` (includes invitee view-only, `calendar-overlay-sync.spec.ts`, and a named-calendar case in `calendar.workflow.spec.ts`)

## Explicit non-goals

`assignee_id` field, named-calendar provider sync/watches (team events still push via each event’s `organizer_id` OAuth connection), per-provider `external_event_id` mapping (single-value today — see the [1.4.0 production readiness audit](/deployment/calendar-google-outlook-sync-1-4-0-production-readiness)), Customer Portal calendar visibility. Meetings/Zoom/Meet live in the Meetings module.
