# Tenant API & Webhooks — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-21 |
| **Status** | **Go** — migrate-first |
| **Scope** | Platform Settings → Developers: integration API tokens + outbound event webhooks |
| **Companion** | [Developer guide](/developer-guide/tenant-api-webhooks) · [API](/api/tenant-v1-developers) · [User guide](/user-guide/tenant-settings#developers) |

---

## Executive summary

Tenant API & Webhooks ships as a **platform** capability (permission `settings.manage_developers`), not a Marketplace SKU. Operators mint Sanctum integration tokens (`es_…`) for `/api/tenant/v1` and subscribe to domain events with signed outbound POSTs.

| Gate | Result |
|------|--------|
| Migrate-only (`token_type`, webhook tables, permission sync) | **Pass** |
| No parallel auth / route tree; Sanctum + Spatie unchanged | **Pass** |
| SSRF guards on webhook URLs | **Pass** |
| Timestamped HMAC envelope (`{timestamp}.{body}`) | **Pass** |
| Automation still entitled-gated; webhooks independent | **Pass** |
| Pest Developers + SignedOutboundHttpClient | **Pass** |
| Playwright Settings → Developers smoke | **Pass** (create token once) |
| Docs + CHANGELOG + roadmap | **Pass** |

---

## Deploy

1. Deploy Backend + Frontend + Docs together.
2. Run migrations (includes `settings.manage_developers` grant to owner/admin defaults).
3. Ensure a queue worker processes the `webhooks` queue (include `webhooks` alongside `automations` / `emails` / `default` on Forge).
4. Smoke: Settings → Developers → create API token → call a tenant endpoint with Bearer → create webhook → Send test.

## Explicitly deferred

- Ability/scope matrix beyond “acts as user”
- `customer_payment.posted` event
- Separate OpenAPI / integration-only route tree
- OAuth client credentials
