# Calendar Module

Personal calendar events for tenant workspaces. Week/Day time grids, Month, and Agenda views with org-wide visibility for owners/admins. [Meetings](/user-guide/meetings-overview) (book + assign host + Zoom/Meet) project onto Calendar for the host and for internal invitees (view-only).

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [calendar.md](/user-guide/calendar) |
| Engineers | [calendar.md](/developer-guide/calendar) |
| Production / ops | [calendar.md](/deployment/calendar) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Tenant API | [tenant-v1-calendar.md](/api/tenant-v1-calendar) |

## Capabilities (v1)

- Personal events (`organizer_id` = creator)
- **Week** (default) + **Day** views with vertical hourly time slots (Google Calendar–style)
- Side-by-side layout for overlapping events
- Drag-and-drop reschedule on Week/Day (`calendar.update`)
- Month + Agenda views
- Create / update / cancel / delete
- Workspace timezone-aware display and editing
- `calendar.view_all` for workspace Owner / Admin / Manager oversight
- Upcoming events dashboard widget
- **Overlays** — [Meetings](/user-guide/meetings-overview) (host + internal invitees, view-only for invitees), [Projects](/user-guide/projects-overview) (start/end all-day), [Tasks](/user-guide/tasks-overview) (due datetime), and [Leads](/user-guide/leads-overview) (next follow-up) project sourced events (`source` = `meeting`|`project`|`task`|`lead`)
- Module licensing (`module:calendar`) + Spatie permissions — catalog **1.5.0**
- **Event shares (1.3.0)** — share a manual event with workspace users as **viewer** (read-only) or **editor** (can edit/delete with Spatie permissions)
- **Google / Outlook sync (1.4.0 + overlay push 1.5.0)** — each user connects their own Google Calendar or Microsoft Outlook account; **manual** events and **Meeting / Task / Lead** overlays are pushed one-way to the connected provider(s). See "Google / Outlook sync" below.
- Meeting invitee list/view ACL for projected meetings (**1.2.0**)
- Activity logging (`LogsActivity`)
- API `read_only` flag for invitee / sharee / non-organizer viewers

## Permissions

`calendar.view` · `create` · `update` · `delete` · `view_all` · `manage_integrations`

## Google / Outlook sync

- Personal, per-user connect — Settings live at **Calendar → Sync** (requires `calendar.manage_integrations`, granted to the admin role by default).
- One-way **EloSync → provider** push only. Editing an event in Google/Outlook does **not** flow back into EloSync.
- **Pushed:** manual calendar events, plus Meeting / Task / Lead overlays when they appear (or update / clear) on Calendar (**1.5.0**).
- **Not pushed:** Project / Contact / Company overlays (still deferred).
- Requires the platform operator to configure a Google and/or Microsoft OAuth app (see [deployment](/deployment/calendar)); if not configured, the Connect button is disabled with a "not configured on this platform" badge.
- Disconnecting stops future pushes; it does not delete events already created on the provider's calendar.

## Explicitly deferred

- Calendar assignment / assignee / create-on-behalf
- Named team calendars / department auto-share
- Two-way (inbound) Google/Outlook sync — pulling provider events back into EloSync
- Pushing Project / Contact / Company overlay events to providers
- Customer Portal visibility into calendar sync

Meetings, Zoom, and Google Meet are documented under [Meetings](/user-guide/meetings-overview).
