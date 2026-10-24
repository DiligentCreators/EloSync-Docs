# Tenant Live Chat API

Module: `live-chat` **2.1.0** · Base: `/api/tenant/v1/live-chat` (authenticated) and `/api/public/live-chat/{publicKey}` (widget).

## Public widget

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/public/live-chat/{publicKey}/bootstrap` | Greeting, branding, suggested_replies, agent_display_name, show_powered_by, offline, within_hours, accepting_live, **csat_enabled**, **`departments`**, **`default_department_id`**, optional realtime |
| POST | `/api/public/live-chat/{publicKey}/sessions` | Returns `session_token` once (max body 64KB; throttle `live-chat-widget-session`); banned visitors/IPs → 403; optional `name`, `email`, **`phone`**, `page_url`, `page_title`, `referrer`, `screen`, `language`, **`client_id`** (when `require_prechat`, name/email/phone required) |
| POST | `/api/public/live-chat/{publicKey}/heartbeat` | Bearer session; updates presence/intel; optional `page_url`, `page_title`, `referrer`, `screen`, `language`; returns `open_conversation_uuid` when an open thread exists |
| POST | `/api/public/live-chat/{publicKey}/identify` | Bearer session; at least one of `name`, `email`, **`phone`**, `user_id`, `attributes` (max 20 keys) |
| POST | `/api/public/live-chat/{publicKey}/conversations` | Bearer session; open/create — requires **`name`**, **`email`**, **`phone`**, and **`department_id`** when active departments exist (else widget default); may be offline thread |
| GET | `/api/public/live-chat/{publicKey}/conversations/{uuid}/messages` | Poll with `since_id` (excludes `direction=note`; agent rows include `agent_name`) |
| POST | `/api/public/live-chat/{publicKey}/conversations/{uuid}/messages` | Visitor text or multipart attachment; offline leave-a-message when outside hours (same identity + department rules as open). Persist succeeds even if Reverb/notify fail (soft-fail). |
| POST | `/api/public/live-chat/{publicKey}/conversations/{uuid}/typing` | Bearer session; fans out `LiveChatTyping` (`direction=visitor`) |
| POST | `/api/public/live-chat/{publicKey}/conversations/{uuid}/csat` | Bearer session; body `score` (1–5 required), optional `comment` (max 2000); conversation must be closed |

Inactive widget → 404. Missing entitlement → 403. Bad/expired/revoked token → 401. CORS: Origin reflected for credential-less embeds.

The public embed (`public/widgets/live-chat.js?v=2.1.0`) always collects name, email, phone, and department before Start / Leave a message. It stores the session token in `localStorage` and resumes via heartbeat + message hydrate after page refresh. Send failures show an in-panel error with **Retry** (no browser `alert`). After close, CSAT UI appears when bootstrap `csat_enabled` is true.

## Tenant agent

| Method | Path | Permission |
|--------|------|------------|
| GET | `/live-chat/widget` | `view` or `manage` |
| PATCH | `/live-chat/widget` | `manage` (includes suggested_replies, show_powered_by, agent_display_name, idle_minutes 0–1440, **`email_transcript_on_close`**, **`csat_enabled`**) |
| POST | `/live-chat/widget/regenerate-key` | `manage` |
| GET/POST/PATCH/DELETE | `/live-chat/canned-replies` | `view` list; `manage` write |
| GET/POST/PATCH/DELETE | `/live-chat/departments` | `view` list; `manage` write |
| GET | `/live-chat/proactive-rules` | `view` |
| POST/PATCH/DELETE | `/live-chat/proactive-rules` · `/live-chat/proactive-rules/{id}` | `manage` |
| GET | `/live-chat/visitors/live` | `view` (`within` minutes, default 10) |
| GET | `/live-chat/stats` | `view` |
| GET | `/live-chat/visitors/{id}/notes` | `view` |
| POST/PATCH/DELETE | `/live-chat/visitors/{id}/notes` · `…/notes/{noteId}` | `manage` |
| POST | `/live-chat/visitors/{id}/open-chat` | `reply` (optional **`body`** invite text; returns `message` when sent; fans out `LiveChatInvite`) |
| POST | `/live-chat/visitors/{id}/ban` · `/unban` | `manage` (ban body: optional `reason`, optional **`ban_ip`** boolean) |
| GET | `/live-chat/conversations` | `view` (filters: status, unread, my, assigned_to, department_id, is_offline, search — search matches visitor name/email/**phone**/page_url) |
| GET | `/live-chat/conversations/{id}` | `view` (includes visitor intel including **`phone`** + CSAT fields when set) |
| GET | `/live-chat/conversations/{id}/messages` | `view` (includes notes) |
| POST | `/live-chat/conversations/{id}/read` | `view` |
| POST | `/live-chat/conversations/{id}/messages` | `reply` (optional attachment; `as_note` boolean; soft-fail realtime) |
| POST | `/live-chat/conversations/{id}/typing` | `reply` (`LiveChatTyping` `direction=agent` for embed) |
| POST | `/live-chat/conversations/{id}/escalate` | `reply` (+ Help Desk entitled) |
| PATCH | `/live-chat/conversations/{id}` | Policy: `assigned_to`, `status`, `lead_id`, `department_id` |

`{id}` accepts numeric id or conversation uuid.

### Proactive rule body (create/update)

| Field | Rules |
|-------|--------|
| `widget_id` | required on create |
| `name` | required string, max 255 |
| `is_active` | optional boolean |
| `path_contains` | optional string, max 255 |
| `min_dwell_seconds` | optional 0–86400 |
| `min_pages_viewed` | optional 1–9999 |
| `message` | required string, max 5000 |
| `cooldown_minutes` | optional 1–10080 |

## Realtime channels

- `private-tenant.{tenantId}.live-chat.inbox`
- `private-tenant.{tenantId}.live-chat.conversation.{uuid}`
- Public `live-chat.visitor.{uuid}` for embed

Events: `LiveChatMessageSent`, `LiveChatConversationUpdated`, `LiveChatVisitorPresence`, `LiveChatTyping`, `LiveChatInvite` (public visitor channel — agent-initiated and proactive open/invite).

## Automation

Trigger key **`live_chat.proactive_invite_sent`** fires when a proactive rule opens a chat and sends an invite (same payload family as conversation events).
