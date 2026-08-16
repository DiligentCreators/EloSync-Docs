# WhatsApp Cloud — Overview

Billable CRM Marketplace module (`whatsapp-cloud` **1.0.0**) that connects a WhatsApp Business Account via the official **WhatsApp Cloud API**.

## What it does

- Connect Meta / WABA / phone number (encrypted tokens)
- Shared inbox: send and receive **text** messages
- Meta-approved **Cloud templates** for sends outside the 24-hour customer service window
- Soft optional Lead link (timeline mirrors when Leads is entitled)
- Keep Communication Templates `wa.me` handoff as fallback until Cloud is connected

## What is deferred (not in MVP)

- Media attachments, interactive buttons/lists
- Automation message triggers
- WhatsApp Lead Source Driver (auto-create leads from unknown numbers)
- Alternate BSPs (Twilio, etc.)

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
