# Live Chat

Install **Live Chat** from Marketplace (free). Open **Communication → Live Chat**.

## Widget setup

1. Open Live Chat and expand **Widget settings** (requires `live-chat.manage`).
2. Set a greeting and optionally require name/email before chat starts.
3. Copy the embed snippet onto your website (script loads from your EloSync API host).
4. Keep the widget **Active** so visitors can start conversations.

Regenerating the public key invalidates existing embeds until you update the snippet.

## Agent inbox

- Conversation list on the left; thread and visitor details on the right.
- Reply with `live-chat.reply`. Claim with `live-chat.assign`. Close/reopen from the thread header.
- Search filters by visitor name, email, page URL, or message preview.

## Leads

When **Leads** is installed:

- Search and link an existing lead, or create a new lead from the thread and auto-link it.
- Unlink anytime. Linking requires `live-chat.reply` or `live-chat.manage` plus Leads access.

## Notifications

New visitor messages create an in-app notification that opens `/live-chat?conversation={uuid}`.
