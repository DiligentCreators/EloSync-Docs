# Help Desk multi-channel intake (1.16.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-08 |
| **Re-verified** | 2026-10-08 — Pest escalate + audit remediations; headed Playwright Help Desk **3/3** + WhatsApp Cloud **9/9** |
| **Status** | **Go for production** |
| **Scope** | WhatsApp escalate → Help Desk ticket (`source=whatsapp`); source badges for portal / live-chat / whatsapp / email; list `?source=` filter |
| **Companion** | [Help Desk deployment](./help-desk) · WhatsApp Cloud **1.5.0** · [CHANGELOG](/changelog/) |

---

## Executive summary

Help Desk already accepted **manual**, **email (IMAP)**, **portal**, and **Live Chat escalate**. **1.16.0** adds WhatsApp Cloud as a peer intake channel: agents escalate a conversation to a ticket (transcript snapshot, soft FK `whatsapp_conversations.help_desk_ticket_id`, `source=whatsapp`). SPA badges surface all non-manual sources. Social DMs (Instagram/Messenger/etc.), auto-ticket on inbound, and bidirectional message sync remain deferred.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Soft-gate Help Desk when escalating from WhatsApp | **Pass** (422 when not entitled) |
| One-shot escalate + ticket link | **Pass** (Pest; `lockForUpdate` transaction) |
| Escalate overrides tenant-scoped | **Pass** (category exists + `EligibleHelpDeskAssignee`) |
| Catalog migrate-only **1.16.0** / WhatsApp **1.5.0** | **Pass** |
| Source badges (email/portal/live-chat/whatsapp) | **Pass** |
| Headed Playwright Help Desk | **Pass** (`3/3` workflow + complaint) |
| Headed Playwright WhatsApp Cloud | **Pass** (`9/9`, Escalate + ticket link) |
| Bidirectional sync / social networks | **Deferred** (accepted) |

## Upgrade & staging smoke

1. `php artisan migrate --force` — FK + catalog bumps (do **not** `db:seed`).
2. Entitle Help Desk + WhatsApp Cloud; open inbox → Escalate → ticket number link.
3. Help Desk list/view shows WhatsApp source badge; optional `?source=whatsapp`.

## Rollback

Catalog `down` → help-desk **1.15.0** / whatsapp-cloud **1.4.0** with matching code. Drop FK column if rolling back schema.
