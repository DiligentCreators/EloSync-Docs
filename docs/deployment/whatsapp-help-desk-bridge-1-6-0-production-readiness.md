# WhatsApp Help Desk bridge (1.6.0 / Help Desk 1.18.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-13 |
| **Status** | **Go for production** |
| **Re-verified** | 2026-10-13 — Pest `WhatsAppHelpDeskBridgeTest` + catalog bumps **12/12**; headed Playwright WhatsApp Cloud **10/10** (`E2E_BROWSER_CHANNEL=chrome`) |
| **Scope** | Opt-in WhatsApp → Help Desk auto-ticket; bidirectional public-note sync inside the 24h window; FK loop prevention |
| **Companion** | [WhatsApp Cloud](./whatsapp-cloud) · [Help Desk](./help-desk) · [CHANGELOG](/changelog/) |

---

## Executive summary

Soft bridge: when `auto_create_help_desk_tickets` is on and Help Desk is entitled, inbound WhatsApp opens a ticket. Customer inbound messages become public notes without advancing SLA first response. Staff public Help Desk notes queue outbound WhatsApp text while the conversation is inside the 24h customer service window. Internal notes never sync. Manual escalate remains available when auto-create is off.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| No new permissions | **Pass** |
| Migrate-only catalog **whatsapp-cloud 1.6.0** / **help-desk 1.18.0** | **Pass** |
| Soft Help Desk entitlement on auto-create | **Pass** |
| Pest bridge + catalog bump tests | **Pass** |
| Headed Playwright WhatsApp Cloud (settings toggle + escalate) | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — setting column, note/message FKs, catalog bumps (do **not** `db:seed`).
2. Confirm catalog: `whatsapp-cloud` **1.6.0**, `help-desk` **1.18.0**.
3. Entitle both modules → enable **Auto-create Help Desk tickets** → send inbound → ticket linked.
4. Add a public ticket note inside 24h → WhatsApp outbound queued; add an internal note → no WhatsApp send.
5. Disable auto-create → inbound does not open a new ticket; manual escalate still works.

## Rollback

Catalog `down` → whatsapp-cloud **1.5.0** / help-desk prior version with matching code. Drop bridge columns if rolling back schema.
