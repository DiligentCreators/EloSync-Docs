# Tenant API v1 — Calendar

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:calendar`, plus `can:calendar.*` / policies.

Visibility: without `calendar.view_all`, events where `organizer_id` is the current user, **or** meeting projections where the actor is on `meeting_attendees.user_id`, **or** manual events shared via `calendar_event_shares`, **or** events on a **named calendar** the actor may see (creator, linked department members when Departments is entitled, or `calendar.view_all` / `calendar.manage_calendars`). Invitees and **viewer** shares receive `read_only: true` and cannot update/cancel/delete. **Editor** shares may mutate manual events when they also have Spatie `calendar.update` / `delete`. `organizer_id` and `assignee_id` are prohibited on write payloads; optional `calendar_id` selects a named calendar (`null` / omitted = personal).

## Upcoming

### GET `/calendar/upcoming`

Query: `limit` (1–25, default 8). Scheduled events with `starts_at >= now()`, visibility-scoped.

## Events

### GET `/calendar/events`

Query: `search`, `status`, `from`, `to`, `trashed`, `sort` (default `starts_at`), `direction` (default `asc`), `page`, `per_page`, `paginate` (`0`/`false` returns a non-paginated range collection when `from`+`to` are set), `calendar_id` (`personal` or a named calendar id — **1.9.0**).

Events may have `source` `manual` | `meeting` | `project` | `task` | `lead` | `contact` | `company` | `external` (sourced overlays are read on the grid; mutate via the parent module; External is view-only). Responses include `read_only` (boolean) for SPA gating, nullable `calendar_id` / nested `calendar` when on a named calendar (**1.9.0**), and nullable `external_provider` (`google`\|`microsoft`) / `external_event_id` when mapped to a Calendar sync provider (**1.4.0**).

### POST `/calendar/events`

Body: `title` (required), `description`, `starts_at`, `ends_at` (`after_or_equal:starts_at`), `all_day`, `timezone`, `color`, optional `calendar_id` (named calendar the actor may post to; omit/`null` = personal).

Sets `organizer_id` to the authenticated user. Status `scheduled`, source `manual`. Posting to a named calendar requires `calendar.create` and membership (or manage override).

### GET `/calendar/events/{id}`

### PUT `/calendar/events/{id}`

Same writable fields as create (partial). Organizer/source/status fields prohibited.

Used by the SPA form and by Week/Day **drag-and-drop** reschedule (`starts_at` + `ends_at` only).

### POST `/calendar/events/{id}/cancel`

Sets `status=cancelled` and `cancelled_at`.

### DELETE `/calendar/events/{id}`

Soft delete.

## Shares (manual events)

Organizer or `calendar.view_all` may manage shares.

| Method | Path | Notes |
|--------|------|--------|
| GET | `/calendar/events/{id}/shares` | List shares |
| POST | `/calendar/events/{id}/shares` | Body: `user_id`, `access` (`viewer`\|`editor`) |
| PUT | `/calendar/events/{id}/shares/{share}` | Body: `access` |
| DELETE | `/calendar/events/{id}/shares/{share}` | Remove share |

## Named calendars (1.9.0)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/calendar/calendars` | List named calendars visible to the actor (`can:calendar.view`) |
| POST | `/calendar/calendars` | Create — body `name` (required), optional `department_id` when Departments entitled (`can:calendar.manage_calendars`) |
| PUT | `/calendar/calendars/{calendar}` | Update name / department |
| DELETE | `/calendar/calendars/{calendar}` | Soft-delete |

## Integrations (Google / Outlook sync — 1.4.0+)

Requires `calendar.manage_integrations`. Per-user connections; push covers manual + Meeting/Task/Lead (**1.5.0**) + Project/Contact/Company overlays (**1.7.0**). Inbound pull (**1.6.0**) + webhook watches (**1.8.0**) — see [developer guide](/developer-guide/calendar).

| Method | Path | Notes |
|--------|------|-------|
| GET | `/calendar/integrations` | Status per provider (`google`, `microsoft`): `connected`, `status`, `external_calendar_id`, `connected_at`, watch meta when active |
| GET | `/calendar/integrations/{provider}/authorize` | OAuth authorize URL; 422 if platform credentials unset |
| POST | `/calendar/integrations/sync` | Sync now — pulls provider window + ensures watch |
| DELETE | `/calendar/integrations/{provider}` | Disconnect; stops watch/push/pull (provider copies remain) |

OAuth callback (platform): `GET /api/oauth/calendar-sync/{provider}/callback` → `{FRONTEND_URL}/#/calendar?integrations={status}`.

Public webhooks (platform): `POST /webhooks/calendar-sync/{provider}` — Google channel headers / Microsoft Graph `validationToken` + `clientState` (**1.8.0**).

## Permissions

`calendar.view` · `create` · `update` · `delete` · `view_all` · `manage_integrations` · `manage_calendars`
