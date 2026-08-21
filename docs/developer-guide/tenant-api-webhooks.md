# Tenant API & Webhooks — Developer Guide

Platform (non-Marketplace) integration surface for operators replacing other tools: **integration API tokens** and **outbound event webhooks**.

UI: **Settings → Developers** (`settings.manage_developers`).

## API tokens

- Sanctum personal access tokens with `token_type=integration` and name prefix `integration:`.
- Plaintext bearer secret uses prefix `es_` and is returned **once** on create/rotate.
- Authz is unchanged Spatie permissions on the **creating user** (abilities remain `['*']`).
- Call existing `/api/tenant/v1/*` with `Authorization: Bearer es_…` plus tenant headers (`X-Tenant-Domain`).
- Do **not** put SPA/marketing origins in `sanctum.stateful` — Bearer-only SPA auth remains.

Management routes (authenticated SPA user with `settings.manage_developers`):

| Method | Path |
|--------|------|
| GET | `/api/tenant/v1/developers/api-tokens` |
| POST | `/api/tenant/v1/developers/api-tokens` |
| POST | `/api/tenant/v1/developers/api-tokens/{id}/rotate` |
| DELETE | `/api/tenant/v1/developers/api-tokens/{id}` |

## Outbound webhooks

Independent of `module:automation`. Domain events fan out through `IntegrationEventDispatcher`:

1. Active `tenant_webhook_endpoints` that subscribe to the event
2. Automation engine when Automation is entitled (unchanged)

### Event catalog (v1)

- `lead.created` / `lead.updated` / `lead.assigned`
- `task.created` / `task.completed` / `task.assigned`
- `opportunity.created` / `opportunity.stage_changed` / `opportunity.assigned`
- `meeting.created` / `meeting.completed`
- `customer_invoice.created`

`customer_payment.posted` is deferred (no dedicated domain event yet).

### Envelope

```json
{
  "id": "evt_…",
  "type": "lead.created",
  "created_at": "2026-08-21T00:00:00+00:00",
  "tenant_id": "…",
  "data": { }
}
```

### Headers & signature

| Header | Value |
|--------|--------|
| `X-EloSync-Event` | Event type |
| `X-EloSync-Delivery` | Delivery UUID |
| `X-EloSync-Timestamp` | Unix timestamp string |
| `X-EloSync-Signature` | `hmac_sha256("{timestamp}.{body}", signing_secret)` |

Automation outbound webhooks keep body-only HMAC for backward compatibility.

### Delivery

- Queue: `webhooks` (`DeliverTenantWebhookJob`)
- Up to 5 attempts with backoff `[30, 60, 120, 300]`
- After 10 consecutive permanent failures, endpoint is deactivated
- SSRF guards shared via `SignedOutboundHttpClient` (blocks loopback / private hosts)

### Verify signature (PHP)

```php
$timestamp = $request->header('X-EloSync-Timestamp');
$signature = $request->header('X-EloSync-Signature');
$body = $request->getContent();
$expected = hash_hmac('sha256', $timestamp.'.'.$body, $signingSecret);

if (! hash_equals($expected, (string) $signature)) {
    abort(401);
}
```

## Related

- [Tenant Developers API](/api/tenant-v1-developers)
- [Tenant Settings user guide](/user-guide/tenant-settings#developers)
- [Custom Lead Webhook](/developer-guide/custom-lead-webhook) (inbound — separate)
- [Automation](/developer-guide/automation) (workflow webhook action)
- [Production readiness](/deployment/tenant-api-webhooks-production-readiness)
