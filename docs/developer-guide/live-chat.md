# Live Chat (developer)

Free Communication module (`live-chat` **2.1.0**). Public widget traffic resolves the workspace by widget `public_key` (central/web routes), initializes tenancy, checks entitlement, then ends tenancy — same pattern as custom Lead webhooks.

## Surfaces

| Surface | Auth |
|---------|------|
| `GET/POST /api/public/live-chat/{publicKey}/…` | Widget key + visitor Bearer session token (SHA-256 hashed at rest) |
| `/api/tenant/v1/live-chat/…` | `auth:tenant-api` + `module:live-chat` + Spatie `can:` |
| `public/widgets/live-chat.js` | Static embed script (`data-key`, `data-api-base`) — Tawk-style FAB/panel in a **Shadow DOM** host |
| SPA `/live-chat` | Agent desk tabs: Overview / Inbox / Live visitors |
| SPA `/settings?tab=live-chat` | Widget / departments / canned replies / proactive rules (`live-chat.manage`) |

Throttle: `live-chat-widget` (60/min by IP + key) and `live-chat-widget-session` (10/min for session create); disabled in testing. CSRF excepted for `api/public/live-chat/*`.

**CORS:** `LiveChatPublicCors` reflects `Origin` for credential-less public widget paths only (does not open the rest of the API).

**Public DTOs:** Visitor responses use `LiveChatPublicConversationResource` / `LiveChatPublicMessageResource` — uuid/status/body/direction/attachment meta/`agent_name` (agent rows; workspace user Name, no email/id)/timestamps only (no assignee, Lead, visitor IP, sender email, or `direction=note`).

**Sessions:** Expire after 7 days from creation. Regenerating the public key (or deactivating the widget / cancelling the module) revokes all visitor session hashes. Retention: `live-chat:purge-visitors --days=90` (daily). Banned visitors (`is_banned`) and **banned IPs** (`live_chat_banned_ips`, SHA-256 hash per tenant) cannot create sessions or send messages.

**Embed resume (1.4.1+):** The widget persists `session_token` / conversation hints in `localStorage` keyed by public key. On load it validates via `POST …/heartbeat` (which returns `open_conversation_uuid` when an open thread exists), then hydrates both visitor and agent messages. Host-page CSS cannot restyle the pre-chat form because UI lives in Shadow DOM with explicit dark labels/input colors.

## Branding, hours, offline, presence

Widget settings store `primary_color`, `launcher_text`, `position`, `header_title`, `logo_url`, `offline_*`, `business_hours`, `email_notify_agents`, `idle_minutes`, `email_transcript_on_close`, `csat_enabled`, `default_department_id`, `suggested_replies`, `show_powered_by`, `agent_display_name`. Bootstrap returns branding plus `within_hours` / `accepting_live`, `csat_enabled`, active `departments`, `default_department_id`, and optional Reverb public hints. Outside hours (or inactive accepting), visitors leave offline messages when `offline_enabled`.

### Pre-chat identity (2.1.0+)

Public `POST …/conversations` and offline leave-a-message require `name`, `email`, `phone`, and `department_id` when the workspace has active Live Chat departments (otherwise department falls back to widget `default_department_id`). Visitor `phone` is stored on `live_chat_visitors`. Embed `?v=2.1.0` always collects these fields before Start / Leave a message.

### Heartbeat intel (1.8.0+)

`POST …/heartbeat` (Bearer session) accepts optional `page_url`, `page_title`, `referrer`, `screen`, `language`. The presence service updates:

- Rolling **page history** (path changes increment `pages_viewed`)
- UA-derived **browser**, **os**, **device_type**
- CDN/request geo: **country_code**, **city**, **region**
- First-page **landing_url** and **utm_**\* parsed from the landing URL query string
- **session_started_at**, **visit_count**, **client_id** (session create can pass `client_id` to merge returning browsers)

Tenant `GET …/visitors/live` and conversation visitor payloads expose these fields for the desk. Presence broadcasts throttle on the inbox channel as `LiveChatVisitorPresence`.

## Public identify (1.9.0+)

`POST …/identify` (Bearer session) accepts at least one of: `name`, `email`, `user_id` (stored as `external_user_id`), `attributes` (object, max 20 keys → `custom_attributes`). Returns visitor uuid + identity fields. Use after login on customer sites so agents see CRM ids without pre-chat.

## Notes

Agent `POST …/messages` accepts `as_note=true` (`LiveChatMessageDirectionEnum::Note`). Notes are returned on tenant message lists and never on public visitor polls or broadcast visitor payloads.

**Visitor notes (2.0.0):** Tenant CRUD on `live_chat_visitor_notes` — internal notes keyed to `visitor_id` (not the same as thread `direction=note` messages). List: `live-chat.view`; write: `live-chat.manage`.

