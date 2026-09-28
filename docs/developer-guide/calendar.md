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

Key fields: `organizer_id`, `starts_at`, `ends_at`, `all_day`, `timezone`, `status` (`scheduled`|`cancelled`), `source` (`manual`|`meeting`|`project`|`task`|`lead`), nullable `source_type`/`source_id` (Meetings uses morph alias `meeting`; Projects/Tasks/Leads use `project` / `task` / `lead`).

**Excluded:** `assignee_id`, named team calendars, Google/Outlook sync.

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

Catalog version **1.1.0** (overlays). **1.2.0** adds invitee list/view ACL for meeting projections. **1.3.0** adds event-level shares (`viewer`/`editor`) for manual events. Pest: `TaskLeadCalendarOverlayTest.php`, `MeetingInviteeCalendarAclTest.php`, `CalendarEventShareTest.php`.

**Excluded:** `assignee_id`, named team calendars, Google/Outlook sync.
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
| admin | all including `view_all` |
| manager | all except `delete`; includes `view_all` |
| staff | `view`, `create`, `update`, `delete` (own only via policy); no `view_all` |

## Registration

Migrate-only:

- `2026_07_20_230514_create_calendar_events_table.php`
- `2026_07_21_040000_register_calendar_module.php`
- `2026_07_21_040001_add_calendar_permissions.php`

Also listed in `CatalogSeeder` for fresh/local/CI.

## Dashboard

`DashboardWidgetService` registers widget id `calendar` (upcoming events), gated by `module:calendar` + `calendar.view`, scoped by `calendar.view_all`.

## Audit & activity

- Spatie `LogsActivity` on `CalendarEvent` records attribute changes.
- `App\Listeners\CalendarEventSubscriber` (registered in `AppServiceProvider`) writes platform audit entries (`activity` log name `platform`) for `calendar_event_created|updated|cancelled|deleted`, mirroring Leads/Tasks/Communication Templates.

## Tests

- Pest: `tests/Feature/Tenant/Calendar/CalendarEventTest.php`, `MeetingInviteeCalendarAclTest.php`
- Playwright: `npm run test:e2e:calendar` (includes invitee view-only)

## Explicit non-goals (v1)

Assignment, named team calendars / department auto-share, Google/Outlook sync. Meetings/Zoom/Meet live in the Meetings module.
