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

Catalog row: free Communication opt-in `live-chat` **1.0.1** (not default-included). Workspaces install from Marketplace.

## Runtime

- Serve static `public/widgets/live-chat.js` from the API host (or CDN in front of it).
- Public widget routes need the APP_URL host reachable from third-party sites (CSRF excepted).
- **CORS:** `LiveChatPublicCors` reflects `Origin` for credential-less `api/public/live-chat/*` (does not open the rest of the API).
- Rate limits: `live-chat-widget` (60/min) and `live-chat-widget-session` (10/min for session create).
- Visitor sessions expire after **7 days**; schedule `live-chat:purge-visitors --days=90` (registered in `routes/console.php`).
- No new queue workers required (notifications use existing database channel; queue `sync` or existing supervisors).

## Production readiness

Audit status: **Go** — [Live Chat production readiness](./live-chat-production-readiness).

## Verify

```bash
php artisan test --compact tests/Feature/Tenant/LiveChat/LiveChatModuleTest.php
# Frontend
npm run test:e2e:live-chat
```
