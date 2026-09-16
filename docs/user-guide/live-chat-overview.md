# Live Chat Module

Free Communication Marketplace module for an embeddable website widget and a shared agent inbox. Soft-link Leads when that module is installed; escalate to Help Desk when that module is installed.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [live-chat.md](/user-guide/live-chat) |
| Engineers | [live-chat.md](/developer-guide/live-chat) |
| Production / ops | [live-chat.md](/deployment/live-chat) |
| Tenant API | [tenant-v1-live-chat.md](/api/tenant-v1-live-chat) |

## Capabilities (1.3.0)

- One website widget per workspace (public key + embed snippet)
- Widget branding (color, launcher text, position, header, logo)
- Business hours + offline leave-a-message
- Visitor text chat via public API (session token; short-poll with optional Reverb public channel)
- Shared agent inbox at `/live-chat` (filters, assign/transfer, visitor panel)
- Canned replies for agents
- Departments + default routing
- Media attachments on messages
- Soft Lead create/link when Leads is entitled
- Help Desk escalate when Help Desk is entitled
- Ban visitor (manage)
- Inbound DB notification (`live-chat.inbound`) + optional agent email when enabled
- Agent Echo realtime (inbox + conversation channels); Automation triggers for open / inbound / closed

## Permissions

`live-chat.view` · `reply` · `assign` · `manage`

## Catalog

- Slug: `live-chat`
- Category: Communication
- `is_default_included=false`, `is_billable=false`, prices `$0`, version **1.3.0**
- Install from Marketplace (not auto-installed)

## Explicitly deferred

- Sharing invoices or other module records in chat
- Auto-create lead on first message
- Analytics dashboards, bots, multi-widget brands
- Live visitor site monitoring (Tawk-style "who is on site")
- Captcha / Turnstile beyond throttle + TTL
- EloSync Mobile screen