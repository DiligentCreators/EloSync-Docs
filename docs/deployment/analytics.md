# Reports (Analytics) — Production Guide

Production readiness audit: [Analytics Production Readiness](./analytics-production-readiness).

## Licensing

- Catalog slug: `analytics` (display name **Reports**)
- Category: `operations`, `sort_order = 70`
- Free Marketplace opt-in (`is_billable = false`, not default-included)
- Version **1.1.0** (was 1.0.0 overview MVP)
- **No** hard `module_dependencies` — KPI sections and domain reports soft-gate on source module entitlement + view permission
- **No** dedicated Analytics tables — aggregates existing tenant data

## Deploy checklist

1. Migrate catalog rename + version bump (`bump_analytics_module_to_reports_1_1_0`) and ensure prior register + permissions migrations are applied
2. Deploy frontend `/analytics` hub + `/analytics/{crm|sales|billing|purchasing}`
3. Smoke: install Reports → Overview → Reports → domain pages → Export CSV
4. Confirm SPA `/403` / API `403` when Analytics is not entitled
5. Playwright: `test:e2e:analytics` / `test:e2e:analytics:modules:headed`
6. Sign off [production readiness](./analytics-production-readiness) pre-flight + staging smoke
