# Pulse uncached slow-path follow-up — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-03 |
| **Status** | **Go for production** |
| **Scope** | Remaining Laravel Pulse slow *requests* (1000 ms) after the [index/cache ship](./pulse-slow-paths-production-readiness): dashboard miss, leads stats, public settings miss, attendance `/today`. Invoice PDF and `SyncEmailAccountJob` intentionally unchanged. |
| **Companion** | [Pulse slow-path hardening](./pulse-slow-paths-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

Pulse showed slow **requests** with **no slow queries** in the same hour. The cost was PHP hydrating large lead sets, repeating entitlement SQL, and Dompdf/IMAP I/O — not missing indexes. This follow-up speeds **uncached** paths only (widget TTL stays 30s; public bootstrap stays 5 minutes). API JSON shapes and authorization are unchanged. No catalog bump; no migrations.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| No API response-shape or authorization changes | **Pass** |
| Cache TTLs not raised; miss path is cheaper | **Pass** |
| Settings hydrate memo is request-scoped (not PHP static / FPM-leaky) | **Pass** (A1) |
| Central `publicBootstrap()` cache forgotten on `set()` / `forgetCache()` | **Pass** |
| `hasModule()` uses existing 1h `forTenant()` cache; subscribe/unsubscribe still `forgetEntitlements()` | **Pass** |
| Lead stats sparkline days use `UtcInstant` (no SQL `DATE()` on UTC columns) | **Pass** |
| Attendance `/today` only in `AttendanceRecordReadService`; write/policy files untouched | **Pass** |
| Invoice PDF / `SyncEmailAccountJob` left as library/IMAP time | **Pass** |
| Docs + CHANGELOG + VitePress nav | **Pass** |

## Audit findings (initial → remediated)

| ID | Severity | Finding | Remediation |
|----|----------|---------|-------------|
| A1 | **P0** | `SystemSettingService::$allMemo` and `TenantSettingService::$allMemoByTenant` were **static**. PHP-FPM workers reuse processes, so a later request could serve settings after Redis `forget` on another worker, or after `cache:clear`. | Request-scoped `app()->instance()` / `forgetInstance()` on `forgetCache()`. Same-request resolvers still share one hydrate. |
| A2 | **P1** | Follow-up was a two-line changelog/readiness patch on the previous Pulse ship — no dedicated gates, test evidence, or nav link. | This page + CHANGELOG section + deployment index + VitePress sidebar. |
| A3 | **P2** | `wonPeriodAggregates()` used `selectRaw` after `toBase()` without clearing prior select columns (MySQL `*` + aggregate risk). | Null `columns` then `COUNT`/`SUM` only. |
| A4 | **Accepted** | Invoice PDF ~1500 ms on cache miss is Dompdf; relations are all used; 300s render cache already keyed by `updated_at` + settings fingerprint. | Leave PDF library and bytes unchanged. |
| A5 | **Accepted** | `SyncEmailAccountJob` ~1441 ms is IMAP connect/search/body; job wrapper has no wasted round trip. `$tries` stays 1. | Leave the job. |

## What shipped

### Backend

- **Leads stats:** `LeadService::stats()` uses `withoutEagerLoads()->reorder()`; period won `COUNT`+`SUM` in one query; sparklines from one won fetch, one created-at fetch, one pending follow-up fetch bucketed with `UtcInstant::dayBounds`.
- **Dashboard miss:** `pipelineByStage` `GROUP BY stage_id` + per-stage `LIMIT` previews; `LeadStage` loaded once; `stageProbability` no N+1; closing-soon / proposal / negotiation from grouped counts + two limited lists. Widget TTL still 30s.
- **Entitlements:** `EntitlementService::hasModule()` reads `forTenant()` slugs (1h cache already forgotten on module subscribe/unsubscribe).
- **Public settings miss:** request-scoped hydrate of tenant/central `all()`; `smtp_configured` / `mail_configured` share one mail-provider check; central `publicBootstrap()` `rememberForever` until `forgetCache()`.
- **Attendance `/today`:** one linked active employee by `user_id`; `setRelation('employee')`; creator/reason eager loads kept for `whenLoaded` JSON.

### Docs

- This readiness page; CHANGELOG; deployment index; VitePress nav; cross-link from the prior Pulse page.

## Test evidence

```
herd php vendor/bin/pest --compact --filter=kpi tests/Feature/Tenant/Lead/LeadTest.php
herd php vendor/bin/pest --compact --filter=compares tests/Feature/Tenant/Lead/LeadTest.php
herd php vendor/bin/pest --compact --filter=eager-load tests/Feature/Tenant/Lead/LeadTest.php
herd php vendor/bin/pest --compact --filter=overdue tests/Feature/Tenant/Lead/LeadTest.php
herd php vendor/bin/pest --compact tests/Feature/Tenant/Dashboard/DashboardWidgetTest.php
herd php vendor/bin/pest --compact tests/Feature/Tenant/Attendance/AttendanceRecordReadServiceTest.php
herd php vendor/bin/pest --compact tests/Feature/Central/Module/EntitlementServiceTest.php
herd php vendor/bin/pest --compact tests/Feature/Tenant/Settings/PublicBootstrapCacheTest.php
herd php vendor/bin/pest --compact --filter=public tests/Feature/Tenant/Settings/TenantSettingsTest.php
herd php vendor/bin/pest --compact --filter=branded tests/Feature/Tenant/Settings/TenantSettingsTest.php
```

`vendor/bin/pint --dirty --format agent` on Backend PHP changes.

## Upgrade & staging smoke

1. Deploy application code only. **No** `migrate`, **no** `db:seed`, **no** catalog bump.
2. Pulse (1h window, 1000 ms): dashboard, `/leads/stats`, `/public/settings`, `/attendance-records/today` should drop or shrink vs the prior miss-path samples. Invoice PDF and `SyncEmailAccountJob` may still exceed 1000 ms (Dompdf / IMAP).
3. Marketplace install a module → dashboard widgets for that module appear without waiting an hour (`forgetEntitlements` on subscribe).
4. Central maintenance toggle → tenant `GET /api/tenant/v1/public/settings` reflects it (fingerprint + central bootstrap cache).
5. Staff self-service attendance `/today` still returns `data.employee` plus check-in/out reason objects when present.

## Rollback

Roll back application code. Caches expire naturally (≤5 minutes public bootstrap; 30s widgets; 1h entitlements until next subscribe/forget). No schema reverse.

## Residual risk

- Dashboard widgets still stale up to 30s (by design).
- Invoice PDF and IMAP sync duration unchanged.
- Closing-soon preview is top-6 per proposal/negotiation stage mixed to 5 (covers global top 5); counts remain exact.
- Live Pulse confirmation after deploy is manual.
