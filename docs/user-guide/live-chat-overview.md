# Live Chat Module

Free Communication Marketplace module for an embeddable website widget and a shared agent inbox. Soft-link Leads when that module is installed; escalate to Help Desk when that module is installed.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [live-chat.md](/user-guide/live-chat) |
| Engineers | [live-chat.md](/developer-guide/live-chat) |
| Production / ops | [live-chat.md](/deployment/live-chat) · [2.1.0 readiness](/deployment/live-chat-2-1-0-production-readiness) · [2.0.0 readiness](/deployment/live-chat-2-0-0-production-readiness) · [1.5.0 / 1.5.1 readiness](/deployment/live-chat-1-5-0-production-readiness) |
| Tenant API | [tenant-v1-live-chat.md](/api/tenant-v1-live-chat) |

## Capabilities (2.1.0)

- One website widget per workspace (public key + embed snippet `?v=2.1.0`)
- Pre-chat **name / email / phone / department** before start or offline leave-a-message
- Tawk-style visitor widget (circular FAB, branded header, agent avatar/name, suggested-reply chips, emoji/attach composer, optional “Powered by EloSync”)
- In-panel send errors with **Retry**; send lock + hydrate-before-retry; visitor ↔ agent typing indicators
- Widget branding, business hours, offline leave-a-message, suggested replies, powered-by footer
- Visitor presence heartbeats with rich intel: page title/trail, geo (country/city/region), device/screen/language, landing URL, UTM, visit count, client id, session timing
- Public **identify** for name/email/external user id/custom attributes on logged-in sites
- Visitor text chat via public API (session token; poll + optional Reverb public channel); visitor attachments
- Agent-initiated and **proactive rule** invites (`LiveChatInvite` on visitor channel + heartbeat fallback)
- Shared agent desk at `/live-chat`: **Overview / Inbox / Live visitors**
- Inbox: filters, assign/transfer, Reply|Note, `/` canned filter, expanded visitor panel, **visitor notes**
- CSAT survey in embed after close (toggle); optional **email transcript on close**
- Ban visitor + optional **IP ban** list
- Overview stats; Settings → Live Chat for widget, departments, canned replies, proactive rules, CSAT/transcript toggles
- Soft Lead create/link; Help Desk escalate
- Department-routed notifications + idle scan; Automation triggers including `live_chat.proactive_invite_sent`
- Agent Echo realtime; message send soft-fails when Reverb is down

## Permissions

`live-chat.view` · `reply` · `assign` · `manage`

## Catalog

- Slug: `live-chat`
- Category: Communication
- `is_default_included=false`, `is_billable=false`, prices `$0`, version **2.1.0**
- Install from Marketplace (not auto-installed)

## Explicitly deferred

- Sharing invoices or other module records in chat
- Auto-create lead on first message
- Full analytics/reporting suite, AI bots, multi-widget brands
- Map view / sentiment engines
- Captcha / Turnstile beyond throttle + TTL
