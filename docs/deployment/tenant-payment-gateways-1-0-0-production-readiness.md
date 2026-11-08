# Tenant Payment Gateways 1.0.0 — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-11-08 |
| **Status** | **Go for production** |
| **Scope** | Free opt-in `payment-gateways` module; multi-enable Stripe/Creem/Kelviq; workspace default; portal client choice; headed e2e |
| **Companion** | payments **1.9.0**, customer-portal **1.7.0** |

---

## Executive summary

Tenants install **Payment Gateways** from Marketplace (free, not default-included). They enable and configure Stripe, Creem, and/or Kelviq independently, set one default, and portal customers can pick among ready providers when paying an invoice. Central SaaS `payment_gateways` / Cashier remain untouched.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** — Billing nav + Payments link only |
| Separate from Central gateways | **Pass** |
| Migrate-only catalog + permissions + deps | **Pass** |
| Schema rebuild for conflicting local table | **Pass** (`2026_11_08_210007_rebuild_…`) |
| Pest PaymentGateway + portal checkout | **Pass** |
| Headed Playwright (one session, 8 tests) | **Pass** (`test:e2e:payment-gateways:headed`) |

## Audit findings (fixed before ship)

| Severity | Finding | Fix |
|----------|---------|-----|
| **P0** | Local DB already had `tenant_payment_gateway_connections` with abandoned `stripe_account_id` / `status` columns; create migration no-op’d → inserts failed (`Unknown column 'enabled'`) | Idempotent create + rebuild migration drops wrong schema and recreates key-based table; copies legacy `tenant_stripe_connections` |
| **P1** | Creem/Kelviq could be “enabled” without product/plan id (not ready for checkout) | `TenantPaymentGatewayConnectionService::update` requires `isReadyForCheckout()` before enable |
| **P2** | Headed e2e Save click flaked on toast overlays / PasswordInput | Evaluate click + focus password fields before fill |
| **P2** | Locator strict-mode clashes (`Default` badge vs Set as default; nav vs header Payment gateways link) | Exact text / main-scoped link locators |
| **P2** | Tenant Playwright project did not match `payment-gateways/` | Added `payment-gateways/.*\.spec\.ts` to `playwright.config.ts` |

## Upgrade & staging smoke

1. Deploy Backend → `php artisan migrate --force` (register module, permissions, deps, connections table, rebuild if needed, auto-entitle prior Stripe workspaces, version bumps). **Do not** `db:seed`.
2. Confirm catalog: `payment-gateways` **1.0.0**, payments **1.9.0**, customer-portal **1.7.0**.
3. Deploy SPA — Billing → Payment Gateways; Payments header link; portal provider select when multiple ready.
4. Smoke: install module → Stripe sandbox save/enable → Creem with `prod_…` → Kelviq with plan id → set default → disconnect Stripe → portal Pay now (manual).
5. Headed regression: `npm run test:e2e:payment-gateways:headed` (shared session).

## Verification evidence

- Backend Pest: `tests/Feature/Tenant/PaymentGateway` (+ portal/Stripe integration updates).
- Frontend Playwright headed: **8 passed** — cards, Stripe/Creem validation, save/ready/default for all three providers, disconnect, Payments → Payment gateways link.

## Rollback

Prefer forward fix. Catalog version `down` restores prior payments/portal labels; unused connection rows are inert if code rolls back.
