# Tenant Payment Gateways — Developer Guide

Free Marketplace module (`payment-gateways`, **1.0.1**) for workspace-owned Stripe / Creem / Kelviq credentials used by Customer Portal invoice checkout.

**Not** Central `payment_gateways` / Cashier / `BillingEngine`. Do not reuse Central credentials for tenant CRM checkout.

## Catalog

| Field | Value |
|-------|--------|
| Slug | `payment-gateways` |
| Category | Billing |
| `is_default_included` | `false` |
| `is_billable` | `false` |
| Required dep | `payments` |
| Optional dep | `customer-portal` |
| Permissions | `payment-gateways.view`, `payment-gateways.manage_integrations` |

Migrate-only registration + `CatalogSeeder` sync. Workspaces that already had Stripe rows are auto-entitled on upgrade.

Companion bumps: **payments 1.9.1**, **customer-portal 1.7.1** (Stripe min-amount messaging; portal/staff payment method shows `gateway_provider` label).

## Data model

Table `tenant_payment_gateway_connections` (one row per `tenant_id` + `provider`):

- `provider`: `stripe` \| `creem` \| `kelviq`
- `enabled`, `is_default`, `mode` (`sandbox` \| `live`)
- Encrypted secrets + optional publishable keys
- `config` JSON — Creem `invoice_product_id`, Kelviq `invoice_plan_identifier`

Legacy `tenant_stripe_connections` rows are copied into this table on migrate; app code uses the new model only (`TenantPaymentGatewayConnection`). Stripe facades remain for refunds / old routes.

## Services

| Class | Role |
|-------|------|
| `TenantPaymentGatewayConnectionService` | List / update / test / disconnect / set default |
| `TenantInvoiceCheckoutService` | Portal checkout + multi-provider webhooks → `CustomerPaymentService` |
| `TenantStripeConnectionService` / `TenantStripeCheckoutService` | Thin Stripe facades |

Online pay requires entitlements for **both** `payment-gateways` and `payments`, plus ≥1 ready connection.

## API

Staff (`module:payment-gateways`):

- `GET /payment-gateways`
- `GET\|PUT /payment-gateways/{provider}`
- `POST …/test`, `POST …/default`, `DELETE …`

Legacy Stripe routes under `/payments/integrations/stripe` still work but also require `module:payment-gateways`.

Portal:

- Invoice resource: `online_payment_available`, `online_payment_providers[{code,name,is_default}]`
- `POST /portal/invoices/{id}/checkout` body optional `{ "provider": "stripe"|"creem"|"kelviq" }` (default = workspace default)
- Stripe Checkout: `StripeMoney` preflight for published presentment minimums; `amount_too_small` → clear 422 (no FX invent for PKR — still paisa minor units)
- Payment resource: `method` stays `gateway`; `gateway_provider` is `stripe` \| `creem` \| `kelviq` for UI labels

Webhooks:

- Canonical: `POST /webhooks/tenant/{tenant}/gateways/{provider}/customer-payments`
- Legacy Stripe URL still forwards to the same handler

## Frontend

- Page: `src/pages/payment-gateways/`
- Service: `tenantPaymentGatewayService`
- Permissions: `PERMISSIONS.tenantPaymentGateways.*` (avoids clash with Central `paymentGateways`)
- Portal invoice picker when multiple providers are ready

## Tests

Pest: `tests/Feature/Tenant/PaymentGateway/*`, updated portal checkout + Stripe refund/integration tests.

Playwright: payments workflow opens Payment Gateways; headed Stripe suite configures Stripe from `/payment-gateways`.
