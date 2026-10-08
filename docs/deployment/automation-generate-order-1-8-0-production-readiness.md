# Automation generate_order / Purchase Order (1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-08 |
| **Re-verified** | 2026-10-08 — Pest generate_order draft + email auto-send + catalog **1.8.0**; headed Playwright **1/1** (Generate Purchase Order builder) |
| **Status** | **Go for production** |
| **Scope** | New `generate_order` action creates Purchase Orders (`purchase-orders`); email + WhatsApp auto-send; catalog **automation 1.7.0 → 1.8.0** |
| **Companion** | [Automation deployment](./automation) · [WhatsApp auto-send 1.7.0](./automation-whatsapp-document-auto-send-1-7-0-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

**1.8.0** adds `generate_order` → `PurchaseOrderService::create` (empty lines, requires `vendor_id` from config or vendor trigger). Optional `auto_send` / `auto_send_whatsapp` mirror quotation/invoice (status Sent + vendor email / WhatsApp PDF). Starter template `manual_generate_purchase_order`. Soft-gates Purchase Orders module via catalog `available`.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Draft create + vendor note | **Pass** (Pest) |
| Email auto-send → Sent + mail | **Pass** |
| Missing vendor_id → failed run | **Pass** (RuntimeException path) |
| Registry module `purchase-orders` | **Pass** |
| Catalog migrate-only **1.8.0** | **Pass** |
| SPA Generate Purchase Order config | **Pass** (headed e2e selects action + email auto-send) |
| Headed Playwright one-session | **Pass** (`test:e2e:automation:headed` 1/1) |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.8.0**.
2. Entitle Purchase Orders (+ Vendors as needed); builder shows **Generate Purchase Order**.
3. Manual run with vendor selected → draft PO; with auto-send → Sent + vendor email.

## Rollback

Catalog `down` → **1.7.0** with matching code. Existing `generate_order` actions will fail on older ActionRunner maps until removed.
