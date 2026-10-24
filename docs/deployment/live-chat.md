# Live Chat deployment

## Migrate

```bash
php artisan migrate --force
```

Idempotent migrations:

- `2026_09_17_003600_create_live_chat_tables`
- `2026_09_17_003610_register_live_chat_module`
- `2026_09_17_003620_add_live_chat_permissions`
- `2026_09_17_003630_bump_live_chat_module_version_to_1_0_1`
- `2026_09_17_003700_expand_live_chat_module_to_1_3_0` (schema + catalog bumps **1.0.1 → 1.1.0 → 1.2.0 → 1.3.0**)
- `2026_09_17_134951_expand_live_chat_module_to_1_4_0` (presence fields, suggested replies, notes; catalog **1.3.0 → 1.4.0**)
- `2026_09_17_172843_bump_live_chat_module_version_to_1_4_1` (embed session resume + Shadow DOM form isolation; catalog **1.4.0 → 1.4.1**)
- `2026_09_18_213545_bump_departments_and_live_chat_for_hidden_inactive_members` (catalog **1.4.1 → 1.4.2**)
- `2026_09_25_142200_bump_live_chat_module_version_to_1_5_0` (send soft-fail + typing; catalog **1.4.2 → 1.5.0**)
- `2026_09_25_200000_bump_live_chat_module_version_to_1_5_1` (open/close soft-fail, embed lock/retry, snippet `?v=`; catalog **1.5.0 → 1.5.1**)
- `2026_09_25_210000_bump_live_chat_module_version_to_1_5_2` (inbound notification Reverb broadcast; catalog **1.5.1 → 1.5.2**)
- `2026_10_03_223500_add_live_chat_idle_routing_and_bump_to_1_6_0` (department routing, idle minutes, idle scan columns; catalog **1.5.2 → 1.6.0**)
- `2026_10_23_125323_bump_live_chat_module_version_to_1_7_0` (proactive invite / open-chat body; catalog **1.6.0 → 1.7.0**)
- `2026_10_23_125658_expand_live_chat_visitor_intel_and_bump_to_1_8_0` (visitor intel columns; catalog **1.7.0 → 1.8.0**)
- `2026_10_23_130000_live_chat_identify_and_bump_to_1_9_0` (`external_user_id`, `custom_attributes`; catalog **1.8.0 → 1.9.0**)
- `2026_10_23_130100_live_chat_phase_four_and_bump_to_2_0_0` (proactive rules, banned IPs, visitor notes, CSAT + transcript widget flags; catalog **1.9.0 → 2.0.0**)
- `2026_10_24_190027_expand_live_chat_visitor_phone_prechat_and_bump_to_2_1_0` (visitor `phone`, pre-chat department; catalog **2.0.0 → 2.1.0**; embed **`?v=2.1.0`**)

Catalog row: free Communication opt-in `live-chat` **2.1.0** (not default-included). Workspaces install from Marketplace.

## Runtime

- Serve static `public/widgets/live-chat.js` from the API host (or CDN in front of it). Settings embed snippet includes **`?v=2.1.0`** for cache-bust; purge CDN for unversioned URLs.
- Public widget routes need the APP_URL host reachable from third-party sites (CSRF excepted).
- **CORS:** `LiveChatPublicCors` reflects `Origin` for credential-less `api/public/live-chat/*` (does not open the rest of the API).
- Rate limits: `live-chat-widget` (60/min) and `live-chat-widget-session` (10/min for session create).
- Visitor sessions expire after **7 days**; schedule **`live-chat:purge-visitors --days=90`**, **`live-chat:scan-idle`**, and **`live-chat:scan-proactive`** (all registered in `routes/console.php`; proactive + idle run every minute).
- Agent realtime uses existing Reverb/Echo (`private-tenant.*.live-chat.*`); embed keeps short-poll with optional public channel.
- **Message send and conversation open/close** persist even when Reverb/automation/mail is down (side effects soft-fail + structured logs). Prefer a healthy Reverb daemon for typing and live desk updates; queue workers for transcript mail.
- Optional agent email notify is controlled per widget (`email_notify_agents`) and applies to **first-chat intake** only. **Transcript on close** uses `email_transcript_on_close` + visitor email.

## Production readiness

- Baseline (CORS / sessions / PII): **Go** — [Live Chat production readiness](./live-chat-production-readiness) (**1.0.1**).
- Send resilience + typing: [Live Chat 1.5.0 / 1.5.1 production readiness](./live-chat-1-5-0-production-readiness).
- **2.0.0 milestone:** [Live Chat 2.0.0 production readiness](./live-chat-2-0-0-production-readiness) — proactive / CSAT / transcript / IP ban / notes.
- **Current ship (2.1.0):** [Live Chat 2.1.0 production readiness](./live-chat-2-1-0-production-readiness) — pre-chat phone + department; richer intake notify; migrate through `2026_10_24_190027_…`; redeploy embed **v=2.1.0**.

## Verify

```bash
php artisan test --compact tests/Feature/Tenant/LiveChat
# Frontend
npm run test:e2e:live-chat
```

Do not claim CI green until companion PR Quality Gates pass on the merge branch.
