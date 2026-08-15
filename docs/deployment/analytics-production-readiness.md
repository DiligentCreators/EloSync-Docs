# Analytics / Reports — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-16 |
| **Status** | **Go** — engineering + companion CI green for **1.4.0** People Payroll soft source; staging migrate smoke remains ops checkbox |
| **Scope** | Analytics module `analytics` catalog **1.4.0** (People soft source **Payroll**, gated by `payroll.view`) |
| **Branch** | `feature/analytics-payroll-people-1-4-0` |
| **Companion** | [Analytics production](./analytics) · [Developer guide](/developer-guide/analytics) · [User guide](/user-guide/analytics) · [API](/api/tenant-v1-analytics) |

**PRs:** Backend [#113](https://github.com/DiligentCreators/SaaS-Backend/pull/113) · Frontend [#109](https://github.com/DiligentCreators/SaaS-Frontend/pull/109) · Docs [#134](https://github.com/DiligentCreators/SaaS-Docs/pull/134) · Website [#28](https://github.com/DiligentCreators/SaaS-Website/pull/28)

Prior Go audits for **1.2.0** / **1.3.0** / **1.3.1** remain valid for those slices; this audit covers the **1.4.0** Payroll People delta.

---

## Executive summary

Reports (`analytics` slug) is a **free** Operations Marketplace SKU (`$0`). Catalog **1.4.0** adds People soft source **Payroll**:

- Soft gate: Payroll entitled + **`payroll.view`** (stricter than plain `analytics.view`; staff default role map omits compensation)
- Metrics: pay runs overlapping the report period, paid net (sum of `pay_run_lines.net` for `paid` runs), org-wide payroll profile count
- Rows: status mix `draft` / `approved` / `paid` with line-net amounts (no per-employee compensation dump)
- **No** staff self-scope (mirrors `PayRunPolicy`); leave/attendance self-scope unchanged
- Out of scope (intentional): executive overview payroll strip, report builder, saved reports, multi-currency conversion

**Go / No-Go:** **Go** — merge companions **Backend → Frontend → Docs → Website**, migrate through **1.4.0**, complete staging smoke (manager Payroll + staff omit).

| Gate | Result |
|------|--------|
| Catalog: operations / `analytics` / **1.4.0** / free opt-in / sort 70 / not default-included | **Pass** (local DB verified **1.4.0**) |
| Migrate-only bumps: … → **1.3.1** → **1.4.0** (`2026_08_16_034000_…` after `220001`) | **Pass** |
| Soft source `payroll` + `canSource(..., 'payroll.view')` | **Pass** |
| No payroll in `AnalyticsOverviewService` | **Pass** |
| Leave/attendance self-scope unchanged | **Pass** |
| SPA People copy / nav / donut chart | **Pass** |
| Pest `tests/Feature/Tenant/Analytics` | **Pass** (**23** passed local) |
| Playwright `test:e2e:analytics:headed` | **Pass** (**14/14**, ~4.9m) |
| Backend Laravel Tests (workflow_dispatch) | **Pass** |
| Backend Code Quality Gate (workflow_dispatch) | **Pass** |
| Frontend Quality Gate | **Pass** (PR #109) |
| Docs Quality Gate | **Pass** (PR #134) |
| Website Quality Gate | **Pass** (PR #28) |
| Report builder; saved reports; email analytics | **Deferred** |
| Staging human smoke | ☐ Ops |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs | Website |
|----------|---------|----------|------|---------|
| Free Operations Marketplace opt-in | Pass | Pass | Pass | Pass |
| Soft sources (no hard `module_dependencies`) | Pass | Pass | Pass | Pass |
| People Payroll soft source | Pass | Pass | Pass | Pass |
| Gate Payroll on `payroll.view` | Pass | Pass | Pass | Pass |
| No staff payroll self-scope | Pass | n/a | Pass | n/a |
| Period overlap on pay-run dates | Pass | Pass | Pass | n/a |
| Aggregates only (no employee salary rows) | Pass | Pass | Pass | n/a |
| No overview payroll section in 1.4.0 | Pass | Pass | Pass | Pass |
| Keep Financial Reports + Department reports separate | Pass | Pass | Pass | Pass |

---

## Findings

### Open this audit

None (engineering). Staging smoke remains an ops pre-flight checkbox, not a code blocker.

### Resolved this audit

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| F19 | **MEDIUM** | Companion PRs missing; Backend CI manual-only | Opened [#113](https://github.com/DiligentCreators/SaaS-Backend/pull/113) · [#109](https://github.com/DiligentCreators/SaaS-Frontend/pull/109) · [#134](https://github.com/DiligentCreators/SaaS-Docs/pull/134) · [#28](https://github.com/DiligentCreators/SaaS-Website/pull/28); dispatched Laravel Tests + Code Quality Gate — both **success** |
| F20 | **MEDIUM** | Local catalog still **1.3.1** | Migrated; central `modules.version` for `analytics` verified **1.4.0** |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No dedicated Analytics tables | Aggregates `pay_runs` / `pay_run_lines` / `payroll_profiles` |
| Multi-currency sums without FX | Same pattern as Billing domain reports |
| No executive overview payroll KPI | Explicitly out of scope for 1.4.0 |
| E2e asserts owner Payroll; staff omit covered by Pest | Authz e2e remains SPA-gate focused |
| Backend Tests / Quality Gate remain `workflow_dispatch` | Org cost control; dispatched before merge |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact --filter=Analytics` | **23 passed** | Local 2026-08-16 |
| `npm run test:e2e:analytics:headed` | **14 passed** | Includes People + payroll assert |
| Backend Laravel Tests | **Success** | workflow_dispatch on feature branch |
| Backend Code Quality Gate | **Success** | workflow_dispatch on feature branch |
| Frontend Quality Gate | **Success** | PR #109 |
| Docs Quality Gate | **Success** | PR #134 |
| Website Quality Gate | **Success** | PR #28 |
| Catalog row (local after migrate) | **1.4.0**, not default, not billable, $0 | |

---

## Deploy order

1. **Backend** — merge [#113](https://github.com/DiligentCreators/SaaS-Backend/pull/113); `php artisan migrate --force` through `2026_08_16_034000_bump_analytics_module_to_reports_1_4_0`
2. **SPA** — merge [#109](https://github.com/DiligentCreators/SaaS-Frontend/pull/109)
3. **Docs** — merge [#134](https://github.com/DiligentCreators/SaaS-Docs/pull/134)
4. **Website** — merge [#28](https://github.com/DiligentCreators/SaaS-Website/pull/28)
5. Staging smoke below

No new queues, schedulers, or env vars.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through `…_bump_analytics_module_to_reports_1_4_0` applied | Ops | ☑ local; ☐ staging |
| 2 | Catalog: published, Operations, not default-included, not billable, `$0`, **v1.4.0** | Ops | ☑ local; ☐ staging |
| 3 | New workspace lacks Reports until Marketplace install | QA | ☐ |
| 4 | SPA `RequireAccess` (`module=analytics`, `analytics.view`) | QA | ☐ |
| 5 | Nested sidebar People when Employees/Leave/Attendance/**Payroll** entitled | QA | ☐ |
| 6 | Soft sources + charts only for entitled modules + view permission | QA | ☐ |
| 7 | People Payroll when `payroll.view`; staff omit without it | QA | ☐ |
| 8 | Payroll status mix donut; legend values readable | QA | ☐ |
| 9 | Domain CSV export includes payroll rows when entitled | QA | ☐ |
| 10 | Period validation + Apply period refetch UX | QA | ☐ |
| 11 | Pest Analytics **23** + Backend CI green | Eng | ☑ |
| 12 | Frontend Quality Gate green | Eng | ☑ |
| 13 | Playwright `test:e2e:analytics:headed` | QA | ☑ (**14/14**) |
| 14 | Website Quality Gate green + timeline **1.4.0** | Eng | ☑ |
| 15 | Docs Quality Gate green | Eng | ☑ |
| 16 | Smoke steps below signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Reports** (+ **Payroll** + Employees as needed)
2. As manager/owner with `payroll.view`: Overview → Reports → **People** shows Payroll KPIs, status chart, table, **Export CSV**
3. Create a paid pay run overlapping the selected period → paid net and `paid` bucket update after Apply period
4. As staff with `analytics.view` + HR view but **without** `payroll.view`: People still loads; **Payroll source omitted**
5. Leave/attendance self-scope for staff still holds (regression)
6. Custom period validation (missing dates / end before start)
7. Module uninstall Reports → SPA `/403` and API `403`
8. Confirm Financial Reports and Department reports remain separate

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall (no Analytics domain rows to purge) |
| Schema | No Analytics domain schema; catalog bump is additive |

---

## Monitoring

- No Analytics-specific audit events (read-only)
- Watch `GET /api/tenant/v1/analytics/reports/people` latency when Payroll entitled
- Watch for unexpected Payroll visibility for staff roles (should never appear without `payroll.view`)

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | 2026-08-16 | **Go** (F19–F20 closed; companion CI green) |
| Product | | | Accept report builder / overview payroll deferred |
| Ops | | | Staging migrate through **1.4.0** + smoke ☐ |

**Recommendation:** Merge companions **Backend → Frontend → Docs → Website**, migrate staging to **1.4.0**, run staging smoke (Payroll manager+ / staff omit), then promote. Do **not** add report builder or overview payroll under this SKU without a new catalog version and DoD.
