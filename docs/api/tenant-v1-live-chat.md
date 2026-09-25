# Tenant Live Chat API

Module: `live-chat` **1.5.2** · Base: `/api/tenant/v1/live-chat` (authenticated) and `/api/public/live-chat/{publicKey}` (widget).

## Public widget

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/public/live-chat/{publicKey}/bootstrap` | Greeting, branding, suggested_replies, agent_display_name, show_powered_by, offline, within_hours, accepting_live, optional realtime |
| POST | `/api/public/live-chat/{publicKey}/sessions` | Returns `session_token` once (max body 64KB; throttle `live-chat-widget-session`); banned visitors 403; seeds presence |
| POST | `/api/public/live-chat/{publicKey}/heartbeat` | Bearer session; updates last_seen_at / page / referrer / UA fields; returns `open_conversation_uuid` when an open thread exists (embed resume) |
| POST | `/api/public/live-chat/{publicKey}/conversations` | Bearer session; open/create — may be offline thread |
| GET | `/api/public/live-chat/{publicKey}/conversations/{uuid}/messages` | Poll with `since_id` (excludes `direction=note`) |
| POST | `/api/public/live-chat/{publicKey}/conversations/{uuid}/messages` | Visitor text or multipart attachment; offline leave-a-message when outside hours. Persist succeeds even if Reverb/notify fail (soft-fail). |
| POST | `/api/public/live-chat/{publicKey}/conversations/{uuid}/typing` | Bearer session; fans out `LiveChatTyping` (`direction=visitor`) |

Inactive widget → 404. Missing entitlement → 403. Bad/expired/revoked token → 401. CORS: Origin reflected for credential-less embeds.

The public embed (`public/widgets/live-chat.js`) stores the session token in `localStorage` and resumes via heartbeat + message hydrate after page refresh. Send failures show an in-panel error with **Retry** (no browser `alert`).

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
| POST | `/live-chat/conversations/{id}/messages` | `reply` (optional attachment; `as_note` boolean; soft-fail realtime) |
| POST | `/live-chat/conversations/{id}/typing` | `reply` (`LiveChatTyping` `direction=agent` for embed) |
| POST | `/live-chat/conversations/{id}/escalate` | `reply` (+ Help Desk entitled) |
| PATCH | `/live-chat/conversations/{id}` | Policy: `assigned_to`, `status`, `lead_id`, `department_id` |

`{id}` accepts numeric id or conversation uuid.

## Realtime channels

- `private-tenant.{tenantId}.live-chat.inbox`
- `private-tenant.{tenantId}.live-chat.conversation.{uuid}`
- Public `live-chat.visitor.{uuid}` for embed

Events: `LiveChatMessageSent`, `LiveChatConversationUpdated`, `LiveChatVisitorPresence`, `LiveChatTyping`.
