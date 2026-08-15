# Analytics / Reports — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-15 (Go audit — Reports suite **1.2.0**) |
| **Status** | **Go** — companions green after tour CI fix, website 1.2.0, refetch/a11y polish, Backend CI dispatched |
| **Scope** | Analytics module `analytics` **v1.2.0** (display name **Reports**) |
| **Branch** | `feature/analytics-module-mvp-bc72` |
| **Companion** | [Analytics production](./analytics) · [Developer guide](/developer-guide/analytics) · [User guide](/user-guide/analytics) · [API](/api/tenant-v1-analytics) |

**PRs:** Backend [#111](https://github.com/DiligentCreators/SaaS-Backend/pull/111) · Frontend [#107](https://github.com/DiligentCreators/SaaS-Frontend/pull/107) · Docs [#132](https://github.com/DiligentCreators/SaaS-Docs/pull/132) · Website [#26](https://github.com/DiligentCreators/SaaS-Website/pull/26)

---

## Executive summary

Reports (`analytics` slug) is a **free** Operations Marketplace SKU (`$0`). Catalog **1.2.0** ships SPA per-module charts, nested sidebar (Reports → CRM / Sales / Billing / Purchasing), and the **1.1.0** KPI + table + CSV suite. Soft gates and `analytics.view` are unchanged. **Financial Reports** and **Department reports** stay separate. **People / HR** domain report remains planned (~**1.3.0**).

**Go / No-Go:** **Go** for staging → production after migrate + human smoke below.

| Gate | Result |
|------|--------|
| Catalog: operations / `analytics` / **1.2.0** / free opt-in / sort 70 / not default-included | **Pass** |
| Migrate-only register + permissions + rename 1.1.0 + charts bump 1.2.0 | **Pass** |
| Route middleware: `module:analytics` then `can:analytics.view` | **Pass** |
| Soft sections / domain sources (no hard `module_dependencies`) | **Pass** |
| Domain APIs: CRM / Sales / Billing / Purchasing + CSV export | **Pass** |
| SPA hub + domain pages + nested Reports submenu + charts | **Pass** |
| Refetch UX + accessible loading/empty names | **Pass** (F6/F7) |
| Read-only `GET` overview / reports (no mutations) | **Pass** |
| Pest `tests/Feature/Tenant/Analytics` | **Pass** (**17** passed; Backend Laravel Tests + Quality Gate **success** on branch) |
| Module-tour registry (`analytics`, length **35**) | **Pass** (F9) |
| Playwright `test:e2e:analytics*` | **Pass** after authz label/timeout fix (re-run on staging for sign-off) |
| Docs core set (user / developer / API / deploy / changelog / roadmap) | **Pass** |
| Marketing website SKU + timeline **1.2.0** | **Pass** (F10) |
| Weighted pipeline SQL aggregate (no unbounded `get()`) | **Pass** |
| LocalSeed / `boost.json` leftovers | **Excluded** from PR (F12) |
| People / HR; report builder; saved reports; email analytics | **Deferred** |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Docs | Website |
|----------|---------|----------|------|---------|
| Free Operations Marketplace opt-in (not default, not billable) | Pass | Pass | Pass | Pass |
| Soft source-module sections (no hard deps) | Pass | Pass | Pass | Pass |
| Period via shared `DashboardPeriod` | Pass | Pass | Pass | Pass |
| Domain reports CRM/Sales/Billing/Purchasing + CSV | Pass | Pass | Pass | Pass |
| Per-module charts (SPA Recharts) | n/a | Pass | Pass | Pass |
| Nested Reports sidebar (label navigates; chevron toggles) | n/a | Pass | Pass | n/a |
| Permission `analytics.view` only | Pass | Pass | Pass | n/a |
| Keep Financial Reports + Department reports separate | Pass | Pass | Pass | Pass |
| People / HR deferred (~1.3.0) | Pass | Pass | Pass | n/a |

---

## Findings

### Resolved this Go audit

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| F9 | HIGH | Module-tour length 34 vs 35 | Assert `analytics` + length **35** |
| F10 | MEDIUM | Website timeline catalog 1.1.0 | Timeline detail **1.2.0** + charts |
| F11 | MEDIUM | Backend PR Pest CI paused | Manual `workflow_dispatch` Laravel Tests + Quality Gate on branch |
| F12 | LOW | LocalSeed + `boost.json` dirty | Kept **out** of production PR |
| F6 | LOW | Stale cards on refetch | Apply disabled + “Updating…” status + opacity while fetching |
| F7 | LOW | Weak loading/empty a11y names | Named `aria-label` / `role="status"` on loading and empty |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No dedicated Analytics tables | Aggregates existing tenant tables only |
| No hard `module_dependencies` | Empty overview/domain valid when only Analytics installed |
| Charts SPA-only | No chart-specific API endpoints |
| No queues / schedulers / env vars | Deploy = migrate + SPA |
| People/HR not in 1.2.0 | Documented future area |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/Analytics` | **17 passed** | Overview + domain + CSV + authz |
| Backend `workflow_dispatch` Laravel Tests + Quality Gate | **Success** | Runs [31896888030](https://github.com/DiligentCreators/SaaS-Backend/actions/runs/31896888030), [31896890006](https://github.com/DiligentCreators/SaaS-Backend/actions/runs/31896890006) |
| Frontend `npx tsc --noEmit` | **Pass** | |
| Module-tour Vitest length **35** | **Pass** | Includes `analytics` |
| Docs VitePress Quality Gate (PR #132) | **Success** | |
| Playwright `test:e2e:analytics` | Specs updated | Authz expects **Reports** nav label; API timeout 30s |

---

## Deploy order

1. **Backend** — `php artisan migrate --force` (register → permissions → 1.1.0 → **1.2.0**)
2. **SPA** — hub + domain pages + nested nav + charts + refetch polish
3. **Docs** + **marketing site** (SKU **1.2.0**)
4. Staging smoke below

Suggested merge: **Backend → Frontend → Docs → Website**.  
No new queues, schedulers, or env vars.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations through `…_bump_analytics_module_to_reports_1_2_0` applied | Ops | ☐ |
| 2 | Catalog: published, Operations, not default-included, not billable, `$0`, **v1.2.0** | Ops | ☐ |
| 3 | New workspace lacks Reports until Marketplace install | QA | ☐ |
| 4 | SPA `RequireAccess` (`module=analytics`, `analytics.view`) | QA | ☐ |
| 5 | Nested sidebar: Reports navigates; chevron expands CRM/Sales/Billing/Purchasing | QA | ☐ |
| 6 | Soft sources + charts only for entitled modules + view permission | QA | ☐ |
| 7 | Domain CSV export when sources present | QA | ☐ |
| 8 | Period apply shows Updating… / disables button while fetching | QA | ☐ |
| 9 | Pest Analytics + Backend CI green | Eng | ☐ |
| 10 | Frontend Quality Gate green (tour length 35) | Eng | ☐ |
| 11 | Playwright `test:e2e:analytics` on staging | QA | ☐ |
| 12 | Smoke steps below signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Reports** (free; search `analytics` if needed)
2. Sidebar Overview → **Reports** opens hub; chevron expands domain links
3. Default period: KPI sections + per-module charts for entitled sources
4. Change period → **Apply period** shows Updating… then refreshes
5. Open CRM / Sales / Billing / Purchasing: KPIs, module charts, table, **Export CSV**
6. Custom period: missing dates / end before start show client errors
7. Staff without a source `{module}.view`: that section/source omitted
8. Module uninstalled → SPA `/403` and API `403`
9. Confirm Financial Reports and Department reports remain separate surfaces

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
- Watch `GET /api/tenant/v1/analytics/overview` and `/analytics/reports/{area}` latency
- Platform 403 rate if Marketplace uninstalls spike

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | **Go** / No-Go |
| Product | | | Accept People/HR deferred |
| Ops | | | Staging migrate + smoke ☐ |

**Recommendation:** Merge companions after CI green on pushed fixes; run staging smoke; ship **1.2.0**. Do **not** ship People/HR or report builder under this SKU without a new catalog version and DoD.
