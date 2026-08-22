# WhatsApp Cloud — Overview

Billable CRM Marketplace module (`whatsapp-cloud` **1.0.0**) that connects a WhatsApp Business Account via the official **WhatsApp Cloud API**.

## What it does

- Connect Meta / WABA / phone number (encrypted tokens)
- Shared inbox: send and receive **text** messages
- Meta-approved **Cloud templates** for sends outside the 24-hour customer service window
- Soft optional Lead link (timeline mirrors when Leads is entitled)
- Keep Communication Templates `wa.me` handoff as fallback until Cloud is connected

## What is deferred (not in MVP)

- Interactive buttons/lists
- Alternate BSPs (Twilio, etc.)

## Lead Source (v1.1.0)

Opt-in on the WhatsApp connection: **Auto-create leads from unknown numbers**. When enabled and Leads is installed, the first inbound message from an unlinked contact creates or links a Lead via the WhatsApp Lead Source driver (`source_reference = whatsapp_cloud`).

## Automation (v1.2.0)

Trigger `whatsapp.message_received` and action `send_whatsapp_template` when Automation is entitled.

## Media (v1.3.0)

Send/receive image, document, audio, and video in the shared inbox (Storage quota applies; soft Storage entitlement).
## Permissions

| Permission | Use |
|------------|-----|
| `whatsapp-cloud.view` | Inbox + thread + list templates |
| `whatsapp-cloud.send` | Send text/template, open/update conversation |
| `whatsapp-cloud.manage_integrations` | Connect / disconnect / select phone |
| `whatsapp-cloud.manage_templates` | Sync Meta templates |

## Related

- [User Guide](/user-guide/whatsapp-cloud)
- [Developer Guide](/developer-guide/whatsapp-cloud-integration)
- [API](/api/tenant-v1-whatsapp-cloud)
- [Deployment](/deployment/whatsapp-cloud)
