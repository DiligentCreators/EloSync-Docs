# WhatsApp Cloud

## Connect

1. Marketplace → install **WhatsApp Cloud** (billable).
2. Open **WhatsApp** in the **CRM** sidebar section → **Connect WhatsApp**.
3. Complete Meta OAuth, then select a WhatsApp Business Account and the phone number to attach.
4. Optional (Leads installed): enable **Auto-create leads from unknown numbers** on the connection settings card.
5. Optional (Help Desk installed): enable **Auto-create Help Desk tickets from inbound chats** so new threads open tickets and public notes sync with WhatsApp inside the 24h window.
6. Inside the 24-hour window you can send free-form text or attach image/document/audio/video files (Storage quota applies).
7. Sync templates (managers/admins) so agents can message outside the 24h window.

## Inbox

- Conversations list on the left; thread on the right.
- Inside the **24-hour customer service window** (after an inbound message): send free-form text.
- Outside the window: pick an **approved** Meta Cloud template from the list and send.
- Soft Lead link (when Leads is installed): search and link a Lead from the conversation header, or unlink. Lead detail **Inbox** still opens the filtered list (`?lead=`).
- **Escalate to Help Desk** (when Help Desk is installed): creates a ticket from the conversation transcript (`source=whatsapp`) and shows a ticket link — same one-shot pattern as Live Chat escalate. With **auto-create** enabled, inbound chats open tickets automatically; follow-up customer messages become public ticket notes (no SLA first-response clock), and staff public replies send back to WhatsApp while the 24h window is open.

## Lead detail

When WhatsApp Cloud is entitled, Lead detail shows an **Inbox** shortcut. Communication Templates still provide the manual `wa.me` **WhatsApp** button when that free module is installed.

## Disconnect

Disconnect clears tokens, releases the Meta phone number for reclaim (history retained), and pauses send/receive. The same workspace can reconnect the same phone and keep conversation continuity.
