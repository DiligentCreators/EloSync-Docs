# Tenant API v1 — Short Links

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:short-links`, plus permission middleware / policies.

## Stats

### GET `/short-links/stats`

Same filters as list (minus pagination/sort). Payload:

`total_links`, `active_links`, `paused_links`, `total_clicks`.

## Short links CRUD

### GET `/short-links`

Query: `search` (title, destination_url), `status`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `code`, `short_url`, `click_count`, `last_clicked_at`, and nested `creator`.

### POST `/short-links`

| Field | Rules |
|-------|--------|
| `title` | optional string |
| `destination_url` | required URL |
| `status` | `active` \| `paused` (default `active`) |
| `expires_at` | optional datetime (workspace TZ in UI; stored UTC) |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | optional strings |

`uuid`, `code`, and `short_url` are server-generated. `short_url` uses `SHORT_LINK_BASE_URL` (e.g. `https://go.elosync.com/r/abc1234`).

### GET `/short-links/{id}`

Single short link resource.

### PUT `/short-links/{id}`

Partial update of link fields.

### DELETE `/short-links/{id}`

Soft delete. Permission: `short-links.delete`.

### POST `/short-links/{id}/restore`

Restore a soft-deleted link. Permission: `short-links.restore`.

### DELETE `/short-links/{id}/force`

Permanently delete a soft-deleted link and its click rows. Permission: `short-links.force.delete`.

## Analytics

### GET `/short-links/{id}/stats`

Permission: `short-links.view_analytics`.

Returns `click_count`, `last_clicked_at`, `clicks_by_day`, `top_referrers`, `devices`.

### GET `/short-links/{id}/clicks`

Permission: `short-links.view_analytics`.

Paginated click log (`clicked_at`, `device_type`, `referrer`, `user_agent`).

## Public redirect (central)

### GET `/r/{code}`

No authentication. Returns `302` to the destination URL with configured UTM query params appended.

- Primary lookup: 7-character `code` (e.g. `/r/s87f89`)
- Legacy: UUID still accepted (`/r/{uuid}`) for links created before 1.1.0

- Active, non-expired link + entitled workspace → redirect + async click record
- Paused, expired, missing, or soft-deleted → `404`
- Module not entitled → `403`

Rate limit: `short-link-redirects`.
