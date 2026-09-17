# Live Chat

Install **Live Chat** from Marketplace (free). Open **Communication → Live Chat** for the agent desk. Configure the widget under **Settings → Live Chat**.

## Widget setup

1. Open **Settings → Live Chat** (requires `live-chat.manage`), or use **Settings** from the Live Chat desk.
2. Set greeting, branding (color, launcher text, position, header, logo, agent display name), and optionally require name/email before chat starts.
3. Add **suggested replies** (quick-reply chips in the visitor widget).
4. Optionally show **Powered by EloSync** on the widget footer.
5. Configure **business hours** (workspace timezone). Outside hours, visitors see the offline greeting and can leave a message when offline mode is enabled.
6. Optionally enable **email notify agents** for inbound/offline messages.
7. Copy the embed snippet onto your website (script loads from your EloSync API host).
8. Keep the widget **Active** so visitors can start conversations.

Regenerating the public key invalidates existing embeds until you update the snippet.

## Agent desk

Tabs under **Live Chat**:

- **Overview** — visitors today, chats answered/missed, page views (7d), recent history.
- **Inbox** — fullscreen 3-pane shell (list, thread, visitor panel).
- **Live visitors** — who is on site (heartbeat window); open or start a chat.

### Inbox

- Conversation list filters: All, Unread, Mine, Unassigned, Open, Closed, Offline.
- Thread header: Claim, Close/Reopen, Escalate. Assign, lead link, and ban live in the visitor panel.
- Composer: **Reply** (visitor-visible) or **Note** (internal only). Attach files from the composer.
- Insert **canned replies** from Reply mode (manage canned replies in Settings → Live Chat).
- Visitor panel shows IP, country, browser/OS, page, referrer, pages viewed, last seen.
- Search filters by visitor name, email, page URL, or message preview.
- New visitor messages update in near-realtime when Echo/Reverb is connected (polling remains as fallback).

## Departments

Create departments under **Settings → Live Chat** (`live-chat.manage`), assign agents, and set a default department on the widget for new conversations.

## Leads

When **Leads** is installed:

- Search and link an existing lead, or create a new lead from the visitor panel and auto-link it.
- Unlink anytime. Linking requires `live-chat.reply` or `live-chat.manage` plus Leads access.

## Help Desk

When **Help Desk** is installed, escalate a conversation to a ticket from the thread (`live-chat.reply` plus Help Desk create permission). The conversation keeps a soft link to the ticket.

## Moderation

With `live-chat.manage`, ban a visitor from the visitor panel. Banned visitors cannot start new sessions.

## Notifications

New visitor messages create an in-app notification that opens `/live-chat?conversation={uuid}`. Optional email notify (widget setting) alerts agents when configured.
