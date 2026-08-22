# WhatsApp Cloud — Deployment

## Catalog

Billable module `whatsapp-cloud` **1.3.0** (CRM). Register and bump via **migrate-only** data migrations:

| Migration | Effect |
|-----------|--------|
| `2026_08_16_100005_register_whatsapp_cloud_module` | Register **1.0.0** |
| `2026_08_16_100006_add_whatsapp_cloud_permissions` | Permissions |
| `2026_08_21_234243_add_auto_create_leads_to_whatsapp_connections_table` | Lead Source columns |
| `2026_08_21_234245_bump_whatsapp_cloud_module_version_to_1_1_0` | **1.0.0 → 1.1.0** |
| `2026_08_21_235205_bump_automation_and_whatsapp_cloud_for_wa_triggers` | Automation **1.1.0**, WA **1.2.0** |
| `2026_08_21_235553_create_whatsapp_message_attachments_table` | Media attachments |
| `2026_08_21_235556_bump_whatsapp_cloud_module_version_to_1_3_0` | **1.2.0 → 1.3.0** |

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
# Local / Playwright only — never set in production:
# META_HTTP_FAKE=true
```

Central settings keys (encrypted secrets): `meta_whatsapp_app_id`, `meta_whatsapp_app_secret`, `meta_whatsapp_webhook_verify_token` (fall back to Lead Ads keys).

Align `FRONTEND_URL` with the SPA origin tenants use (OAuth callback redirects here).

## Meta App

1. Enable **WhatsApp** product on the platform Meta App (may share portfolio with Lead Ads).
2. Webhook callback: `{APP_URL}/webhooks/whatsapp/cloud` — subscribe to `messages`.
3. OAuth redirect: `{APP_URL}/api/oauth/whatsapp/cloud/callback`
4. Verify token must match Central / env.

See [Meta App Setup](/developer-guide/meta-app-setup) (WhatsApp section).

## Queues

| Queue | Jobs |
|-------|------|
| `whatsapp-inbound` | `ProcessWhatsAppWebhookJob`, `DownloadWhatsAppMediaJob` |
| `whatsapp-outbound` | `SendWhatsAppMessageJob` (text / template / media) |
| `automations` | WA trigger/action workflow runs (when Automation entitled) |

Workers must listen to WhatsApp queues (and `automations` when using WA Automation). See Forge notes in [Laravel Forge](./laravel-forge) and the [production readiness](./whatsapp-cloud-production-readiness) pre-flight.

## Soft dependencies

| Feature | Also entitle |
|---------|--------------|
| Lead soft-link / Lead Source auto-create | **Leads** |
| Media send/receive counting toward quota | **Storage** (free module / packs as needed) |
| WA Automation trigger/action | **Automation** **1.1.0+** |

## Smoke

1. Install module → connect OAuth → select WABA → select phone.
2. Inbound test message creates conversation; soft-link a Lead from the inbox header.
3. Reply text inside 24h; template outside 24h.
4. (1.1) Toggle auto-create leads; confirm unknown inbound creates/links Lead; toggle off.
5. (1.2) Automation workflow on `whatsapp.message_received`; optional `send_whatsapp_template`.
6. (1.3) Inbound media downloads; outbound attach inside 24h; Storage quota respected.
7. Disconnect retains history and releases the Meta phone id for reclaim; tokens cleared.

Full go-live checklist: [WhatsApp Cloud production readiness](./whatsapp-cloud-production-readiness).
