# Analytics — Production Guide

Production readiness audit: [Analytics Production Readiness](./analytics-production-readiness).

## Licensing

- Catalog slug: `analytics`
- Category: `operations`, `sort_order = 70`
- Free Marketplace opt-in (`is_billable = false`, not default-included)
- Version **1.0.0**
- **No** hard `module_dependencies` — KPI sections soft-gate on source module entitlement + view permission
- **No** dedicated Analytics tables — overview aggregates existing tenant data

## Deploy checklist

1. Register Analytics catalog row + `analytics.view` permissions (migrate-only: `register_analytics_module`, `add_analytics_permissions`)
2. Deploy frontend `/analytics` (Overview nav)
3. Smoke: install Analytics → open Overview → Analytics → Apply period → confirm entitled sections render
4. Confirm route returns `/403` (SPA) / API `403` when Analytics is not entitled
5. Playwright: `test:e2e:analytics` / `test:e2e:analytics:modules:headed`
6. Sign off [production readiness](./analytics-production-readiness) pre-flight + staging smoke
