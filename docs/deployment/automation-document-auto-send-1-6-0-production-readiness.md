# Automation document auto-send (1.6.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-05 |
| **Re-verified** | 2026-10-05 — Pest `AutomationDocumentAndWhatsAppActionsTest` (7) + Playwright `test:e2e:automation` (1) green |
| **Status** | **Go for production** |
| **Scope** | Optional `auto_send` on `generate_quotation` / `generate_invoice`; catalog **automation 1.5.0 → 1.6.0** |
| **Companion** | [Automation deployment](./automation) · [Overview](/user-guide/automation-overview) · [Developer guide](/developer-guide/automation) · [CHANGELOG](/changelog/) |

---

## Executive summary

Automation **1.5.0** always left generated quotations/invoices as **draft**. **1.6.0** adds opt-in `auto_send`: after create, the action transitions status (`Sent` / `Unpaid`) and emails the bill-to contact/company with PDF attached (same mailer as the SPA Send → Email flow). Default remains draft-only. Missing recipient email fails the run (after status transition). WhatsApp auto-send and `generate_order` stay deferred.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| `auto_send` off → draft unchanged | **Pass** (existing Pest) |
| `auto_send` on → send + email + note verb | **Pass** (Pest) |
| No bill-to email → failed run | **Pass** (Pest) |
| Warm PDF job preserves caller tenancy (sync queue) | **Pass** |
| Catalog migrate-only **1.6.0** | **Pass** |
| SPA builder checkbox + Playwright | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.6.0** (do **not** `db:seed`).
2. Builder: Generate Quotation / Invoice → enable **Auto-send** → save.
3. Trigger with a company/contact that has email → document Sent/Unpaid + email queued.
4. Trigger without email → run Failed with recipient message.

## Rollback

Roll catalog bump `down` → **1.5.0** with matching code. Existing workflows with `auto_send: true` in config are ignored by older code (draft-only).
