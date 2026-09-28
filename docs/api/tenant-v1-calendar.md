# Tenant API v1 — Calendar

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:calendar`, plus `can:calendar.*` / policies.

Visibility: without `calendar.view_all`, events where `organizer_id` is the current user, **or** meeting projections where the actor is on `meeting_attendees.user_id`, **or** manual events shared via `calendar_event_shares`. Invitees and **viewer** shares receive `read_only: true` and cannot update/cancel/delete. **Editor** shares may mutate manual events when they also have Spatie `calendar.update` / `delete`. No calendar assignment — `organizer_id` and `assignee_id` are prohibited on write payloads.

## Upcoming

### GET `/calendar/upcoming`

Query: `limit` (1–25, default 8). Scheduled events with `starts_at >= now()`, visibility-scoped.

## Events

### GET `/calendar/events`

Query: `search`, `status`, `from`, `to`, `trashed`, `sort` (default `starts_at`), `direction` (default `asc`), `page`, `per_page`, `paginate` (`0`/`false` returns a non-paginated range collection when `from`+`to` are set).

Events may have `source` `manual` | `meeting` | `project` | `task` | `lead` (sourced overlays are read on the grid; mutate via the parent module). Responses include `read_only` (boolean) for SPA gating.

### POST `/calendar/events`

Body: `title` (required), `description`, `starts_at`, `ends_at` (`after_or_equal:starts_at`), `all_day`, `timezone`, `color`.

Sets `organizer_id` to the authenticated user. Status `scheduled`, source `manual`.

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

## Permissions

`calendar.view` · `create` · `update` · `delete` · `view_all`
