# Stripe / Cashier notes

Cashier remains installed on the `Tenant` billable model as the **Stripe gateway driver** — not the business source of truth.

## Layering

| Layer | Source of truth |
|-------|-----------------|
| Licensing | `workspace_module_subscriptions` |
| Invoicing / payments | `invoices`, `payments` (Billing Engine ledger) |
| Stripe mirror | Cashier `subscriptions` / `subscription_items` on `Tenant` |
| Credentials | Encrypted `payment_gateways.config` (fallback: env `STRIPE_*`) |

See [Billing Engine](/developer-guide/billing-engine) and [Payment Gateway Architecture](/developer-guide/payment-gateways-overview).

## Current state

- `Tenant` uses Cashier's `Billable` trait (`stripe_id`, `pm_type`, `pm_last_four` are custom columns)
- `StripeGateway` implements `PaymentGatewayInterface` (checkout, refunds, webhook normalization, testConnection)
- `ManualGateway` is the default driver for synchronous settle
- `GatewayManager` resolves drivers from `payment_gateways` table + `config/core-platform.php`
- Webhooks:
  - `POST /stripe/webhook` → Cashier + Billing Engine
  - `POST /webhooks/gateways/stripe` → Billing Engine only

## Product mapping (Sync catalog)

Modules stay payment-provider agnostic (`monthly_price`, `yearly_price`, `currency`). Stripe Product/Price IDs live in `payment_gateway_module_prices` (Central → **Payment Gateways → Product Mapping**).

**Preferred:** click **Sync catalog** (or **Sync & overwrite**) — or run:

```bash
php artisan payment-gateways:sync-catalog stripe --overwrite
```

EloSync creates one Stripe Product per module and a Price per billing cycle from catalog amounts, then upserts `prod_…` / `price_…` into Product Mapping. The UI queues the same job as Kelviq/Creem (Horizon `catalog-sync`); keep the dialog open while it runs.

| Mode | Keys | What Sync hits |
|------|------|----------------|
| Sandbox | `sk_test_…` / `pk_test_…` | Stripe test mode catalog |
| Live | `sk_live_…` / `pk_live_…` | Stripe live catalog |

Do **not** mix test keys with live mode (or the reverse). After switching mode, Sync again (or remap) so mappings point at the correct mode’s `price_…` ids. Manual paste of dashboard IDs remains supported.

## When Stripe is used

- Default gateway = `stripe`: billable module installs return a Checkout redirect; webhook activates pending subscriptions and settles payments
- Stripe supports recurring (`subscriptions` capability): provider renewals update the ledger via webhooks; those subscriptions are excluded from platform `billing:run-consolidated` charge lines
- Default gateway = `manual`: purchases and consolidated runs mark payments succeeded immediately

Cashier subscription rows stay in sync for Stripe-backed workspaces but do not drive entitlements.
