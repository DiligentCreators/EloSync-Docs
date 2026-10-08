# Calendar

Use Calendar to manage **your** personal events. Default view is **Week** (Google-style vertical time slots); **Day**, **Month**, and **Agenda** are also available.

## Access

- Workspace must have the **Calendar** module installed (included by default).
- Your role needs `calendar.view` (and `create` / `update` / `delete` for edits).

## Visibility

| Role | What you see |
|------|----------------|
| Staff (no `view_all`) | Events you organized, plus **meeting projections you are invited to** (view-only), plus events on any **named calendar** you belong to |
| Owner / Admin / Manager (`calendar.view_all`) | All workspace events |

There is **no calendar assignment** on individual events — you cannot assign a single event to someone else. Booking meetings, hosts, Zoom/Google Meet, and invitees belong to the **[Meetings](/user-guide/meetings)** module. Meeting projections appear for the **host** and for **internal invitees** (invitees see a **View only** badge; changes stay in Meetings).

Open Tasks with a due date, Leads with a next follow-up, and Projects with start/end dates also appear as sourced events when those modules (and Calendar) are installed. Sourced events are managed from their parent records — edit/cancel them there, not as manual Calendar events. Sourced events always stay on your **personal** calendar.

## Named team / department calendars

Besides your personal calendar, your workspace can have **named calendars** shared with a team or department:

1. Click **Manage calendars** on the Calendar toolbar (visible if your role has `calendar.manage_calendars` — Admin/Manager by default).
2. Click **New calendar**, give it a name, and optionally link it to a **Department** (only shown if the Departments module is installed).
3. Save. The calendar now appears as a filter chip on the Calendar page for everyone who can see it.

**Who can see a named calendar's events:** its creator, members (and the manager) of the linked department, and anyone with workspace-wide calendar visibility (`calendar.view_all`). If no department is linked, only the creator (and `view_all` roles) can see it.

**Posting events to a named calendar:** when creating or editing an event, pick the calendar from the **Calendar** dropdown (shows **Personal** plus any named calendar you belong to). You need `calendar.create` and must be a member of that calendar (or have calendar-admin rights) to post to it.

Use the filter chips (**All** / **Personal** / each named calendar) above the Calendar grid to narrow what you see. Deleting a named calendar keeps the history on past events but immediately stops sharing it going forward.

## Create an event

1. Open **Calendar** from the **CRM** sidebar section.
2. Click **New event**, click a day cell (Month), or click a time slot (Week/Day).
3. Enter title, start/end, optional description and all-day.
4. Save — the event is stored on **your** personal calendar.

Times use the workspace **Timezone** from Settings → General (same zone as meetings, reminders, and attendance — not only the browser’s local clock).

## Views

- **Week** (default) / **Day** — vertical hour slots; events are sized by start/end. Overlapping events share the column side-by-side. Click a slot to create at that hour. **Drag** an event to another day or time to reschedule (requires `calendar.update`; snaps to 15-minute increments).
- **Month** — month grid; chips show start time + title.
- **Agenda** — chronological list with start/end times and search.

## Cancel vs delete

- **Cancel event** — keeps the record, marks status `cancelled`.
- **Delete** — soft-deletes the event.

## Dashboard

The tenant dashboard shows an **Upcoming events** widget (same visibility rules as the list).

## Sync to Google / Outlook

If your workspace admin has `calendar.manage_integrations`, a **Sync** button appears on the Calendar toolbar.

1. Click **Sync** to open **Calendar sync**.
2. Click **Connect account** next to Google Calendar or Microsoft Outlook and sign in when redirected.
3. Once connected, **manual** events and **Meeting / Task / Lead / Project / Contact / Company** overlays are pushed to that provider (calendar **1.7.0**), and provider events are pulled into EloSync as read-only **External** events (calendar **1.6.0**).
4. Once connected, provider changes also arrive automatically in **near real-time** via a push-notification subscription (calendar **1.8.0**) — a "Near real-time" badge shows once it's active. Click **Sync now** to pull immediately, and the hourly sync still runs as a backstop.
5. Click **Disconnect** to stop future push/pull. This does not remove events already on the provider calendar.

**What is not synced:**

- External (pulled) events are view-only in EloSync — edit them in Google/Outlook.
- Named team calendars still push through each event’s organizer connection (there is no separate shared Google/Outlook calendar resource yet).

If **Connect account** is disabled with a "not configured on this platform" badge, ask your platform operator to configure that provider's OAuth app (see [Calendar deployment](/deployment/calendar)).
