# Tenant Live Chat API

Module: `live-chat` **1.0.1** · Base: `/api/tenant/v1/live-chat` (authenticated) and `/api/public/live-chat/{publicKey}` (widget).

## Public widget

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/public/live-chat/{publicKey}/bootstrap` | Greeting, require_prechat, is_active |
| POST | `/api/public/live-chat/{publicKey}/sessions` | Returns `session_token` once (max body 64KB; throttle `live-chat-widget-session`) |
| POST | `/api/public/live-chat/{publicKey}/conversations` | Bearer session; open/create — response: `uuid`, `status`, `created_at` only |
| GET | `/api/public/live-chat/{publicKey}/conversations/{uuid}/messages` | Poll with `since_id` — body/direction/id/timestamps only |
| POST | `/api/public/live-chat/{publicKey}/conversations/{uuid}/messages` | Visitor text (`body`, max 5000; max payload 64KB) |

Inactive widget → 404. Missing entitlement → 403. Bad/expired/revoked token → 401. CORS: Origin reflected for credential-less embeds.

## Tenant agent

| Method | Path | Permission |
|--------|------|------------|
| GET | `/live-chat/widget` | `view` or `manage` |
| PATCH | `/live-chat/widget` | `manage` |
| POST | `/live-chat/widget/regenerate-key` | `manage` |
| GET | `/live-chat/conversations` | `view` |
| GET | `/live-chat/conversations/{id}` | `view` |
| GET | `/live-chat/conversations/{id}/messages` | `view` |
| POST | `/live-chat/conversations/{id}/read` | `view` |
| POST | `/live-chat/conversations/{id}/messages` | `reply` |
| PATCH | `/live-chat/conversations/{id}` | Policy: `assign` / `reply` / `update` per field (`assigned_to`, `status`, `lead_id`) |

`{id}` accepts numeric id or conversation uuid.
