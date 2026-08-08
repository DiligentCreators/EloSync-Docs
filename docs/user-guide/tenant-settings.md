# Tenant Settings — User Guide

Workspace **Settings** lets each tenant customize identity and mail without affecting other workspaces or the Central Application.

## Open Settings

In the Tenant Application sidebar, open **Settings**.

You need permission to view/update settings (workspace owners have this by default).

## Workspace timezone

**Timezone** under General is the single clock for the whole workspace. When it is set to e.g. `Asia/Karachi`, every date and time in the Tenant Application follows that zone — not the server’s UTC clock and not the browser’s local zone alone:

- Daily Reminder Time (task digest + daily CRM summary emails)
- Task due dates and lead follow-up due times
- Meeting and calendar start/end times (and meeting reminders)
- Attendance “today”, login check-in time, and office start/end + late grace

There is no separate attendance or meeting timezone. Change **Timezone** once; all of the above move with it. The same rule applies to every current module and any future module that shows dates, due times, schedules, or office hours.

## General

| Field | Behavior |
|-------|----------|
| **Workspace Name** | Display name for the workspace. Also used as the browser/app title unless you set Application Name. |
| **Application Name** | Optional title override. Leave blank to use Workspace Name. |
| **Company Name** | Used in emails and documents. |
| **Timezone** | Workspace wall-clock zone for reminders, due dates, meetings, calendar, and attendance. Inherit from Central when not customized. |
| **Locale / Currency** | Workspace defaults. Inherit from Central when not customized. |
| **Daily Reminder Time** | Local workspace time (default `09:00`) in **Timezone** — not server UTC — for the daily CRM summary email and the consolidated task due digest. Assignees still get in-app alerts per due/overdue task. |
| **Default meeting provider** | Preselects None / Google Meet / Zoom on the Meetings schedule form (`meetings_default_provider`). Connecting providers is done under Meetings → Integrations. |
| **Trash retention** | How long soft-deleted items stay in Trash before automatic permanent purge (`trash.retention_days`). Choose **30**, **90**, or **365** days, or **Forever**. Applies to leads, tasks, contacts, companies, invoices, and other SoftDeletes modules (not Team Chat messages — see Team Chat retention; not Email mailboxes — disconnect those separately; not IMAP Email Trash folders). Purge is irreversible. |

## Notifications

**Settings → Notifications** controls which **event emails** the workspace sends. Defaults are **off** for every toggle. In-app notifications and browser push are not affected.

| Toggle | When email is sent (if enabled) |
|--------|----------------------------------|
| **Task assigned** | A task is assigned to someone |
| **Task completed / reopened** | A task is completed or reopened |
| **Mentioned in a task comment** | Someone @mentions you in a task comment |
| **Follow-up created** | A lead follow-up is created |
| **Follow-up due / overdue** | A lead follow-up becomes due or overdue |
| **Mentioned in a lead note** | Someone @mentions you in a lead note |
| **Meeting events** | Meeting invite, update, cancel, or reminder |
| **Other module assignments** | Contact, company, opportunity, invoice, and similar assignment emails |

Always sent (not toggleable here):

- Daily task due digest and daily CRM summary (at **Daily Reminder Time**)
- Auth emails (password reset, email verification)

## Team Chat

Shown when the **Team Chat** module is installed.

| Field | Behavior |
|-------|----------|
| **Message & file retention** | How long Team Chat keeps messages and attachments (`team-chat.retention_days`). Choose **30**, **90**, or **365** days, or **Forever**. Forever keeps history indefinitely; otherwise older messages (and their files) are permanently purged on a schedule. |

See [Team Chat](/user-guide/team-chat).

## Attendance

Shown when the **Attendance** module is installed.

| Field | Behavior |
|-------|----------|
| **Office start / end time** | Local workspace office hours (**Timezone** above) used for login check-in classification. Separate from Daily Reminder Time. |
| **Grace period (minutes)** | Check-ins after start time plus grace are marked **Late** (default `15`). |
| **Work week days** | Weekdays that count as working days for payroll calendars (default Mon–Fri), using workspace-local dates. |

## Security

| Field | Behavior |
|-------|----------|
| **Session timeout (minutes)** | How long a signed-in user may stay idle before the app signs them out. Inherits the Central platform default when not customized. |
| **Never timeout** | Sets timeout to `0` so users stay signed in until they use **Sign out** (or an admin revokes their token). Issues a non-expiring API token for that workspace. |

Password length / special-character rules stay under Central Settings.

## Branding

| Field | Behavior |
|-------|----------|
| **Button color** | Primary buttons and accents for this workspace only. |
| **Support email** | Shown in tenant-facing emails when set. |
| **Logo / Favicon** | Upload immediately. If unset, the platform (Central) logo/favicon is used automatically. |

Hints under fields show when a value is still inheriting the Central default.

With the **Branded** marketplace module, logo and application name are also used in email chrome and web push. See [Branded](/user-guide/branded).

## Marketplace

When Marketplace is enabled for the platform, **Settings → Marketplace** links to the catalog. From there you can **Install** free modules, **Subscribe** to paid ones, and **Remove** / **Cancel subscription** for opt-in modules you no longer need. Core modules (Leads, Tasks) cannot be removed. See [Tenant Application](/user-guide/tenant-application#marketplace-add--remove-modules).

## Domain (Branded module)

When **Branded** is installed, **Settings → Domain** walks you through a three-step flow: enter your website address, copy DNS records into your domain provider, then check the connection. See [Branded](/user-guide/branded).

## Mail

Choose **Use system provider** to inherit Central Application mail, or **Use custom provider** for workspace-specific SMTP / Postmark / Mailgun.

- Password and API token fields never show the stored secret; leave blank to keep the existing value.
- With a custom Postmark/Mailgun provider, copy the workspace **Webhook URL**, set the signing secret, and select delivery events to process.
- Use **Send test** to verify delivery (uses the form values, including unsaved changes when supported).
- Delivery history is available under **Email logs** — open a message to view the full body and **Resend** when permitted.

## What you cannot change

Platform registration, maintenance mode, password policy, and billing defaults stay under Central Settings.
