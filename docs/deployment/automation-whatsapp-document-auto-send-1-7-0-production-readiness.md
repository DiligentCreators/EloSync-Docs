# Automation WhatsApp document auto-send (1.7.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-08 |
| **Re-verified** | 2026-10-08 — Pest WA auto-send + outside window + catalog **1.7.0**; headed Playwright `test:e2e:automation:headed` **1/1** (WA checkbox persist) |
| **Status** | **Go for production** |
| **Scope** | Optional `auto_send_whatsapp` on `generate_quotation` / `generate_invoice`; catalog **automation 1.6.0 → 1.7.0** |
| **Companion** | [Automation deployment](./automation) · [Document auto-send 1.6.0](./automation-document-auto-send-1-6-0-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

Automation **1.6.0** emailed PDFs via `auto_send`. **1.7.0** adds independent `auto_send_whatsapp`: after create, status transitions (`Sent` / `Unpaid`) once when either channel is on, then queues the PDF as a WhatsApp **document** into an open 24-hour conversation (`AutomationDocumentWhatsAppSender` → `queueMedia`). Soft-gates WhatsApp Cloud entitlement. Missing conversation / closed window / missing actor fails the run (same strictness as missing email).

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| WA off → draft / email path unchanged | **Pass** |
| WA on → send status + media job | **Pass** (Pest) |
| Outside 24h window → failed run | **Pass** |
| Module missing → failed run | **Pass** (entitlement check) |
| Catalog migrate-only **1.7.0** | **Pass** |
| SPA checkbox soft-gated by `whatsapp-cloud` | **Pass** (headed e2e: hidden when revoked, persist when entitled) |
| Headed Playwright one-session | **Pass** (`test:e2e:automation:headed` 1/1) |
| Live Meta handset smoke | **Post-deploy QA** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.7.0** (do **not** `db:seed`).
2. Entitle WhatsApp Cloud + Storage; confirm Horizon **`whatsapp-outbound`**.
3. Builder: Generate Quotation/Invoice → enable WhatsApp auto-send → trigger with contact phone matching an open conversation → PDF document queued.
4. Closed window / no conversation → run Failed.

## Rollback

Catalog `down` → **1.6.0** with matching code. Config keys `auto_send_whatsapp` are ignored by older code.
