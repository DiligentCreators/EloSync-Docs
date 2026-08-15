# Analytics — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-15 |
| **Status** | **Conditional Go** — Marketplace opt-in MVP ready after companion CI + staging smoke; marketing SKU + aggregate fix closed in this audit |
| **Scope** | Analytics module `analytics` v1.0.0 |
| **Branch** | `feature/analytics-module-mvp-bc72` |
| **Companion** | [Analytics production](./analytics) · [Developer guide](/developer-guide/analytics) · [User guide](/user-guide/analytics) · [API](/api/tenant-v1-analytics) |

**PRs:** Backend [#111](https://github.com/DiligentCreators/SaaS-Backend/pull/111) · Frontend [#107](https://github.com/DiligentCreators/SaaS-Frontend/pull/107) · Docs [#132](https://github.com/DiligentCreators/SaaS-Docs/pull/132) · Website [#26](https://github.com/DiligentCreators/SaaS-Website/pull/26)

---

## Executive summary

Analytics is a **free** Operations Marketplace SKU (`$0`). It is **not** default-included. Workspaces install from Marketplace after migrate; existing tenants are unchanged until they opt in.

Locked v1 scope is implemented: **executive overview** with shared dashboard period filters and **soft** KPI sections (leads, opportunities, tasks, invoices, help-desk, projects) only when the source module is entitled **and** the actor has `{module}.view`. No report builder, saved/scheduled reports, CSV export, or email analytics.

**Go / No-Go:** **Conditional Go** for staging → production after CI on companion PRs and staging smoke. Security, catalog, SPA gates, Pest, and headed Playwright are green. Residual items are fast-follow quality work, not ship blockers for the MVP.

| Gate | Result |
|------|--------|
| Catalog: operations / `analytics` / `1.0.0` / free opt-in / sort 70 / not default-included | **Pass** |
| Migrate-only register + `analytics.view` permissions | **Pass** |
| Route middleware: `module:analytics` then `can:analytics.view` | **Pass** |
| Soft sections (no hard `module_dependencies`) | **Pass** |
| SPA `RequireAccess` + Overview nav + period UI | **Pass** |
| Read-only `GET` overview (no mutations) | **Pass** |
| Pest `tests/Feature/Tenant/Analytics` | **Pass** (isolation + assignee + period validation covered) |
| Playwright headed `test:e2e:analytics:headed` | **Pass** (11) |
| Docs core set (user / developer / API / deploy) | **Pass** |
| Marketing website SKU (`available` Operations free) | **Pass** (aligned this audit) |
| Weighted pipeline SQL aggregate (no unbounded `get()`) | **Pass** (fixed this audit) |
| Report builder / export / email analytics | **Deferred** (locked out of v1) |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs | Website |
|----------|---------|----------|------|---------|
| Free Operations Marketplace opt-in (not default, not billable) | Pass | Pass | Pass | Pass |
| v1.0.0 · executive overview only | Pass | Pass | Pass | Pass |
| Soft source-module sections (no hard deps) | Pass | Pass | Pass | Pass |
| Period via shared `DashboardPeriod` | Pass | Pass | Pass | Pass |
| No report builder / saved reports / CSV / email analytics | Pass | Pass | Pass | Pass (copy is overview, not builder) |
| Permission `analytics.view` (admin/manager/staff) | Pass | Pass | Pass | n/a |

---

## Findings

### Resolved in this audit

| ID | Was | Now | Evidence |
|----|-----|-----|----------|
| F1 | HIGH — marketing site listed Analytics as `planned` / `ai` without slug | **Fixed** | Website `MODULES` SKU: `analytics`, operations, available, free |
| F2 | MEDIUM — weighted pipeline loaded open opportunities into PHP | **Fixed** | `SUM(amount * probability / 100)` aggregate in `AnalyticsOverviewService` |
| F3 | MEDIUM — missing production-readiness peer doc + deployment index row | **Fixed** | This document + `deployment/index.md` + VitePress |
| F4 | MEDIUM — Pest lacked isolation / assignee scope / reversed custom period | **Fixed** | Extended `AnalyticsOverviewTest` |
| F5 | LOW — `database.md` omitted “no dedicated tables” note | **Fixed** | Entity overview note |

### Open (non-blocking)

| ID | Severity | Area | Finding | Recommendation |
|----|----------|------|---------|----------------|
| F6 | LOW | Frontend | Apply can show stale cards while React Query refetches (`isFetching`) | Optional subtle loading on refetch |
| F7 | LOW | Frontend / a11y | Loading and empty states could use stronger accessible names | Polish |
| F8 | LOW | Product | Soft sections omit Accounting / email analytics by design | Keep deferred; document in roadmap |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No dedicated Analytics tables | Aggregates over existing tenant tables only |
| No hard `module_dependencies` | Empty overview is valid when only Analytics is installed |
| Assignee org vs mine mirrors dashboard widgets | Uses `ScopesToAssignee` + `{module}.assign` |
| Tasks due/overdue use `UtcInstant` | Avoids workspace-TZ false overdue |
| No queues / schedulers / env vars | Deploy is migrate + SPA only |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/Analytics` | **11 passed** | Entitlement, permission, soft sections, period validation, isolation, assignee scope |
| `xvfb-run -a npm run test:e2e:analytics:headed` | **11 passed (~27s)** | One-session modules + authz + workflow |

**Headed e2e coverage:**

1. Authz: SPA `/403` without entitlement  
2. Authz: API gated until Analytics entitled  
3. Workflow: page loads after entitlement  
4. Shared session: bootstrap + install Analytics + source modules  
5. Nav open + default period overview  
6. Client: custom period without dates rejected  
7. Client: end before start rejected  
8. Valid custom period refreshes sections  
9. Last Month / This Year presets  
10. API rejects invalid custom period (same session)  
11. Remains reachable from dashboard after period flows  

---

## Deploy order

1. **Backend** — `php artisan migrate --force` (catalog register + `analytics.view` permissions only; no new domain tables)  
2. **SPA** — `/analytics` + Overview nav + tour  
3. **Docs** + **marketing site** (SKU available)  
4. Staging smoke below before production traffic  

Suggested merge: **Backend → Frontend → Docs → Website**.  
No new queues, schedulers, or env vars.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied (`register_analytics_module`, `add_analytics_permissions`) | Ops | ☐ |
| 2 | Catalog: published, Operations, not default-included, not billable, `$0`, v1.0.0 | Ops | ☐ |
| 3 | New workspace lacks Analytics until Marketplace install | QA | ☐ |
| 4 | SPA `RequireAccess` (`module=analytics`, `analytics.view`) | QA | ☐ |
| 5 | Soft sections appear only for entitled modules + view permission | QA | ☐ |
| 6 | Pest Analytics suite green in CI | Eng | ☐ |
| 7 | Playwright `test:e2e:analytics` green on staging | QA | ☐ |
| 8 | Smoke steps below signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Analytics** (free)  
2. Sidebar Overview → Analytics for `analytics.view`  
3. Default period loads; entitled sections render StatCards  
4. Custom period: missing dates / end before start show client errors  
5. Apply valid custom + Last Month / This Year  
6. Staff without a source `{module}.view`: that section omitted  
7. Staff without `{module}.assign`: section `scope` is mine  
8. Module uninstalled → SPA `/403` and API `403`  
9. Optional: uninstall a source module → its Analytics section disappears without uninstalling Analytics  

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall (no Analytics domain rows to purge) |
| Schema | No Analytics domain schema to roll back; catalog/permission migrations are additive |

---

## Monitoring

- No Analytics-specific audit events (read-only overview)  
- Watch `GET /api/tenant/v1/analytics/overview` latency under large opportunity pipelines (SQL aggregate)  
- Platform 403 rate if Marketplace uninstalls spike  

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | **Conditional Go** / No-Go |
| Product | | | Accept F6–F8 residuals |
| Ops | | | Staging migrate + smoke ☐ |

**Recommendation:** Merge companions after CI green; run staging smoke; treat F6–F8 as post-GA polish. Do not ship report builder / export under this SKU without a new version and DoD.
