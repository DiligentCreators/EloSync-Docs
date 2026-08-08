# Tenant API v1 — Notifications

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`. Authorization: `dashboard.view` (via Gate on each action).

Laravel database notifications (`notifications` table). Architecture: [Notification Architecture Contract](/developer-guide/notification-architecture-contract).

Realtime: Laravel Reverb private channel `tenant.{tenantId}.user.{userId}` (event `NotificationCreated`). SPA uses Echo as primary and polls every 90 seconds only while Echo is disconnected.

## List & unread

### GET `/notifications`

Paginated notifications for the authenticated user.

Transformed item shape:

| Field | Notes |
|-------|--------|
| `id` | Stable notification UUID (Laravel `notifications.id`) |
| `type` | Prefer `data.type` when present, else notification class |
| `data` | Versioned envelope (`schema_version: 1`) — title, body, category, delivery, source, **route descriptor** (never SPA URLs), dedupe_key, entity refs. |
| `read_at` | Nullable timestamp |
| `created_at` | |

### GET `/notifications/unread-count`

`{ "count": number }`

## Mark read

### POST `/notifications/{id}/read`

Marks a single notification read. 404 if not found for the current user.

### POST `/notifications/read-all`

Marks all unread notifications for the current user as read.

## Channels & producers

| Type | Channels (v1) |
|------|----------------|
| `lead.assigned` / `lead.reassigned` | `database`, `broadcast`, `webpush` |
| `lead.assigned.digest` | `database`, `broadcast`, `webpush` (bulk/import via NotificationBatch) |
| Follow-up created / due / overdue | `database` + optional `mail` (`email_notifications.lead_follow_up_*`, default off) |
| `lead.mentioned` | `database`, `broadcast`, `webpush` + optional `mail` (`email_notifications.lead_mentioned`, default off) |
| Task assigned | `database`, `webpush` + optional `mail` (`email_notifications.task_assigned`, default off) |
| Task completed / reopened | `database` + optional `mail` (`email_notifications.task_status`, default off) |
| `task.mentioned` | `database`, `webpush` + optional `mail` (`email_notifications.task_mentioned`, default off) |
| Task due today / overdue | `database` only (per task) |
| Task daily digest (due + overdue) | `mail` only (one per assignee per day; always on) |
| Meeting invite / update / cancel / reminder | `database`, `broadcast`, `webpush` + optional `mail` (`email_notifications.meeting_events`, default off) |
| Other module assignments | `database`, `webpush` + optional `mail` (`email_notifications.module_assigned`, default off) |
| Daily CRM summary (personal / team) | `mail` only (always on) |

Tenant setting `email_notifications` (JSON, group `notifications`) gates **mail only**. Digests and auth mail never consult it. See [Tenant settings](/developer-guide/tenant-settings).

### Aggregation

Bulk assign and import equal-distribution wrap `NotificationBatch`: per-lead assigns still audit, but notify is suppressed until flush — **one digest (or single if count===1) per assignee**. Idempotent via `data.dedupe_key`.

### Scheduled due digests

`crm:send-due-notifications` (every 5 minutes, `onOneServer`) walks tenants:

- **Tasks:** per-task in-app (`task.due_today` / `task.overdue`) with daily `dedupe_key`; after workspace `task_reminder_time` / **Daily Reminder Time** (default `09:00` local), one mail-only consolidated digest per assignee.
- **Daily CRM summary:** after the same reminder time, mail-only personal (`DailyUserSummaryNotification`) or all-users (`DailyTeamSummaryNotification`) digests. Workspace **Owners** (`superadmin`) and users with `receive_all_users_daily_summary` receive only the team email; everyone else with visible open CRM work receives only their personal email. Personal digests omit Leads when the recipient has `exclude_from_lead_auto_assign` (and leads alone do not trigger a send). Counts otherwise exclude won/lost leads, completed/cancelled tasks, and cancelled meetings. Team rollups include only users with at least one counted item and still show per-user Leads. Meeting counts are distinct host/attendee meetings (creator-only roles are not counted).
- Task digest idempotency is durable via `task_digest_deliveries` (`queued` → `sent`, or `failed` with `retry_after`). Mail success/failure listeners update the row; queue retries can reclaim after failure.
- CRM summary idempotency is durable via `daily_summary_deliveries` (unique `tenant_id, user_id, digest_date, kind` where `kind` is `personal`|`team`). Stale `queued` older than 45 minutes may be reclaimed (max 5 attempts). Missed sends after local midnight are not catch-up’d — keep scheduler + `emails` workers healthy through the reminder window.
- **Lead follow-ups:** unchanged due/overdue mail + database notifications.
- **Meetings:** due `MeetingReminder` rows send `meeting.reminder` (database + broadcast + web push + mail) to creator, host, and invitees; external guests get mail only. Idempotent via reminder `dedupe_key`.

Meeting lifecycle types: `meeting.invite`, `meeting.updated`, `meeting.cancelled`, `meeting.reminder`.

### Retention

`notifications:prune --days=90` (weekly schedule) deletes **read** notifications older than N days. Unread are never pruned.

### Broadcast auth

`POST /broadcasting/auth` — middleware `tenancy`, `auth:tenant-api`, `tenant.user`. Channel class: `App\Broadcasting\TenantUserChannel`.

## Web Push subscriptions

Standards-based Web Push (VAPID). Subscriptions belong to the authenticated tenant user. Duplicate `endpoint` values upsert (including reclaiming an endpoint from another user in the same tenant). Delivery requires configured `VAPID_*` env vars and a queue worker on `emails,default`. Expired endpoints are pruned on `404`/`410`.

### GET `/push-subscriptions/vapid-public-key`

Returns `{ public_key, subject, configured }`. Never exposes the private key.

### POST `/push-subscriptions`

Body:

| Field | Required | Notes |
|-------|----------|--------|
| `endpoint` | yes | Push service URL (max 500) |
| `public_key` | yes | p256dh |
| `auth_token` | yes | |
| `content_encoding` | no | `aes128gcm` (default) or `aesgcm` |
| `user_agent` | no | |

### PUT `/push-subscriptions`

Refresh/update keys for an endpoint (same body as POST; upsert semantics).

### DELETE `/push-subscriptions`

Body: `{ "endpoint": "..." }`. 404 if the endpoint is not owned by the current user.

## FCM device tokens (Phase 4b)

Native FCM HTTP v1 device tokens for the authenticated tenant user. Duplicate `token` values upsert (including reclaiming a token from another user). Delivery requires configured `FCM_*` API credentials; when unconfigured the channel skips without failing the notification job. The SPA registers a token only when complete `VITE_FIREBASE_*` web config is present.

### GET `/fcm-device-tokens/config`

Returns `{ configured, project_id }`. Never exposes the service-account email or private key.

### POST `/fcm-device-tokens`

Body:

| Field | Required | Notes |
|-------|----------|--------|
| `token` | yes | FCM registration token (32–512 chars) |
| `platform` | no | `web` (default), `android`, or `ios` |
| `user_agent` | no | |

Response includes `id`, `platform`, `token_suffix` (last 8 chars), timestamps — never the full token.

### DELETE `/fcm-device-tokens`

Body: `{ "token": "..." }`. 404 if the token is not owned by the current user.

## Future (hooks only)

- Per-user preferences (in-app / browser / email) — workspace-level email toggles ship via `email_notifications`
- SMS / webhooks / APNs as additional Laravel channels using `PlatformNotificationPayloadMapper`
