# Live Chat Module

Free Communication Marketplace module for an embeddable website widget and a shared agent inbox. Soft-link Leads when that module is installed.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [live-chat.md](/user-guide/live-chat) |
| Engineers | [live-chat.md](/developer-guide/live-chat) |
| Production / ops | [live-chat.md](/deployment/live-chat) |
| Tenant API | [tenant-v1-live-chat.md](/api/tenant-v1-live-chat) |

## Capabilities (1.0.1)

- One website widget per workspace (public key + embed snippet)
- Visitor text chat via public API (session token; short-poll for new messages)
- Shared agent inbox at `/live-chat` (list + thread + visitor panel)
- Assign / claim, close / reopen
- Soft Lead create/link when Leads is entitled
- Inbound DB notification (`live-chat.inbound`) deep-links to the conversation

## Permissions

`live-chat.view` · `reply` · `assign` · `manage`

## Catalog

- Slug: `live-chat`
- Category: Communication
- `is_default_included=false`, `is_billable=false`, prices `$0`, version **1.0.1**
- Install from Marketplace (not auto-installed)

## Explicitly deferred

- Media / file attachments
- Sharing invoices or other module records in chat
- Help Desk escalate
- Auto-create lead on first message
- Visitor Echo / websockets (agents use React Query refresh + notifications)
- Analytics dashboards, bots, multi-widget brands
- EloSync Mobile screen
