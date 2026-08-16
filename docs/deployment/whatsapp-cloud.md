# WhatsApp Cloud — Deployment

## Catalog

Billable module `whatsapp-cloud` **1.0.0** (CRM). Register via migrate-only data migrations:

- `2026_08_16_100005_register_whatsapp_cloud_module`
- `2026_08_16_100006_add_whatsapp_cloud_permissions`

Do **not** rely on `db:seed` in production.

## Environment

```env
META_GRAPH_VERSION=v21.0
# Shared with Lead Ads when empty:
META_LEAD_ADS_APP_ID=
META_LEAD_ADS_APP_SECRET=
META_LEAD_ADS_WEBHOOK_VERIFY_TOKEN=
# Optional WhatsApp-specific overrides:
META_WHATSAPP_APP_ID=
META_WHATSAPP_APP_SECRET=
META_WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

Central settings keys (encrypted secrets): `meta_whatsapp_app_id`, `meta_whatsapp_app_secret`, `meta_whatsapp_webhook_verify_token` (fall back to Lead Ads keys).

## Meta App

1. Enable **WhatsApp** product on the platform Meta App (may share portfolio with Lead Ads).
2. Webhook callback: `{APP_URL}/webhooks/whatsapp/cloud` — subscribe to `messages`.
3. OAuth redirect: `{APP_URL}/api/oauth/whatsapp/cloud/callback`
4. Verify token must match Central / env.

See [Meta App Setup](/developer-guide/meta-app-setup) (WhatsApp section).

## Queues

| Queue | Jobs |
|-------|------|
| `whatsapp-inbound` | `ProcessWhatsAppWebhookJob` |
| `whatsapp-outbound` | `SendWhatsAppMessageJob` |

Workers must listen to both queues (or `*` in non-prod). See Forge notes in [Laravel Forge](./laravel-forge) and the [production readiness](./whatsapp-cloud-production-readiness) pre-flight.

## Smoke

1. Install module → connect OAuth → select WABA/phone.
2. Inbound test message creates conversation.
3. Reply text inside 24h; template outside 24h.
4. Disconnect retains history; tokens cleared.

Full go-live checklist: [WhatsApp Cloud production readiness](./whatsapp-cloud-production-readiness).
