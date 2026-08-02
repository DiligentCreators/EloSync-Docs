# Tenant Settings — Developer Guide

## Core types

| Piece | Role |
|-------|------|
| `App\Support\TenantSettingDefinitions` | Catalog of overridable keys + sensitive keys (includes `task_reminder_time`, attendance office-hour keys, `meetings_default_provider`, `session_lifetime_minutes`) |
| `App\Services\Tenant\TenantSettingService` | Hierarchy resolver, cache, branding uploads, runtime mail/config, public bootstrap |
| `App\Services\Storage\FileUploadService` | Disk-agnostic store/replace/delete/url (shared with Central) |
| `TenantSettingController` | Authenticated list/update, test-mail, branding upload |
| `PublicSettingsController` (tenant) | `GET /api/tenant/v1/public/settings` — resolved payload, no secrets |
| `InitializeTenancy` | After tenancy init, calls `TenantSettingService::applyRuntimeConfig()` |

## Hierarchy

`TenantSettingService::resolve($key)` returns `{ value, source }` where `source` is one of:

- `tenant` — row in `tenant_settings`
- `workspace` — Tenant model column (`workspace_name`, `company_name`, `timezone`, …)
- `central` — `SystemSettingService`
- `system` — hard-coded / config fallback

Business code must call the service (`applicationName()`, `logoUrl()`, `supportEmail()`, `buttonColor()`, `usesCustomMailProvider()`, …) instead of branching on raw settings.

`task_reminder_time` is a string `H:i` value (default `09:00`) under the `general` group (UI label: **Daily Reminder Time**). `crm:send-due-notifications` compares `now($workspaceTimezone)->format('H:i')` against that value so digests and daily CRM summaries gate on the workspace timezone even if the scheduler process default remains UTC. `applyRuntimeConfig()` still sets PHP `app.timezone` / `date_default_timezone_set` for `today()` / due-date queries and Sanctum; mail overlay failures must not undo that timezone.

Attendance group keys (system defaults when unset): `office_start_time` (`09:00`), `office_end_time` (`18:00`), `attendance_grace_minutes` (`15`), `work_week_days` (`[1,2,3,4,5]` ISO weekdays). Used by login check-in and `PayPeriodCalculator`.

`meetings_default_provider` is `none` \| `google_meet` \| `zoom` (default `none`) under the `general` group. It preselects the Meetings schedule form; OAuth connections remain on Meetings → Integrations.

`session_lifetime_minutes` is an integer under the `security` group (`0`–`43200`). `0` means never expire: public bootstrap exposes it, SPA idle logout is skipped, and `TenantAuthBootstrapService::issueAccessToken()` creates a Sanctum token with `expires_at = null`. When unset, resolution falls back to Central `session_lifetime_minutes`.

## Workspace timezone convention {#timezone-and-scheduled-datetimes}

**Rule:** One workspace timezone (`Settings → General → Timezone`, e.g. `Asia/Karachi`) is the wall-clock source of truth for **all** tenant date/time behavior. Do **not** invent a second timezone per module (attendance, meetings, reminders, etc.). Server / process UTC is for storage and wire format only — never for user-facing scheduling clocks.

### What uses the workspace timezone

| Area | Setting / field | Behavior when timezone is `Asia/Karachi` |
|------|-----------------|------------------------------------------|
| Daily Reminder Time | `task_reminder_time` | Digests and daily CRM summaries send at that **Karachi** wall clock (compare `now($workspaceTimezone)`), not server UTC |
| Task due dates | `tasks.due_at` | Entered/shown in workspace TZ; stored as UTC instants |
| Lead follow-ups | `lead_follow_ups.due_at` | Same as tasks — display/edit in workspace TZ; due/overdue alerts use workspace “today” |
| Meetings / calendar | `starts_at` / `ends_at` / `remind_at` | Form locked to workspace TZ; list/detail format in that TZ |
| Attendance login check-in | “today” + `check_in` | `Carbon::now($workspaceTimezone)` for date and clock; late vs present uses office hours in that TZ |
| Office hours | `office_start_time` / `office_end_time` / grace | Separate clocks from Daily Reminder Time, but same workspace timezone |
| Work week / payroll calendar | `work_week_days` | Working days interpreted with workspace-local dates |

