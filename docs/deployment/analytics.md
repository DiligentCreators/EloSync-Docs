# Reports (Analytics) — Production Guide

Production readiness audit: [Analytics Production Readiness](./analytics-production-readiness).

## Licensing

- Catalog slug: `analytics` (display name **Reports**)
- Category: `operations`, `sort_order = 70`
- Free Marketplace opt-in (`is_billable = false`, not default-included)
- Version **1.4.0** (People Payroll soft source; was 1.3.1 mixed charts; 1.3.0 People domain; 1.2.0 charts; 1.1.0 Reports suite; 1.0.0 overview MVP)
- **No** hard `module_dependencies` — KPI sections and domain reports soft-gate on source module entitlement + view permission
- **No** dedicated Analytics tables — aggregates existing tenant data

## Deferred (not in this release)

- Do not merge Department reports or Financial Reports into Analytics
- Report builder, saved/scheduled reports, email analytics

## Deploy checklist

1. Migrate catalog bumps through `…_1_4_0` (and ensure prior register + permissions + 1.1.0–1.3.1 migrations are applied)
2. Deploy frontend `/analytics` hub + `/analytics/{crm|sales|billing|purchasing|people}` (mixed charts + Payroll People source)
3. Smoke: install Reports → Overview → Reports (mixed charts) → People (Payroll when entitled + `payroll.view`) → Export CSV
4. Confirm SPA `/403` / API `403` when Analytics is not entitled; staff without `payroll.view` omit Payroll from People
5. Playwright: `test:e2e:analytics` / `test:e2e:analytics:headed`
6. Sign off [production readiness](./analytics-production-readiness) pre-flight + staging smoke
