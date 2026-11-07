# Kelviq Payment Gateway

Kelviq is a Central payment provider (Merchant of Record) that plugs into the existing gateway-agnostic billing stack. Business logic stays in `BillingEngine` / `ModuleSubscriptionService`; Kelviq only translates between Kelviq’s REST API and `PaymentGatewayInterface`.

Use Kelviq when EloSync SaaS Marketplace fees should be collected under an organization that Kelviq supports (for example Diligent Creators Private Limited in Pakistan) while Stripe entity setup is incomplete. Stripe, Creem, and Manual remain available; switch the **default** gateway in Central when ready.

Tenant workspaces accepting payments from *their* customers with workspace-owned keys is a separate concern (`TenantStripeConnection` today). Do **not** reuse Central `payment_gateways` credentials for tenant CRM checkout.

## Architecture

```
BillingEngine → GatewayManager → PaymentGatewayInterface
                                      ├── ManualGateway
                                      ├── StripeGateway
                                      ├── CreemGateway
                                      └── KelviqGateway  (+ KelviqClient, KelviqWebhookVerifier)
```

Do **not** add `kelviq_*` columns. The Kelviq `customerId` is the **tenant UUID**; it is also stored in provider-neutral `tenant_gateway_customers.customer_reference`. Plan mapping uses `payment_gateway_module_prices.gateway_product_reference` as the Kelviq `planIdentifier`.

Module access remains EloSync’s `workspace_module_subscriptions` (activated by webhooks). Kelviq entitlements / license keys are not used for Marketplace gating in v1.

## Installation

1. Pull backend changes and run:

```bash
php artisan db:seed --class=Database\\Seeders\\Central\\PaymentGatewaySeeder
```

2. Configure credentials (env fallbacks **or** Central admin UI). Keep `KELVIQ_ENV=sandbox` until go-live.

3. Map billable modules under **Billing → Payment Gateways → Product mapping** — either click **Sync catalog** (creates/publishes Kelviq products + plans from EloSync prices and fills plan identifiers) or publish plans in the Kelviq dashboard and paste each `planIdentifier` manually.

4. Point Kelviq webhooks to `POST /webhooks/gateways/kelviq`.

5. Enable Kelviq and set it as the default gateway (only one default). Prefer **Payment Gateways → Set as default** over the Settings free-form field.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `KELVIQ_ENABLED` | Seed row starts active when `true` |
| `KELVIQ_ENV` | `sandbox` (default) \| `production` (seeded `mode` → sandbox/live) |
| `KELVIQ_API_URL` | Optional override (default sandbox/live Kelviq hosts) |
| `KELVIQ_SERVER_API_KEY` | Server API key fallback (`Authorization: Bearer`) |
| `KELVIQ_WEBHOOK_SECRET` | Signing secret (`kq_whsec_…`) for webhook verification |
| `KELVIQ_TIMEOUT` / `KELVIQ_CONNECT_TIMEOUT` | HTTP timeouts |

Prefer storing secrets in encrypted `payment_gateways.config` via the admin UI (`secret_key`, `webhook_secret`). Env values are fallbacks when the row is empty.

Config file: `config/kelviq.php`.

Never put production keys in sandbox mode. Do not change `KELVIQ_ENV` to `production` until business verification, live plans, and a production webhook are ready.

## Sandbox setup

1. Open Kelviq sandbox setup → copy Server API key (and later webhook secret) into Backend `.env` or Central **Configure**.
2. Central: enable Kelviq, mode **sandbox**, paste Server API key + Webhook secret.
3. Product mapping → **Sync catalog** (preferred) creates one Kelviq product/plan per EloSync module (`elosync-{slug}`), sets MONTHLY/YEARLY prices from catalog amounts, publishes the plan, and writes the plan identifier into both cycle rows. Or publish plans in the Kelviq dashboard and paste identifiers manually. Monthly / yearly rows share the plan identifier; checkout sends `chargePeriod` `MONTHLY` / `YEARLY`.

   On the server you can also run:

   ```bash
   php artisan payment-gateways:sync-catalog kelviq --overwrite
   php artisan storage:verify-pack-mappings --gateway=kelviq
   ```

   `--gateway=kelviq` matches by gateway **code** (not driver class). If Sync writes `0` mappings, the CLI prints the first Kelviq API error per module.

   Sync always upserts EloSync Product Mapping to `elosync-{slug}` after the Kelviq product/plan/prices exist. Publish is **best-effort**: already-`isLatest` plans are skipped, and publish HTML 500 / unpublished drafts do **not** block mapping (publish in the Kelviq dashboard if checkout requires a live plan).

   The Central UI **Sync catalog** button queues `SyncPaymentGatewayCatalogJob` on the `catalog-sync` Horizon queue (up to ~10 minutes) and polls status — use it instead of waiting on a long HTTP request. The artisan command still runs sync inline for ops.
5. Register webhook URL (ngrok / Herd share / public API):

```text
https://api.elosync.com/webhooks/gateways/kelviq
```

