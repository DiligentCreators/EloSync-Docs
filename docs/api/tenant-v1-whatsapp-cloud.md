# Tenant WhatsApp Cloud API

Base path: `/api/tenant/v1/whatsapp`  
Middleware: `module:whatsapp-cloud` + Spatie `can:whatsapp-cloud.*`

## Integrations

| Method | Path | Permission |
|--------|------|------------|
| GET | `/whatsapp/integrations` | `manage_integrations` |
| GET | `/whatsapp/integrations/oauth/redirect` | `manage_integrations` |
| GET | `/whatsapp/integrations/wabas` | `manage_integrations` |
| GET | `/whatsapp/integrations/phones?waba_id=` | `manage_integrations` |
| POST | `/whatsapp/integrations/phones` | `manage_integrations` |
| POST | `/whatsapp/integrations/disconnect` | `manage_integrations` |

OAuth callback (central web): `GET /api/oauth/whatsapp/cloud/callback`

## Conversations & messages

| Method | Path | Permission |
|--------|------|------------|
| GET | `/whatsapp/conversations` | `view` |
| POST | `/whatsapp/conversations` | `send` |
| GET | `/whatsapp/conversations/{id}` | `view` |
| PATCH | `/whatsapp/conversations/{id}` | `send` |
| POST | `/whatsapp/conversations/{id}/read` | `view` |
| GET | `/whatsapp/conversations/{id}/messages` | `view` |
| POST | `/whatsapp/conversations/{id}/messages` | `send` (text; requires open CS window) |
| POST | `/whatsapp/conversations/{id}/templates` | `send` (approved template) |

## Templates

| Method | Path | Permission |
|--------|------|------------|
| GET | `/whatsapp/templates` | `view` |
| POST | `/whatsapp/templates/sync` | `manage_templates` |

## Webhook (central)

`GET|POST /webhooks/whatsapp/cloud` — Meta verify + signed inbound/status events.
