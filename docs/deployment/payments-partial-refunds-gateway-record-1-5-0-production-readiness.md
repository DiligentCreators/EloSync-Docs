# Payments partial refunds + gateway record (1.5.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-01 |
| **Status** | **Go for production** (merge/deploy; staging refund smoke recommended) |
| **Scope** | Partial/full customer payment refunds, gateway metadata fields, `payments.refund` permission, catalog **payments 1.4.0 → 1.5.0** |
| **Companion** | [Payments deployment](./payments) · [CHANGELOG](/changelog/) |

---

## Executive summary

Posted customer payments can be partially or fully refunded via `POST /api/tenant/v1/payments/{id}/refund` (`payments.refund`). Refunds update `amount_refunded`, transition status to `partially_refunded` / `refunded`, persist `customer_payment_refunds` rows, and optionally reverse invoice allocations. When **Accounting** is entitled, allocation reversals must equal the refund amount and book a reversing journal entry. Phase 1 is **ledger-only** — no Stripe/Creem money movement.

**Go / No-Go:** **Go** for engineering deploy after migrate + permission migration on staging.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Migrate-only catalog **1.5.0** + refund tables/fields | **Pass** |
| `payments.refund` in `tenant-permissions.php` + default role grant migration | **Pass** |
| Pest `CustomerPaymentRefundTest` | **Pass** (local PHP 8.5) |
| SPA payment view **Record refund** dialog | **Pass** (UI) |
| Live gateway refund API integration | **Deferred** (metadata capture only) |
