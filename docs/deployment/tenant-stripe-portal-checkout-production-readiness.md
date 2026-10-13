# Tenant Stripe + Customer Portal Checkout (payments 1.6.0 / portal 1.4.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-13 |
| **Status** | **Go for production** |
| **Scope** | Workspace-owned Stripe keys (sandbox/live); portal invoice Checkout; webhook → posted gateway `CustomerPayment`; catalog **payments 1.5.0 → 1.6.0**, **customer-portal 1.3.0 → 1.4.0** |
| **Companion** | [Payments](./payments) · [Customer Portal](./customer-portal) · [CHANGELOG](/changelog/) |

---

## Executive summary

Tenants connect **their** Stripe account (encrypted secrets, sandbox/live mode) under Payments → Stripe (`payments.manage_integrations`). Portal contacts pay unpaid invoices via Stripe Checkout; `POST /webhooks/tenant/{tenant}/stripe/customer-payments` verifies the active-mode webhook secret and posts an allocated gateway payment. Central Cashier / `payment_gateways` SaaS billing is untouched.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Separate from Central Stripe/Cashier | **Pass** |
| Migrate-only catalog + `tenant_stripe_connections` + permission | **Pass** |
| Pest integration + portal checkout + catalog bumps + soft-delete restore | **Pass** (12) |
| SPA Stripe dialog + portal Pay now | **Pass** |
| Playwright payments suite (headed, shared session Stripe + workflow + authz) | **Pass** (10) |

## Audit findings (fixed before ship)

| Severity | Finding | Fix |
|----------|---------|-----|
| **P0** | Soft-deleted Stripe rows were updated on reconnect but never restored (`deleted_at` not fillable) — PUT reported ready, GET returned not ready | `TenantStripeConnectionService::update()` calls `restore()` when trashed; Pest covers reconnect |
| **P1** | Stripe dialog draft reset on status refetch wiped in-progress enable/key edits | Hydrate draft once per open; `setQueryData` on save/test/disconnect |
| **P2** | Calendar provider-mappings unique index name exceeded MySQL 64-char limit (blocked migrate) | Explicit short unique names on migration |
| **P2** | Payments e2e invoice seeds omitted required `contact_id` | Workflow + authz specs seed a contact first |

## Upgrade & staging smoke

1. `php artisan migrate --force` — table, unique gateway txn index, `payments.manage_integrations`, catalog bumps (**do not** `db:seed`).
2. Confirm catalog: payments **1.6.0**, customer-portal **1.4.0**; admin/manager have `payments.manage_integrations`.
3. Deploy SPA — Payments → Stripe; portal invoice **Pay now**.
4. Smoke: save sandbox keys → enable → test connection → configure Stripe webhook URL → portal Pay now on unpaid invoice → webhook posts payment → invoice paid.
5. Reconnect smoke: Disconnect → save keys again → status shows **Ready for checkout** (GET + UI).

## Verification evidence

- Backend Pest: `TenantStripeIntegrationTest`, `PortalInvoiceCheckoutTest`, catalog bump tests — **12 passed**.
- Frontend Playwright (headed, `E2E_BROWSER_CHANNEL=chrome`, one Stripe shared session): `e2e/tests/payments` — **10 passed**.

## Rollback

Prefer forward fix. Catalog `down` restores prior versions; unused `tenant_stripe_connections` rows are inert if code rolls back.
