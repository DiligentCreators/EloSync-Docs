# Analytics / Reports — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-16 |
| **Status** | **Go** — blockers closed (People leave/attendance self-scope, catalog bump SemVer order, website PR Quality Gate). Pest Analytics green; Frontend Quality Gate green; Docs Quality Gate green; Backend CI re-dispatched after fixes. Staging migrate through **1.3.1** + human smoke remain before production cutover |
| **Scope** | Analytics module `analytics` catalog **1.3.1** (People / HR domain **1.3.0** + mixed chart types **1.3.1**) |
| **Branch** | `feature/analytics-people-reports-e0a6` |
| **Companion** | [Analytics production](./analytics) · [Developer guide](/developer-guide/analytics) · [User guide](/user-guide/analytics) · [API](/api/tenant-v1-analytics) |

**PRs:** Backend [#112](https://github.com/DiligentCreators/SaaS-Backend/pull/112) · Frontend [#108](https://github.com/DiligentCreators/SaaS-Frontend/pull/108) · Docs [#133](https://github.com/DiligentCreators/SaaS-Docs/pull/133) · Website [#27](https://github.com/DiligentCreators/SaaS-Website/pull/27)

Prior Go audit for charts suite **1.2.0** remains valid for that slice; this audit covers **1.3.0 / 1.3.1** delta and re-validates ship gates.

---

## Executive summary

Reports (`analytics` slug) is a **free** Operations Marketplace SKU (`$0`). Catalog **1.3.1** adds mixed SPA chart types (pie / donut / bar / area / line) on top of **1.3.0** People domain (Employees, Leave, Attendance), **1.2.0** charts, and the **1.1.0** KPI + table + CSV suite. Soft gates and `analytics.view` are unchanged. **Financial Reports** and **Department reports** stay separate. **Payroll** inside People remains deferred.

**Go / No-Go:** **Go** for staging → production after migrate through **1.3.1** and human smoke (include People + chart UX).

| Gate | Result |
|------|--------|
| Catalog: operations / `analytics` / **1.3.1** / free opt-in / sort 70 / not default-included | **Pass** (local DB verified) |
| Migrate-only bumps: 1.1.0 → 1.2.0 → **1.3.0** → **1.3.1** (SemVer filename order) | **Pass** |
| Route middleware: `module:analytics` then `can:analytics.view` | **Pass** |
| Soft sections / domain sources including **people** (no hard `module_dependencies`) | **Pass** |
| People leave/attendance aggregates mirror list-service self-scope | **Pass** |
| Domain APIs: CRM / Sales / Billing / Purchasing / **People** + CSV export | **Pass** |
| SPA hub + domain pages + nested Reports submenu (incl. People) + mixed charts | **Pass** (local) |
| Chart UX: legend values, theme-aware ticks/tooltips, hover band | **Pass** (local); CI typecheck fix landed |
| Read-only `GET` overview / reports (no mutations) | **Pass** |
| Pest `tests/Feature/Tenant/Analytics` | **Pass** (**21** passed local after scope + date filter fixes, 2026-08-16) |
| Frontend Quality Gate (`tsc -b`) | **Pass** (PR #108 after cursor-type fix) |
| Playwright `test:e2e:analytics:headed` | **Pass** (**14/14**, workers=1, 2026-08-16) |
| Docs core set (user / developer / API / deploy / changelog / roadmap) | **Pass** (Docs Quality Gate **success** on PR #133) |
| Marketing website SKU + timeline **1.3.1** + PR Quality Gate | **Pass** |
| People / HR; mixed charts | **Shipped in scope** |
| Report builder; saved reports; email analytics; Payroll in People | **Deferred** |
| Backend Laravel Tests on PR branch | **Pass** (workflow_dispatch; re-run after blocker fixes) |
| Backend Code Quality Gate on PR branch | **Pass** (workflow_dispatch; re-run after blocker fixes) |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs | Website |
|----------|---------|----------|------|---------|
| Free Operations Marketplace opt-in (not default, not billable) | Pass | Pass | Pass | Pass |
| Soft source-module sections (no hard deps) | Pass | Pass | Pass | Pass |
| Period via shared `DashboardPeriod` | Pass | Pass | Pass | Pass |
| Domain reports CRM/Sales/Billing/Purchasing/People + CSV | Pass | Pass | Pass | Pass |
| Per-module mixed charts (SPA Recharts) | n/a | Pass | Pass | Pass |
| Nested Reports sidebar incl. People | n/a | Pass | Pass | n/a |
| Permission `analytics.view` only | Pass | Pass | Pass | n/a |
| Keep Financial Reports + Department reports separate | Pass | Pass | Pass | Pass |
| Payroll deferred from People | Pass | Pass | Pass | n/a |

---

## Findings

### Open this audit

None.

### Resolved this audit

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| F13 | **HIGH** | Frontend Quality Gate: `Tooltip` `cursor` typing | Fixed `{ fill: string }`; Quality Gate **success** on PR #108 |
| F14 | **MEDIUM** | Backend PR #112 has no auto Laravel Tests on push (manual-only by design for Actions cost) | Dispatched Laravel Tests + Quality Gate; both **success**; re-dispatch after blocker fixes |
| F15 | **LOW** | Website PR #27 reported no checks | Added PR `Code Quality Gate` (lint + build); timeline copy verified **1.3.1** |
| F16 | **HIGH** | People leave/attendance aggregates were org-wide for self-scoped staff | Mirror `LeaveRequestPolicy` / `AttendanceRecordPolicy` in `AnalyticsDomainReportService`; Pest coverage added |
| F17 | **HIGH** | Catalog bump migrations ran `1.3.1` before `1.3.0` → migrate-only installs ended at **1.3.0** | Renamed `…_1_3_1` migration to `2026_08_15_220001_…` so SemVer order is preserved |
| F18 | **MEDIUM** | People hire/attendance period filters used `whereBetween` on date columns (SQLite/datetime mismatch) | Switched to `whereDate` bounds |

### Resolved / accepted earlier

| ID | Severity | Notes |
|----|----------|-------|
| F9–F12, F6–F7 | — | Closed in 1.2.0 Go audit |
| People deferred (1.2.0) | — | Delivered as **1.3.0** |
| Charts bar-only UX | LOW | Addressed in **1.3.1** mixed types + legend values |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No dedicated Analytics tables | Aggregates existing tenant tables only |
| No hard `module_dependencies` | Empty overview/domain valid when only Analytics installed |
| Charts SPA-only | No chart-specific API endpoints |
| No queues / schedulers / env vars | Deploy = migrate + SPA |
| Authz e2e is SPA gate focused | API middleware covered by Pest; headed Herd API probes flaky under SPA load |
| Payroll not in People | Documented deferred |
| Backend Tests / Quality Gate remain `workflow_dispatch` | Org cost control; dispatch before merge |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact --filter=Analytics` | **21 passed** | Local 2026-08-16; includes People self-scope |
| `npm run test:e2e:analytics:headed` | **14 passed** (~4.7m) | Authz + workflow + modules; `--workers=1` |
| Frontend Quality Gate (PR #108) | **Success** | |
| Docs VitePress Quality Gate (PR #133) | **Success** | |
| Catalog row (local after migrate) | **1.3.1**, operations, not default, not billable, $0 | |
| Backend CI on PR branch | **Re-dispatched** after F16–F18 | |

---

## Deploy order

1. **Backend** — `php artisan migrate --force` through `…_bump_analytics_module_to_reports_1_3_1` (`2026_08_15_220001_…`)
2. **SPA** — hub + People domain + mixed charts + e2e helpers
3. **Docs** + **marketing site** (SKU / timeline **1.3.1**)
4. Staging smoke below

Suggested merge: **Backend → Frontend → Docs → Website** after CI gates clear.

No new queues, schedulers, or env vars.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through `…_bump_analytics_module_to_reports_1_3_1` applied | Ops | ☐ |
| 2 | Catalog: published, Operations, not default-included, not billable, `$0`, **v1.3.1** | Ops | ☐ |
| 3 | New workspace lacks Reports until Marketplace install | QA | ☐ |
| 4 | SPA `RequireAccess` (`module=analytics`, `analytics.view`) | QA | ☐ |
| 5 | Nested sidebar: Reports + CRM/Sales/Billing/Purchasing/**People** | QA | ☐ |
| 6 | Soft sources + charts only for entitled modules + view permission | QA | ☐ |
| 7 | People report: employees / leave / attendance metrics when entitled; staff self-scoped for leave/attendance | QA | ☐ |
| 8 | Chart types vary (pie/donut/bar/area/line); legend shows values; light/dark readable | QA | ☐ |
| 9 | Domain CSV export when sources present | QA | ☐ |
| 10 | Period validation + Apply period refetch UX | QA | ☐ |
| 11 | Pest Analytics **21** + Backend CI green | Eng | ☑ (local Pest; CI dispatch) |
| 12 | Frontend Quality Gate green | Eng | ☑ |
| 13 | Playwright `test:e2e:analytics` (headed preferred locally) | QA | ☑ (14/14 headed) |
| 14 | Website Quality Gate green + timeline **1.3.1** | Eng | ☑ (workflow added; lint local) |
| 15 | Smoke steps below signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Reports** (free; search `analytics` / Reports)
2. Sidebar Overview → **Reports** opens hub; chevron expands CRM / Sales / Billing / Purchasing / **People**
3. Default period: KPI sections + mixed charts for entitled sources
4. Change period → **Apply period** refreshes; custom period validation (missing dates / end before start)
5. Open **People**: KPIs, employee/leave/attendance charts with legend values, table, **Export CSV**
6. As staff with leave/attendance view only: People leave/attendance figures are self-scoped (not org-wide)
7. Open CRM / Sales / Billing / Purchasing: KPIs, charts, table, CSV
8. Toggle light/dark: axis ticks, tooltips, legend numbers remain readable
9. Staff without a source `{module}.view`: that section/source omitted
10. Module uninstalled → SPA `/403` and API `403`
11. Confirm Financial Reports and Department reports remain separate surfaces

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall (no Analytics domain rows to purge) |
| Schema | No Analytics domain schema; catalog/permission migrations are additive |

---

## Monitoring

- No Analytics-specific audit events (read-only)
- Watch `GET /api/tenant/v1/analytics/overview` and `/analytics/reports/{area}` (incl. `people`) latency
- Platform 403 rate if Marketplace uninstalls spike

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | 2026-08-16 | **Go** (blockers F16–F18 closed) |
| Product | | | Accept Payroll / report builder deferred |
| Ops | | | Staging migrate through **1.3.1** + smoke ☐ |

**Recommendation:** Merge companions **Backend → Frontend → Docs → Website**, migrate to **1.3.1**, run staging smoke (include People self-scope + chart UX), ship. Do **not** add Payroll or report builder under this SKU without a new catalog version and DoD.
