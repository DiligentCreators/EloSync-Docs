# Live Chat (developer)

Free Communication module (`live-chat` **1.3.0**). Public widget traffic resolves the workspace by widget `public_key` (central/web routes), initializes tenancy, checks entitlement, then ends tenancy — same pattern as custom Lead webhooks.

## Surfaces

| Surface | Auth |
|---------|------|
| `GET/POST /api/public/live-chat/{publicKey}/…` | Widget key + visitor Bearer session token (SHA-256 hashed at rest) |
| `/api/tenant/v1/live-chat/…` | `auth:tenant-api` + `module:live-chat` + Spatie `can:` |
| `public/widgets/live-chat.js` | Static embed script (`data-key`, `data-api-base`) |

Throttle: `live-chat-widget` (60/min by IP + key) and `live-chat-widget-session` (10/min for session create); disabled in testing. CSRF excepted for `api/public/live-chat/*`.

**CORS:** `LiveChatPublicCors` reflects `Origin` for credential-less public widget paths only (does not open the rest of the API).

**Public DTOs:** Visitor responses use `LiveChatPublicConversationResource` / `LiveChatPublicMessageResource` — uuid/status/body/direction/attachment meta/timestamps only (no assignee, Lead, visitor IP, or sender email).

**Sessions:** Expire after 7 days from creation. Regenerating the public key (or deactivating the widget / cancelling the module) revokes all visitor session hashes. Retention: `live-chat:purge-visitors --days=90` (daily). Banned visitors (`is_banned`) cannot create sessions or send messages.

## Branding, hours, offline

Widget settings store `primary_color`, `launcher_text`, `position`, `header_title`, `logo_url`, `offline_*`, `business_hours`, `email_notify_agents`, `default_department_id`. Bootstrap returns branding plus `within_hours` / `accepting_live` and optional Reverb public realtime hints. Outside hours (or inactive accepting), visitors leave offline messages when `offline_enabled`.

## Realtime

Agent channels (distinct from Team Chat):

- `private-tenant.{tenantId}.live-chat.inbox`
- `private-tenant.{tenantId}.live-chat.conversation.{uuid}`

Visitor public channel: `live-chat.visitor.{uuid}` (UUID secrecy). Events: `LiveChatMessageSent`, `LiveChatConversationUpdated` (`ShouldBroadcastNow`). Embed keeps short-poll fallback.

## Soft Leads / Help Desk

`PATCH …/conversations/{id}` with `lead_id` calls `LiveChatConversationService::linkLead`. Requires Leads entitled; null unlinks.

`POST …/conversations/{id}/escalate` creates a Help Desk ticket (`source: live-chat`) when Help Desk is entitled and sets `help_desk_ticket_id`.

## Canned replies & departments

Tenant CRUD under `/live-chat/canned-replies` and `/live-chat/departments` (`manage` writes, `view` lists).

## Automation

Wired triggers: `live_chat.conversation_opened`, `live_chat.message_inbound`, `live_chat.conversation_closed` — fan-out via `IntegrationEventDispatcher`.

## Notifications

`LiveChatInboundMessageNotification` (`live-chat.inbound`) → recipients with `live-chat.view` (assignee-scoped when assigned). Optional email when `email_notify_agents` is true.

## Tests

Pest: `tests/Feature/Tenant/LiveChat/`. Playwright: `npm run test:e2e:live-chat`.

Production readiness: [Live Chat production readiness](/deployment/live-chat-production-readiness).