Subscribe at least: `checkout.completed`, `invoice.paid`, `invoice.payment_failed`, `subscription.created`, `subscription.updated`, `subscription.plan_changed`, `subscription.paused`, `subscription.resumed`, `subscription.cancelled`.

6. Test connection → Set as default → purchase a billable module with a [sandbox test card](https://docs.kelviq.com/guides/sandbox.md).

## Production / go-live checklist

1. Complete Kelviq business verification and payouts for the collecting legal entity.
2. Publish **production** plans; remap live plan identifiers in Central.
3. Hosting secrets: production Server API key + webhook secret; set `KELVIQ_ENV=production` and gateway mode **live**.
4. Register production webhook: `https://api.elosync.com/webhooks/gateways/kelviq` with the same event set.
5. Sandbox end-to-end purchase must succeed before flipping the Central default to Kelviq live.
6. Keep Stripe/Creem enabled (not default) for a later provider switch if needed.

## Webhook configuration

| Item | Value |
|------|-------|
| Endpoint | `POST /webhooks/gateways/{code}` with `code=kelviq` |
| Signature headers | `webhook-id`, `webhook-timestamp`, `webhook-signature` (`v1,{hex}`) |
| Algorithm | HMAC-SHA256 over `{id}.{timestamp}.{rawBody}` |
| Replay window | Reject when timestamp skew exceeds 300s (`KELVIQ_WEBHOOK_TOLERANCE_SECONDS`) |
| CSRF | Excepted (`webhooks/gateways/*`) |
| Idempotency | `webhook_logs.provider_event_id` unique |

Invalid signatures → `400` and a failed webhook log.

## Supported events & mapping

| Kelviq event | Normalized `GatewayEvent` | Engine effect |
|--------------|---------------------------|---------------|
| `checkout.completed` | `payment_succeeded` | Settle payment + activate pending module (subscription id may arrive later on `subscription.created`) |
| `invoice.paid` | `payment_succeeded` | Renewal / invoice settlement |
| `invoice.payment_failed` | `payment_failed` | Mark payment failed (failed renewal) |
| `subscription.created` | `subscription_created` | Link `provider_subscription_id` |
| `subscription.updated` | `subscription_updated` | Sync (includes scheduled cancellation while still active) |
| `subscription.plan_changed` | `subscription_updated` | Sync plan change |
| `subscription.paused` | `subscription_updated` | Local status → `suspended`; entitlements cleared |
| `subscription.resumed` | `subscription_updated` | Local status → `active` when previously suspended |
| `subscription.cancelled` | `subscription_cancelled` | Cancel module when the subscription **actually ends** (not when cancellation is scheduled) |

See [production readiness](/deployment/kelviq-production-readiness).

## Differences vs Stripe / Creem

| Topic | Stripe | Creem | Kelviq |
|-------|--------|-------|--------|
| SDK | Cashier + Stripe PHP | Laravel HTTP (`CreemClient`) | Laravel HTTP (`KelviqClient`) |
| Auth | Stripe secret | `x-api-key` | Bearer Server API key |
| Customer id | `tenants.stripe_id` | Creem `cust_…` | Tenant UUID as Kelviq `customerId` |
| Checkout reference | `price_…` | `prod_…` | `planIdentifier` + `chargePeriod` |
| Activation webhook | `invoice.payment_succeeded` | `subscription.paid` / `checkout.completed` | `checkout.completed` (+ `subscription.created`) |
| Portal | Cashier | Creem billing link | `${customerPortalUrl}?token=…` (customer must have email) |

## Local development

```bash
KELVIQ_ENABLED=true
KELVIQ_ENV=sandbox
KELVIQ_SERVER_API_KEY=
KELVIQ_WEBHOOK_SECRET=

php artisan db:seed --class=Database\\Seeders\\Central\\PaymentGatewaySeeder
```

Forward Kelviq sandbox webhooks to `/webhooks/gateways/kelviq`.

```bash
php artisan test --compact tests/Feature/Central/Billing/KelviqGatewayTest.php
php artisan test --compact tests/Feature/Central/Billing/KelviqWebhookTest.php
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Checkout fails “plan mapping missing” | Product mapping plan identifier for the default gateway |
| Signature failures | Raw body HMAC; headers `webhook-id` / `webhook-timestamp` / `webhook-signature`; secret matches endpoint |
| Portal 400 | Customer must exist in Kelviq **with an email** |
| Module not activating | Confirm `checkout.completed` webhook log `processed`; metadata includes payment / subscription ids |
| Wrong environment | Sandbox keys against live API (or reverse); keep `KELVIQ_ENV=sandbox` until go-live |

## Related

- [Payment gateway architecture](/developer-guide/payment-gateways-overview)
- [Developer guide](/developer-guide/payment-gateways)
- [Webhooks](/developer-guide/payment-gateways-webhooks)
- [Billing Engine](/developer-guide/billing-engine)
- [Creem gateway](/developer-guide/creem)
- [Stripe / Cashier](/developer-guide/stripe-cashier)
