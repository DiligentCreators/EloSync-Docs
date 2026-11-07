# Payment Gateways — Production Guide

## Checklist (Stripe)

1. Seed gateways: `PaymentGatewaySeeder` (manual + stripe + creem + kelviq).
2. In Central UI, configure Stripe **live** credentials (or set encrypted config via API).
3. Set Stripe as default only after a successful **Test connection**.
4. Register webhooks in the Stripe Dashboard:
   - Prefer `https://{APP_URL}/stripe/webhook` for Cashier subscription mirror + Billing Engine
   - Or `https://{APP_URL}/webhooks/gateways/stripe` for Billing Engine only
5. Store the webhook signing secret in gateway config (`webhook_secret`) and/or `STRIPE_WEBHOOK_SECRET` for Cashier middleware.
6. Confirm CSRF exclusions remain for `stripe/*` and `webhooks/gateways/*`.
7. Monitor **webhook status** and `webhook_logs` after go-live.

## Checklist (Kelviq)

1. Complete Kelviq business verification and payouts for the collecting legal entity.
2. Publish production plans; map live plan identifiers under **Billing → Payment Gateways → Product mapping**.
3. Set hosting secrets: production Server API key + webhook secret; `KELVIQ_ENV=production`; gateway mode **live**.
4. Register `https://api.elosync.com/webhooks/gateways/kelviq` for `checkout.completed`, `invoice.payment_failed`, `subscription.created`, `subscription.updated`, `subscription.plan_changed`, `subscription.cancelled`.
5. Sandbox E2E purchase must pass before setting Kelviq as Central default.
6. See [Kelviq gateway](/developer-guide/kelviq) for sandbox ops and event mapping.

## Environment fallbacks

`StripeGateway` prefers encrypted `payment_gateways.config.secret_key`. If absent, it falls back to Cashier env (`STRIPE_SECRET`). `KelviqGateway` prefers the same encrypted config keys, falling back to `KELVIQ_SERVER_API_KEY` / `KELVIQ_WEBHOOK_SECRET`. Production should treat DB-encrypted credentials as source of truth so credentials can rotate without redeploying env.

## Security

- Never log secret values — only changed key names.
- Never return secrets from API resources.
- Prefer sandbox mode until connection tests pass.
- Rotate webhook secrets after any suspected leak; update both Stripe Dashboard and gateway config.

## Ops signals

| Signal | Source |
|--------|--------|
| `payment_gateways.webhook_status` | `ok` / `failing` / `unknown` |
| `webhook_last_received_at` | Last successful ingress |
| `gateway_logs` | Config/mode/test events |
| `webhook_logs` | Per-event processing result + timing |
