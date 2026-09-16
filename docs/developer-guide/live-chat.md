# Live Chat (developer)

Free Communication module (`live-chat` **1.0.1**). Public widget traffic resolves the workspace by widget `public_key` (central/web routes), initializes tenancy, checks entitlement, then ends tenancy — same pattern as custom Lead webhooks.

## Surfaces

| Surface | Auth |
|---------|------|
| `GET/POST /api/public/live-chat/{publicKey}/…` | Widget key + visitor Bearer session token (SHA-256 hashed at rest) |
| `/api/tenant/v1/live-chat/…` | `auth:tenant-api` + `module:live-chat` + Spatie `can:` |
| `public/widgets/live-chat.js` | Static embed script (`data-key`, `data-api-base`) |

Throttle: `live-chat-widget` (60/min by IP + key) and `live-chat-widget-session` (10/min for session create); disabled in testing. CSRF excepted for `api/public/live-chat/*`.

**CORS:** `LiveChatPublicCors` reflects `Origin` for credential-less public widget paths only (does not open the rest of the API).

**Public DTOs:** Visitor responses use `LiveChatPublicConversationResource` / `LiveChatPublicMessageResource` — uuid/status/body/direction/timestamps only (no assignee, Lead, visitor IP, or sender email).

**Sessions:** Expire after 7 days from creation. Regenerating the public key (or deactivating the widget / cancelling the module) revokes all visitor session hashes. Retention: `live-chat:purge-visitors --days=90` (daily).

## Soft Leads

`PATCH …/conversations/{id}` with `lead_id` calls `LiveChatConversationService::linkLead`. Requires Leads entitled; null unlinks. UI may create via existing Leads API then patch.

## Notifications

`LiveChatInboundMessageNotification` (`live-chat.inbound`) → recipients with `live-chat.view` (assignee-scoped when assigned).

## Tests

Pest: `tests/Feature/Tenant/LiveChat/LiveChatModuleTest.php`. Playwright: `npm run test:e2e:live-chat`.

Production readiness: [Live Chat production readiness](/deployment/live-chat-production-readiness).
