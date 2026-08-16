# WhatsApp Cloud

## Connect

1. Marketplace → install **WhatsApp Cloud** (billable).
2. Open **WhatsApp** in the sidebar → **Connect WhatsApp**.
3. Complete Meta OAuth, then select a WhatsApp Business Account (first phone on the WABA is attached).
4. Sync templates (managers/admins) so agents can message outside the 24h window.

## Inbox

- Conversations list on the left; thread on the right.
- Inside the **24-hour customer service window** (after an inbound message): send free-form text.
- Outside the window: send an **approved** Meta Cloud template.
- Soft Lead link: open from Lead detail **Inbox** (`?lead=` filter) when Leads is installed. Linking/unlinking a conversation to a Lead is available via API (`PATCH` `lead_id`); full inbox link UI is deferred.

## Lead detail

When WhatsApp Cloud is entitled, Lead detail shows an **Inbox** shortcut. Communication Templates still provide the manual `wa.me` **WhatsApp** button when that free module is installed.

## Disconnect

Disconnect clears tokens and pauses send/receive. Historical conversations and messages are retained.
