# Tenant API v1 — Developers

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `can:settings.manage_developers`.

Platform capability (not a Marketplace module). See [Tenant API & Webhooks](/developer-guide/tenant-api-webhooks).

## API tokens

### GET `/developers/api-tokens`

List integration tokens for the workspace (plaintext omitted).

### POST `/developers/api-tokens`

Body: `{ "name": string, "expires_at"?: ISO-8601 }`.

Response includes one-time `token` (`es_…`).

### POST `/developers/api-tokens/{token}/rotate`

Issues a new secret; previous bearer stops working. One-time `token` in response.

### DELETE `/developers/api-tokens/{token}`

Revoke permanently.

## Webhooks

### GET `/developers/webhooks/events`

Returns `{ "events": string[] }` catalog.

### GET `/developers/webhooks`

List endpoints (signing secret omitted; `has_signing_secret` flag).

### POST `/developers/webhooks`

Body: `{ "name": string, "url": string, "events": string[], "is_active"?: boolean }`.

URL must be public http(s) (SSRF rejected). Response includes one-time `signing_secret` (`ews_…`).

### PUT `/developers/webhooks/{webhook}`

Update name / url / events / is_active.

### POST `/developers/webhooks/{webhook}/rotate`

Rotate signing secret (shown once).

### POST `/developers/webhooks/{webhook}/test`

Synchronous test delivery (`webhook.test`). Throttled.

### DELETE `/developers/webhooks/{webhook}`

Soft-delete endpoint.

### GET `/developers/webhooks/deliveries`

Optional query `endpoint_id`. Recent delivery ledger (status, attempts, response code).
