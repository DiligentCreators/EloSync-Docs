# Calendar

Use Calendar to manage **your** personal events. Default view is **Week** (Google-style vertical time slots); **Day**, **Month**, and **Agenda** are also available.

## Access

- Workspace must have the **Calendar** module installed (included by default).
- Your role needs `calendar.view` (and `create` / `update` / `delete` for edits).

## Visibility

| Role | What you see |
|------|----------------|
| Staff (no `view_all`) | Events you organized, plus **meeting projections you are invited to** (view-only) |
| Owner / Admin / Manager (`calendar.view_all`) | All workspace events |

There is **no calendar assignment**. You cannot assign a calendar to someone else. Booking meetings, hosts, Zoom/Google Meet, and invitees belong to the **[Meetings](/user-guide/meetings)** module. Meeting projections appear for the **host** and for **internal invitees** (invitees see a **View only** badge; changes stay in Meetings).

Open Tasks with a due date, Leads with a next follow-up, and Projects with start/end dates also appear as sourced events when those modules (and Calendar) are installed. Sourced events are managed from their parent records — edit/cancel them there, not as manual Calendar events.

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
3. Once connected, **manual** events and **Meeting / Task / Lead** overlays you create, edit, or clear are pushed to that provider automatically — you do not need to do anything else.
4. Click **Disconnect** to stop future pushes at any time. This does not remove events already pushed to your Google/Outlook calendar.

**What is not synced:**

- Project, Contact, and Company events shown on your calendar (these stay EloSync-only; Meeting / Task / Lead overlays **are** pushed when Sync is connected — calendar **1.5.0**).
- Changes made directly in Google or Outlook are **not** pulled back into EloSync (one-way sync only).

If **Connect account** is disabled with a "not configured on this platform" badge, ask your platform operator to configure that provider's OAuth app (see [Calendar deployment](/deployment/calendar)).
