# Live Chat Module

Free Communication Marketplace module for an embeddable website widget and a shared agent inbox. Soft-link Leads when that module is installed; escalate to Help Desk when that module is installed.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [live-chat.md](/user-guide/live-chat) |
| Engineers | [live-chat.md](/developer-guide/live-chat) |
| Production / ops | [live-chat.md](/deployment/live-chat) · [1.5.0 / 1.5.1 readiness](/deployment/live-chat-1-5-0-production-readiness) |
| Tenant API | [tenant-v1-live-chat.md](/api/tenant-v1-live-chat) |

## Capabilities (1.5.2)

- One website widget per workspace (public key + embed snippet)
- Tawk-style visitor widget (circular FAB, branded header, agent avatar/name, suggested-reply chips, emoji/attach composer, optional “Powered by EloSync”)
- In-panel send errors with **Retry** (no browser alert); send lock + hydrate-before-retry; visitor ↔ agent typing indicators
- Embed snippet cache-bust (`?v=`) from Settings
- Widget branding (color, launcher text, position, header, logo, agent display name, suggested replies)
- Business hours + offline leave-a-message
- Visitor presence heartbeats (“who is on site”) with browser/OS/country when available
- Visitor text chat via public API (session token; short-poll with optional Reverb public channel); visitor attachments
- Shared agent desk at `/live-chat` with **Overview / Inbox / Live visitors** tabs (AppLayout + design system)
- Inbox: filters, assign/transfer, Reply|Note composer, `/` canned reply filter, visitor panel
- Lightweight overview stats (visitors today, answered/missed, page views, recent history)
- Widget / departments / canned replies under **Settings → Live Chat** (`/settings?tab=live-chat`)
- Canned replies for agents
- Departments + default routing
- Media attachments on messages
- Soft Lead create/link when Leads is entitled
- Help Desk escalate when Help Desk is entitled
- Ban visitor (manage)
- Inbound DB notification (`live-chat.inbound`) + optional agent email when enabled; open-tab bell via Reverb while Echo is connected
- Agent Echo realtime (inbox + conversation channels); message send soft-fails when Reverb is down; Automation triggers for open / inbound / closed

## Permissions

`live-chat.view` · `reply` · `assign` · `manage`

## Catalog

- Slug: `live-chat`
- Category: Communication
- `is_default_included=false`, `is_billable=false`, prices `$0`, version **1.5.2**
- Install from Marketplace (not auto-installed)

## Explicitly deferred

- Sharing invoices or other module records in chat
- Auto-create lead on first message
- Full analytics/reporting suite, AI bots, multi-widget brands
- Map view / sentiment engines
- Captcha / Turnstile beyond throttle + TTL
- EloSync Mobile screen
