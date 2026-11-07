# Kelviq Central Gateway — Production Readiness

Audit date: **2026-11-07**. Scope: Central Marketplace billing via Kelviq (sandbox → live). Tenant-owned Kelviq keys for customer invoices remain out of scope.

## Verdict

**Ready for sandbox rollout.** Live default is unblocked after the hardening in this delivery (timestamp replay window, `invoice.paid` renewals, pause/resume entitlement sync, API mapping validation, sanitized checkout errors).

## Evidence

| Check | Result |
|-------|--------|
| Headed Playwright (one admin session) | `billing.payment-gateways.kelviq.headed.spec.ts` — 5/5 |
| Billing dashboard e2e (incl. Kelviq configure) | `billing.dashboard.spec.ts` — pass |
| Pest | `KelviqGatewayTest`, `KelviqWebhookTest`, isolation, management |
| Secrets | Encrypted `payment_gateways.config`; redacted API; env fallbacks sandbox-off by default |
| Webhook verify | HMAC `id.timestamp.body` + **±300s** timestamp tolerance |
| Idempotency | `webhook_logs.provider_event_id` |

## Hardening shipped from audit

1. Webhook timestamp replay rejection (`KelviqWebhookVerifier`, 300s).
2. `invoice.paid` → `payment_succeeded` (renewals).
3. `subscription.paused` → local `suspended` + entitlement forget; resume restores `active`.
4. API `PUT …/module-prices` rejects numeric Kelviq plan identifiers.
5. Checkout failures no longer echo raw Kelviq API messages to clients.
6. `KELVIQ_ENV=live` aliases `production` for seeder mode.

## Remaining ops (not code blockers)

1. Paste sandbox keys; seed gateways; map published plan identifiers.
2. Register webhook events including **`invoice.paid`** plus: `checkout.completed`, `invoice.payment_failed`, `subscription.created`, `subscription.updated`, `subscription.plan_changed`, `subscription.paused`, `subscription.resumed`, `subscription.cancelled`.
3. Real sandbox purchase + renewal with forwarded webhooks.
4. Business verification / payouts → production plans → `KELVIQ_ENV=production` + live keys → production webhook → set Kelviq default.

## Portal note

`KelviqGateway::createPortalSession()` is implemented for parity with Creem; Central UI does not yet expose “Manage billing”. Treat as follow-up, not a Marketplace checkout blocker.

## Related

- [Kelviq gateway](/developer-guide/kelviq)
- [Payment gateways production](/deployment/payment-gateways)
- [CHANGELOG](/changelog/)
