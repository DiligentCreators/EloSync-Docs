# Tenant Live Chat API

Module: `live-chat` **1.4.0** · Base: `/api/tenant/v1/live-chat` (authenticated) and `/api/public/live-chat/{publicKey}` (widget).

## Public widget

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/public/live-chat/{publicKey}/bootstrap` | Greeting, branding, suggested_replies, agent_display_name, show_powered_by, offline, within_hours, accepting_live, optional realtime |
| POST | `/api/public/live-chat/{publicKey}/sessions` | Returns `session_token` once (max body 64KB; throttle `live-chat-widget-session`); banned visitors 403; seeds presence |
| POST | `/api/public/live-chat/{publicKey}/heartbeat` | Bearer session; updates last_seen_at / page / referrer / UA fields |
| POST | `/api/public/live-chat/{publicKey}/conversations` | Bearer session; open/create — may be offline thread |
| GET | `/api/public/live-chat/{publicKey}/conversations/{uuid}/messages` | Poll with `since_id` (excludes `direction=note`) |
| POST | `/api/public/live-chat/{publicKey}/conversations/{uuid}/messages` | Visitor text or multipart attachment; offline leave-a-message when outside hours |

Inactive widget → 404. Missing entitlement → 403. Bad/expired/revoked token → 401. CORS: Origin reflected for credential-less embeds.

## Tenant agent

| Method | Path | Permission |
|--------|------|------------|
| GET | `/live-chat/widget` | `view` or `manage` |
| PATCH | `/live-chat/widget` | `manage` (includes suggested_replies, show_powered_by, agent_display_name) |
| POST | `/live-chat/widget/regenerate-key` | `manage` |
| GET/POST/PATCH/DELETE | `/live-chat/canned-replies` | `view` list; `manage` write |
| GET/POST/PATCH/DELETE | `/live-chat/departments` | `view` list; `manage` write |
| GET | `/live-chat/visitors/live` | `view` (`within` minutes, default 10) |
| GET | `/live-chat/stats` | `view` |
| POST | `/live-chat/visitors/{id}/open-chat` | `reply` |
| POST | `/live-chat/visitors/{id}/ban` · `/unban` | `manage` |
| GET | `/live-chat/conversations` | `view` (filters: status, unread, my, assigned_to, department_id, is_offline, search) |
| GET | `/live-chat/conversations/{id}` | `view` |
| GET | `/live-chat/conversations/{id}/messages` | `view` (includes notes) |
| POST | `/live-chat/conversations/{id}/read` | `view` |
| POST | `/live-chat/conversations/{id}/messages` | `reply` (optional attachment; `as_note` boolean) |
| POST | `/live-chat/conversations/{id}/escalate` | `reply` (+ Help Desk entitled) |
| PATCH | `/live-chat/conversations/{id}` | Policy: `assigned_to`, `status`, `lead_id`, `department_id` |

`{id}` accepts numeric id or conversation uuid.

## Realtime channels

- `private-tenant.{tenantId}.live-chat.inbox`
- `private-tenant.{tenantId}.live-chat.conversation.{uuid}`
- Public `live-chat.visitor.{uuid}` for embed

Events: `LiveChatMessageSent`, `LiveChatConversationUpdated`, `LiveChatVisitorPresence`.