## Realtime

Agent channels (distinct from Team Chat):

- `private-tenant.{tenantId}.live-chat.inbox`
- `private-tenant.{tenantId}.live-chat.conversation.{uuid}`

Visitor public channel: `live-chat.visitor.{uuid}` (UUID secrecy). Events: `LiveChatMessageSent`, `LiveChatConversationUpdated`, `LiveChatVisitorPresence`, `LiveChatTyping`, `LiveChatInvite` (`ShouldBroadcastNow`, soft-failed on send/open/close paths).

Agent `POST …/visitors/{id}/open-chat` with optional `body` opens/assigns and invites the embed. **Proactive rules** use the same invite path via `LiveChatProactiveScanService` + `live-chat:scan-proactive` (scheduled every minute). Embed hydrates when heartbeat sees `open_conversation_uuid`, subscribes to the visitor channel as soon as a session exists, and auto-opens on invite. Embed keeps short-poll fallback; send lock + hydrate-before-retry on Retry. Typing also has HTTP endpoints: public + tenant `POST …/typing`. Settings embed snippet includes `?v=` cache-bust (`LiveChatWidgetService::WidgetScriptVersion` = **`2.1.0`**).

## CSAT and transcript (2.0.0)

- Public `POST …/conversations/{uuid}/csat` — `score` 1–5, optional `comment` (max 2000); conversation must be **closed** and owned by the visitor; respects widget `csat_enabled`.
- On agent close, when `email_transcript_on_close` is true and the visitor has email, `LiveChatTranscriptMail` is queued (soft-fail does not block close).

## Soft Leads / Help Desk

`PATCH …/conversations/{id}` with `lead_id` calls `LiveChatConversationService::linkLead`. Requires Leads entitled; null unlinks.

`POST …/conversations/{id}/escalate` creates a Help Desk ticket (`source: live-chat`) when Help Desk is entitled and sets `help_desk_ticket_id`. Escalation transcript omits notes.

## Canned replies, departments, proactive rules

Tenant CRUD under `/live-chat/canned-replies`, `/live-chat/departments`, and `/live-chat/proactive-rules` (`manage` writes, `view` lists proactive rules).

Proactive rule fields: `widget_id`, `name`, `is_active`, optional `path_contains`, `min_dwell_seconds`, `min_pages_viewed`, `message`, `cooldown_minutes`. Per-visitor cooldown state lives in `proactive_cooldowns` JSON on the visitor row.

## Automation

Wired triggers: `live_chat.conversation_opened`, `live_chat.message_inbound`, `live_chat.conversation_closed`, **`live_chat.proactive_invite_sent`** — fan-out via `IntegrationEventDispatcher`.

## Notifications

Do **not** fan out to every user with `live-chat.view`. Recipients are members of the conversation’s Live Chat department (visitor-selected or widget default) who also have `live-chat.reply`, capped at 20. Empty roster skips notify (`live-chat.notify_skipped_empty_roster`). Intake payloads include `visitor_name`, `visitor_email`, `visitor_phone`, and `department_name`. Keep production workers out of Live Chat departments even if Staff still has Live Chat permissions.

| Event | Recipients | Channels |
|---|---|---|
| First visitor message (unassigned) | Department agents | `database` + `broadcast` + FCM; optional mail when `email_notify_agents` |
| Later visitor messages while unassigned | Department agents | `database` + `broadcast` |
| Visitor messages after assign | Assignee only | `database` + `broadcast` |
| First agent reply | Auto-assigns that agent; `live-chat.assigned` | FCM + in-app |
| Idle (`idle_minutes`, default 5; `0` = off) | Department minus assignee | FCM + in-app once (`live-chat.idle`); `live-chat:scan-idle` every minute |

Inbox Reverb conversation list updates remain separate from notification wake-ups. Types: `live-chat.inbound`, `live-chat.assigned`, `live-chat.idle`.

## Scheduler

Registered in `routes/console.php` (onOneServer):

- `live-chat:purge-visitors --days=90` (daily)
- `live-chat:scan-idle` (every minute)
- **`live-chat:scan-proactive`** (every minute)

## Tests

Pest: `tests/Feature/Tenant/LiveChat/` (identify, intel heartbeat, proactive scan, CSAT, IP ban, visitor notes, transcript mail). Playwright: `npm run test:e2e:live-chat`.

Production readiness: [1.0.1 baseline](/deployment/live-chat-production-readiness) · [1.5.0 / 1.5.1 send resilience + typing](/deployment/live-chat-1-5-0-production-readiness) · [2.0.0 milestone](/deployment/live-chat-2-0-0-production-readiness) · [**2.1.0 current**](/deployment/live-chat-2-1-0-production-readiness).
