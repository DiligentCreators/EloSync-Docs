# Lemon Squeezy Payment Gateway

Lemon Squeezy is a Central payment provider (Merchant of Record) that plugs into the existing gateway-agnostic billing stack. Business logic stays in `BillingEngine` / `ModuleSubscriptionService`; Lemon Squeezy only translates between Lemon Squeezy’s JSON:API and `PaymentGatewayInterface`.

Use Lemon Squeezy when you want MoR checkout with tax/VAT handled by Lemon Squeezy. Stripe, Creem, Kelviq, and Manual remain available; switch the **default** gateway in Central when ready.

**Tenant** workspace gateways are out of scope for this delivery — Central Marketplace only. Do **not** reuse Central `payment_gateways` credentials for tenant CRM checkout.

## Architecture

```
BillingEngine → GatewayManager → PaymentGatewayInterface
                                      ├── ManualGateway
                                      ├── StripeGateway
                                      ├── CreemGateway
                                      ├── KelviqGateway
                                      └── LemonSqueezyGateway  (+ LemonSqueezyClient, LemonSqueezyWebhookVerifier)
```

Do **not** add `lemonsqueezy_*` columns. Customer ids are stored in provider-neutral `tenant_gateway_customers.customer_reference`. Checkout maps `payment_gateway_module_prices.gateway_price_reference` as the Lemon Squeezy **variant id**.

Lemon Squeezy’s public API cannot create products or variants. Create subscription products in the dashboard, then paste variant IDs under Product mapping. There is no `catalog_sync` capability for this driver.

## Installation

1. Pull backend changes and run:

```bash
php artisan db:seed --class=Database\\Seeders\\Central\\PaymentGatewaySeeder
```

2. Configure credentials (env fallbacks **or** Central admin UI). Keep `LEMONSQUEEZY_ENV=sandbox` / test-mode API keys until the store is approved for live.

3. Map billable modules under **Billing → Payment Gateways → Product mapping** — paste each monthly/yearly **Variant ID**.

4. Point Lemon Squeezy webhooks to `POST /webhooks/gateways/lemonsqueezy`.

5. Enable Lemon Squeezy and set it as the default gateway only after a sandbox marketplace purchase succeeds.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `LEMONSQUEEZY_ENABLED` | Seed row starts active when `true` |
| `LEMONSQUEEZY_ENV` | `sandbox` (default) \| `live` / `production` (seeded `mode`) |
| `LEMONSQUEEZY_TEST_MODE` | Checkout `test_mode` flag while in sandbox |
| `LEMONSQUEEZY_API_URL` | Optional override (default `https://api.lemonsqueezy.com/v1`) |
| `LEMONSQUEEZY_API_KEY` | API key fallback (`Authorization: Bearer`) |
| `LEMONSQUEEZY_STORE_ID` | Store id required for checkout relationships |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Signing secret for `X-Signature` HMAC-SHA256 |
| `LEMONSQUEEZY_TIMEOUT` / `LEMONSQUEEZY_CONNECT_TIMEOUT` | HTTP timeouts |

Prefer storing secrets in encrypted `payment_gateways.config` via the admin UI (`secret_key`, `webhook_secret`, `store_id`). Env values are fallbacks when the row is empty.

Config file: `config/lemonsqueezy.php`.

## Sandbox setup

1. Lemon Squeezy → Settings → API: create a **Test mode** API key.
2. Note your Store ID (Stores API or dashboard).
3. Central: enable Lemon Squeezy, mode **sandbox**, paste API key + Store ID + Webhook secret.
4. Create subscription products with monthly/yearly variants; map variant IDs in Product mapping.
5. Register webhook URL:

```text
https://api.elosync.com/webhooks/gateways/lemonsqueezy
```

Subscribe at least: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_payment_success`, `subscription_payment_failed`, `subscription_payment_recovered`, `order_refunded` (logged as unsupported for ledger refunds in v1).

6. Run **Test connection**, then a marketplace purchase in test mode.

## Event mapping

| Lemon Squeezy event | `GatewayEvent` |
|---------------------|----------------|
| `subscription_payment_success`, `subscription_payment_recovered`, `order_created` | `payment_succeeded` |
| `subscription_payment_failed` | `payment_failed` |
| `subscription_created` | `subscription_created` |
| `subscription_updated`, `subscription_resumed`, `subscription_paused`, `subscription_unpaused` | `subscription_updated` |
| `subscription_cancelled`, `subscription_expired` | `subscription_cancelled` |
| `order_refunded` (and others) | `unsupported` |

Custom checkout data (`tenant_id`, `payment_id`, …) is returned on webhooks as `meta.custom_data`.

## Tests

```bash
php artisan test --compact tests/Feature/Central/Billing/LemonSqueezyGatewayTest.php
php artisan test --compact tests/Feature/Central/Billing/LemonSqueezyWebhookTest.php
```
