# Tenant API v1 — Announcements

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:announcements`.

**Read paths** (no Spatie permission): `GET unread`, `GET inbox`, `GET /announcements` (published + `visible_to_staff` for non-managers), `GET /{id}` (published + staff audience), `POST /{id}/read`.

**Mutation paths** use `can:announcements.*` as noted.

Absolute datetimes serialize as UTC ISO-8601 (`...Z`).

## Unread (login dialog)

### GET `/announcements/unread`

Published, not expired, `visible_to_staff`, not yet read by the actor.

## Inbox

### GET `/announcements/inbox`

Recent published announcements with `is_read`, `first_read_at`, `last_read_at` for the actor.

## List

### GET `/announcements`

Non-managers: same visibility as inbox (paginated).

Managers with `announcements.update` may filter:

- `status` — `draft` | `published` | `archived`
- `trashed` — `only` | `true` (with trashed)
- `search`, `sort`, `direction`, `page`, `per_page`

## Create

### POST `/announcements`

Permission: `announcements.create`

Body: `title` (required), `body` (required HTML subset from the workspace editor; notifications strip tags for previews), `status` (optional, default `draft`), `published_at`, `expires_at`, audience booleans:

- `visible_to_staff` (default `true`)
- `visible_to_customer_portal` (default `false`; coerced off unless Customer Portal is entitled)
- `visible_to_vendor_portal` (default `false`; coerced off unless Vendor Portal is entitled)

At least one audience must remain true after entitlement coercion. Resources include the three flags.

Publishing (`status=published`) notifies other tenant users (`type: announcement`) only when `visible_to_staff` is true.

## Show

### GET `/announcements/{id}`

Published non-expired for everyone. Managers with update may open drafts/archived/trashed.

## Update

### PUT `/announcements/{id}`

Permission: `announcements.update`

Transitioning into `published` sets `published_at` when missing and fans out notifications.

## Soft delete / restore / force delete

- `DELETE /announcements/{id}` → `announcements.delete`
- `POST /announcements/{id}/restore` → `announcements.restore`
- `DELETE /announcements/{id}/force` → `announcements.force.delete`

## Mark read

### POST `/announcements/{id}/read`

No mutation permission. Upserts read receipt; sets `first_*` once; always updates `last_read_at` / `last_read_ip` from `$request->ip()`.

## Readers

### GET `/announcements/{id}/readers`

Permission: `announcements.view_reads`

Returns user + first/last read timestamps and IPs.
