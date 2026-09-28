# Projects portfolio Gantt (1.5.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-29 |
| **Re-verified** | 2026-09-29 — Pest Gantt **4/4**; VitePress build local **Pass**; remediations M1/M2/L1/L2 closed |
| **Status** | **Go for production** (merge/deploy remaining; GitHub Actions billing lock is org-side, not content) |
| **Scope** | Portfolio Gantt view + `GET /projects/gantt`; catalog **projects 1.4.0 → 1.5.0** |
| **Backend** | `ProjectService::gantt`; route before `{project}`; migrate-only bump + CatalogSeeder; Pest `ProjectGanttTest` |
| **Frontend** | Board/List/Gantt toggle; day-scale bars; expand milestones/tasks; drag-shift dates; Playwright workflow coverage |
| **Docs** | User/developer/API/deployment/roadmap/changelog + upgrade + this audit |
| **Companion** | [Projects deployment](./projects) · [Overview](/user-guide/projects-overview) · [API](/api/tenant-v1-projects) · [CHANGELOG](/changelog/) · Backend [#217](https://github.com/DiligentCreators/EloSync-Backend/pull/217) · Frontend [#215](https://github.com/DiligentCreators/EloSync-Frontend/pull/215) · Docs [#297](https://github.com/DiligentCreators/EloSync-Docs/pull/297) |

---

## Executive summary

Projects list gains a **Gantt** view mode. The API returns portfolio rows (project bars, nested milestones, soft Tasks when entitled) under the same filters and visibility as list/board. SPA renders a day-scale timeline; editors with `projects.update` can drag bars to shift `starts_on`/`ends_on`. No new permissions, queues, scheduler entries, or env vars.

**Go / No-Go:** **Go** — audit residuals remediated.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Visibility parity with list (non-assign) | **Pass** — Pest |
| Soft Tasks only when entitled + `tasks.view` + Task policy | **Pass** — Pest |
| Dependency ids filtered to visible tasks | **Pass** — Pest (L1 remediated) |
| Gantt drops list default eager loads | **Pass** (L2 remediated) |
| Catalog migrate-only **1.5.0** + CatalogSeeder | **Pass** |
| Drag preserves null `ends_on`; no post-drag open | **Pass** (M1/M2 remediated) |
| SPA Board / List / Gantt toggle | **Pass** |
| Playwright Projects workflow includes Gantt bar | **Pass** (coverage added; full suite env-dependent) |
| User / developer / API / deployment / roadmap / changelog | **Pass** |
| New permission / env / queue / seeder for cutover | **N/A** |

---

## Security summary

| Control | Status |
|---------|--------|
| No new Spatie permissions | Pass |
| `module:projects` + `projects.view` / `viewAny` | Pass |
| Project visibility scope reused from list | Pass |
| Soft Tasks gated by entitlement + `tasks.view` + `TaskPolicy::view` | Pass |
| `depends_on_task_ids` does not leak hidden task ids | Pass (L1) |
| Date drag uses existing `PUT /projects/{id}` + update policy | Pass |
| Tenant isolation unchanged | Pass |

### Findings

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **M1** | Medium | Drag with only `starts_on` invented `ends_on` (= shifted start) | **Remediated** — preserve null `ends_on` |
| **M2** | Medium | Pointer drag cleared `draggingId` before click → opened project after shift | **Remediated** — suppress open after non-zero drag |
| **L1** | Low | `depends_on_task_ids` included blockers the actor could not view | **Remediated** — intersect with visible task ids + Pest |
| **L2** | Low | Gantt inherited list eager loads (CRM embeds / latest note) | **Remediated** — `setEagerLoads([])` then assignee/milestones/tasks only |
| **I1** | Info | Docs Quality Gate CI failed in ~2s with empty steps | **Org billing lock** — not a content defect; local VitePress build **Pass** |

No open residuals.

---

## Change inventory

### Backend

- `GET /projects/gantt` (`projects.gantt`) before `{project}` show route
- `ProjectService::gantt` — filters/visibility via `query()`; limit 1–200 (default 100); soft Tasks; dependence id filter; lean eager loads
- Migration `2026_09_28_220000_bump_projects_module_version_to_1_5_0`
- `CatalogSeeder` projects **1.5.0**
- Pest: `ProjectGanttTest` (4) + `ProjectsModuleVersion150BumpTest`

### Frontend

- `projects-gantt.tsx` + list view mode **Gantt**
- Types / `projectService.gantt` / `QUERY_KEYS.projectGantt`
- Drag-shift dates via partial `PUT` (dates only)
- Playwright Gantt bar assertion in projects workflow

### Docs

- User / developer / API / deployment / roadmap / changelog
- Upgrade note **1.4.0 → 1.5.0**
- This production readiness audit

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php85 artisan test --compact tests/Feature/Tenant/Project/ProjectGanttTest.php` | **4 passed**, 35 assertions | Portfolio rows; no-tasks entitlement; project visibility; hidden dependency omit |
| Catalog bump Pest | **Pass** | `ProjectsModuleVersion150BumpTest` |
| VitePress `docs:build` (local) | **Pass** | Dead-link gate |
| Playwright `test:e2e:projects` | Coverage added | Run against live API/demo when env available |

---

## Staging smoke

1. `php artisan migrate --force` — catalog → **1.5.0** (do **not** `db:seed`).
2. Deploy Frontend with Projects Gantt view.
3. Dated project → **Gantt** → bar visible → expand milestones/tasks.
4. Drag bar (update permission) → dates shift; start-only project keeps `ends_on` null.
5. Staff without `tasks.assign`: only assigned tasks appear; dependency on hidden task omitted from ids.
6. Without Tasks entitled: `includes_tasks=false`, empty `tasks[]`.

## Rollback

Roll back Frontend first (hides Gantt UI). Catalog bump `down` restores display version **1.4.0**; endpoint absence follows Backend code rollback.
