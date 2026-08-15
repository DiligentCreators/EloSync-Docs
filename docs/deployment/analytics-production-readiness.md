# Analytics / Reports — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-16 |
| **Status** | **Conditional Go** — engineering gates green for **1.4.0** People Payroll soft source; open companion PRs, migrate through **1.4.0**, staging smoke (manager Payroll + staff omit) |
| **Scope** | Analytics module `analytics` catalog **1.4.0** (People soft source **Payroll**, gated by `payroll.view`) |
| **Branch** | `feature/analytics-payroll-people-1-4-0` (Backend · Frontend · Docs · Website) |
| **Companion** | [Analytics production](./analytics) · [Developer guide](/developer-guide/analytics) · [User guide](/user-guide/analytics) · [API](/api/tenant-v1-analytics) |

**PRs:** Not opened yet (local commits on companion branches). Prior 1.3.1 ship: Backend [#112](https://github.com/DiligentCreators/SaaS-Backend/pull/112) · Frontend [#108](https://github.com/DiligentCreators/SaaS-Frontend/pull/108) · Docs [#133](https://github.com/DiligentCreators/SaaS-Docs/pull/133) · Website [#27](https://github.com/DiligentCreators/SaaS-Website/pull/27).

Prior Go audits for **1.2.0** / **1.3.0** / **1.3.1** remain valid for those slices; this audit covers the **1.4.0** Payroll People delta.

---

## Executive summary

Reports (`analytics` slug) is a **free** Operations Marketplace SKU (`$0`). Catalog **1.4.0** adds People soft source **Payroll**:

- Soft gate: Payroll entitled + **`payroll.view`** (stricter than plain `analytics.view`; staff default role map omits compensation)
- Metrics: pay runs overlapping the report period, paid net (sum of `pay_run_lines.net` for `paid` runs), org-wide payroll profile count
- Rows: status mix `draft` / `approved` / `paid` with line-net amounts (no per-employee compensation dump)
- **No** staff self-scope (mirrors `PayRunPolicy`); leave/attendance self-scope unchanged
- Out of scope (intentional): executive overview payroll strip, report builder, saved reports, multi-currency conversion

**Go / No-Go:** **Conditional Go** — ship after companion PRs clear CI, migrate through **1.4.0**, and staging smoke confirms Payroll for manager+ and omission for staff.

| Gate | Result |
|------|--------|
| Catalog: operations / `analytics` / **1.4.0** / free opt-in / sort 70 / not default-included | **Pass** (code + seeder); local DB still **1.3.1** until migrate |
| Migrate-only bumps: … → **1.3.1** → **1.4.0** (`2026_08_16_034000_…` after `220001`) | **Pass** |
| Soft source `payroll` in `AREA_SOURCES['people']` + `canSource(..., 'payroll.view')` | **Pass** |
| No payroll in `AnalyticsOverviewService` (locked out of scope) | **Pass** |
| Leave/attendance self-scope unchanged | **Pass** |
| SPA People copy / nav `anyModules` / donut chart label | **Pass** |
| Pest `tests/Feature/Tenant/Analytics` | **Pass** (**23** passed local, 2026-08-16) |
| Playwright `test:e2e:analytics:headed` | **Pass** (**14/14**, workers=1, ~4.9m, includes People + payroll assert) |
| Docs core set (user / developer / API / deploy / changelog / roadmap) | **Pass** (branch committed; Docs CI pending PR) |
| Marketing website timeline **1.4.0** | **Pass** (branch committed; website CI pending PR) |
| Companion PRs opened + Backend/Frontend CI green | **Open** (F19) |
| Staging migrate **1.4.0** + human smoke | **Open** (F20) |
| Report builder; saved reports; email analytics | **Deferred** |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs | Website |
|----------|---------|----------|------|---------|
| Free Operations Marketplace opt-in | Pass | Pass | Pass | Pass |
| Soft sources (no hard `module_dependencies`) | Pass | Pass | Pass | Pass |
| People Payroll soft source | Pass | Pass | Pass | Pass |
| Gate Payroll on `payroll.view` (not `analytics.view` alone) | Pass | Pass (copy) | Pass | Pass |
| No staff payroll self-scope | Pass | n/a | Pass | n/a |
| Period overlap on pay-run dates | Pass | Pass (period UX) | Pass | n/a |
| Aggregates only (no employee-level salary rows) | Pass | Pass | Pass | n/a |
| No overview payroll section in 1.4.0 | Pass | Pass | Pass | Pass |
| Keep Financial Reports + Department reports separate | Pass | Pass | Pass | Pass |

---

## Findings

### Open this audit

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| F19 | **MEDIUM** | Companion PRs for `feature/analytics-payroll-people-1-4-0` not opened; Backend CI is `workflow_dispatch`-only | Open PRs; dispatch Backend Quality Gate + Laravel Tests before merge |
| F20 | **MEDIUM** | Local central catalog still **1.3.1**; staging/production must migrate through `…_1_4_0` | Ops: `php artisan migrate --force` then smoke |

### Resolved / none this delta

No product or security defects found in the 1.4.0 implementation relative to the locked plan.

### Accepted / intentional

| Item | Notes |
|------|-------|
| No dedicated Analytics tables | Aggregates `pay_runs` / `pay_run_lines` / `payroll_profiles` |
| Multi-currency sums without FX | Same pattern as Billing domain reports |
| No executive overview payroll KPI | Explicitly out of scope for 1.4.0 |
| E2e asserts owner Payroll source; staff omit covered by Pest | Authz e2e remains SPA-gate focused |
| Backend Tests / Quality Gate remain `workflow_dispatch` | Org cost control; dispatch before merge |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact --filter=Analytics` | **23 passed** (160 assertions) | Local 2026-08-16; includes payroll.view gate, period overlap, CSV |
| `npm run test:e2e:analytics:headed` | **14 passed** (~4.9m) | Authz + workflow + modules; People asserts `payroll` + `payroll_profiles` |
| Catalog migration chain | SemVer order OK | `…1_3_0` → `…1_3_1` → `…1_4_0` |
| Catalog row (local DB before migrate) | **1.3.1** | Expected until F20 migrate |
| Companion PR CI | **Pending** | F19 |

---

## Deploy order

1. **Backend** — `php artisan migrate --force` through `2026_08_16_034000_bump_analytics_module_to_reports_1_4_0`
2. **SPA** — People Payroll copy / nav / charts + e2e bootstrap
3. **Docs** + **marketing site** (SKU / timeline **1.4.0**)
4. Staging smoke below

Suggested merge: **Backend → Frontend → Docs → Website** after CI gates clear.

No new queues, schedulers, or env vars.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through `…_bump_analytics_module_to_reports_1_4_0` applied | Ops | ☐ |
| 2 | Catalog: published, Operations, not default-included, not billable, `$0`, **v1.4.0** | Ops | ☐ |
| 3 | New workspace lacks Reports until Marketplace install | QA | ☐ |
| 4 | SPA `RequireAccess` (`module=analytics`, `analytics.view`) | QA | ☐ |
| 5 | Nested sidebar: Reports + … / **People** (visible when Employees/Leave/Attendance/**Payroll** entitled) | QA | ☐ |
| 6 | Soft sources + charts only for entitled modules + view permission | QA | ☐ |
| 7 | People: employees / leave / attendance + **Payroll** when `payroll.view`; staff without `payroll.view` omit Payroll | QA | ☐ |
| 8 | Chart types vary; Payroll status mix uses donut; legend values readable | QA | ☐ |
| 9 | Domain CSV export includes payroll rows when entitled | QA | ☐ |
| 10 | Period validation + Apply period refetch UX | QA | ☐ |
| 11 | Pest Analytics **23** + Backend CI green | Eng | ☑ local Pest; ☐ CI dispatch |
| 12 | Frontend Quality Gate green | Eng | ☐ (pending PR) |
| 13 | Playwright `test:e2e:analytics:headed` | QA | ☑ (**14/14**) |
| 14 | Website Quality Gate green + timeline **1.4.0** | Eng | ☐ (pending PR) |
| 15 | Smoke steps below signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Reports** (+ **Payroll** + Employees as needed)
2. As manager/owner with `payroll.view`: Overview → Reports → **People** shows Payroll KPIs (runs / paid net / profiles), status chart, table, **Export CSV**
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
| Engineering | | 2026-08-16 | **Conditional Go** (local Pest + headed e2e green; PRs + staging remain) |
| Product | | | Accept report builder / overview payroll deferred |
| Ops | | | Staging migrate through **1.4.0** + smoke ☐ |

**Recommendation:** Open companion PRs on `feature/analytics-payroll-people-1-4-0`, dispatch Backend CI, merge **Backend → Frontend → Docs → Website**, migrate to **1.4.0**, run staging smoke (Payroll manager+ / staff omit), then promote. Do **not** add report builder or overview payroll under this SKU without a new catalog version and DoD.
