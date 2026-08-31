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
| Migrate-only (`token_type` short index, webhook tables, permission sync) | **Pass** |
| No parallel auth / route tree; Sanctum + Spatie unchanged | **Pass** |
| SSRF guards (private IP / localhost) + **no redirect follow** | **Pass** |
| Timestamped HMAC envelope (`{timestamp}.{body}`) | **Pass** |
| Automation still entitled-gated; webhooks independent | **Pass** |
| Send test does not consume failure budget / auto-disable | **Pass** |
| Delivery retention (`webhooks:prune-deliveries` weekly) | **Pass** |
| Pest Developers + SignedOutboundHttpClient (incl. redirect test) | **Pass** |
| Playwright Settings → Developers full one-login workflow | **Pass** |
| Docs + CHANGELOG + roadmap | **Pass** |

---

## Deploy

1. Deploy Backend + Frontend + Docs together.
2. Run migrations (includes `settings.manage_developers` grant to owner/admin defaults). Index name is `pat_token_type_tokenable_index` (MySQL-safe).
3. Ensure a queue worker processes the `webhooks` queue (include `webhooks` alongside `automations` / `emails` / `default` on Forge).
4. Scheduler already includes `webhooks:prune-deliveries --days=90` weekly (payload retention).
5. Smoke: Settings → Developers → create API token → call a tenant endpoint with Bearer → create webhook → Send test → confirm Recent deliveries.

## Operator notes

- Integration tokens act as the creating user (`abilities: *`) — mint via a least-privilege integration user.
- After 10 consecutive **event** delivery failures, endpoints auto-disable; **Send test** does not increment that budget. Operators can Enable again from the UI.
- Outbound HTTP does not follow redirects (SSRF hardening).

## Explicitly deferred

- Ability/scope matrix beyond “acts as user”
- Separate OpenAPI / integration-only route tree
- OAuth client credentials