Wall-clock settings (`H:i` strings such as Daily Reminder Time and office start/end) are always **local to the workspace timezone**. Absolute scheduled datetimes are stored as UTC and projected into that timezone for UI and business “today/due” logic.

### Implementation notes

- `applyRuntimeConfig()` sets PHP `app.timezone` and `date_default_timezone_set` to the resolved workspace timezone (for `now()` / `today()`, Sanctum expiry comparisons, reminder gates, and template placeholders). Apply timezone **before** mail overlay; mail failures must not leave the process on server UTC.
- Scheduled / absolute fields the SPA sends as UTC ISO (meetings, calendar events, task due times, lead follow-ups) use `App\Casts\UtcDateTime` so naive DB values are always read/written as **UTC**, then projected into `app.timezone` for in-app Carbon. API resources serialize those fields with `App\Support\UtcIso` (unambiguous UTC ISO-8601). Do **not** use the default `datetime` cast for new absolute scheduling columns when `app.timezone` may be non-UTC.
- Reminder gates in `crm:send-due-notifications` must compare against `now($workspaceTimezone)`, not bare `now()`, so scheduler workers stuck on UTC still honor the workspace clock.
- Attendance login check-in must resolve “today” / check-in / late threshold with an explicit workspace timezone (`Carbon::now($timezone)`), not the server default.
- SPA display/edit helpers live in `SaaS-Frontend/src/lib/datetime.ts` (`formatAppDateTime`, `appLocalInputToIso`, …) and use the workspace timezone from `useSettingsStore`.

## Mail provider

`mail_mode` is `system` (inherit Central via `EmailManager`) or `custom` (tenant provider: SMTP / Postmark / Mailgun / …).

`usesCustomMailProvider()` is true when `mail_mode=custom`, or (legacy) when `mail_host` is filled and `mail_mode` is unset. Backfill with `php artisan email:migrate-tenant-mail-modes`.

Queued mail re-applies config via `ApplyEmailRuntimeConfig` on the `emails` queue.

Secrets are encrypted with `Crypt` and masked as `********` in the admin API.

## Admin API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/tenant/v1/settings` | Resolved values + `source` / `is_overridden` |
| PUT | `/api/tenant/v1/settings` | `{ "settings": { "key": value } }` |
| POST | `/api/tenant/v1/settings/test-mail` | `{ "email": "…", "settings"?: {…} }` — structured result |
| POST | `/api/tenant/v1/settings/branding/{logo\|favicon}` | Multipart `file` → `FileUploadService` under `tenants/{uuid}/branding/…` |
| GET | `/api/tenant/v1/email-logs` | Workspace-scoped delivery logs |
| GET | `/api/tenant/v1/email-logs/{uuid}` | Show one log |

Permissions (`config/tenant-permissions.php`): `settings.list`, `settings.update`, `email-logs.list`, `email-logs.view`.

Object storage: [object-storage.md](/developer-guide/object-storage).

Requires tenancy (`X-Tenant-Domain` / domain) + `auth:tenant-api`.

## Public API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/tenant/v1/public/settings` | Resolved branding + Central-inherited maintenance/password/session |

## Frontend

| Piece | Role |
|-------|------|
| `TenantSettingsPage` | `/settings` — General / Security / Branding / Mail |
| `tenantSettingService` | Tenant API client |
| `useSettingsStore` | Bootstraps from `GET …/public/settings` on app mount and again after auth settles (session restore, soft login, logout). Tenant path sends Bearer token and, when known, `X-Tenant-Domain` from the auth workspace so `InitializeTenancy` can resolve without a host-bound domain. Guest loads may fall back to Central once. In-app brand text stays empty until `loaded`; tab title falls back to `EloSync`. Central fallback never overwrites branding that is already loaded (avoids stomping after save/login). Covered by `src/store/settings-store.test.ts`. |

## Schema

`tenant_settings`: `tenant_id`, `key`, `value`, `type`, `group`, unique `(tenant_id, key)`.

Profile sync: saving `company_name`, `timezone`, `locale`, `currency`, `logo_path` also updates the `tenants` row. `workspace_name` is stored on the tenant (not as a KV override of Central).

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Settings/
```

Playwright: `npm run test:e2e:tenant-settings` in `SaaS-Frontend`.
