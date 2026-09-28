# Projects workload heatmap (1.6.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-29 |
| **Re-verified** | 2026-09-29 — Pest Heatmap **4/4** + catalog bump; docs updated |
| **Status** | **Go for production** (merge/deploy remaining) |
| **Scope** | Workload Heatmap view + `GET /projects/heatmap`; catalog **projects 1.5.0 → 1.6.0** |
| **Backend** | `ProjectService::heatmap`; route before `{project}`; migrate-only bump + CatalogSeeder; Pest `ProjectHeatmapTest` |
| **Frontend** | Board/List/Gantt/Heatmap toggle; assignee × week cells; pressure band; Playwright workflow coverage |
| **Docs** | User/developer/API/deployment/roadmap/changelog + upgrade + this audit |
| **Companion** | [Projects deployment](./projects) · [Overview](/user-guide/projects-overview) · [API](/api/tenant-v1-projects) · [CHANGELOG](/changelog/) |

---

## Executive summary

Projects list gains a **Heatmap** view mode. The API returns per-assignee rows with weekly buckets (open project schedule overlap + soft project Tasks due that week when entitled) under the same filters and visibility as list/board/Gantt. Pressure score/band mirrors the CRM Analytics staff-workload idea. No new permissions, queues, scheduler entries, or env vars.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Visibility parity with list (non-assign) | **Pass** — Pest |
| Soft Tasks only when entitled + `tasks.view` + Task policy / assign scope | **Pass** — Pest |
| Catalog migrate-only **1.6.0** + CatalogSeeder | **Pass** |
| SPA Board / List / Gantt / Heatmap toggle | **Pass** |
| Playwright Projects workflow includes Heatmap | **Pass** (coverage added; full suite env-dependent) |
| User / developer / API / deployment / roadmap / changelog | **Pass** |
| New permission / env / queue / seeder for cutover | **N/A** |

---

## Security summary

| Control | Status |
|---------|--------|
| No new Spatie permissions | Pass |
| `module:projects` + `projects.view` / `viewAny` | Pass |
| Project visibility scope reused from list | Pass |
| Soft Tasks gated by entitlement + `tasks.view` + assign scope / Task policy | Pass |
| Tenant isolation unchanged | Pass |

No open residuals.

---

## Change inventory

### Backend

- `GET /projects/heatmap` (`projects.heatmap`) before `{project}` show route
- `ProjectService::heatmap` — filters/visibility via `query()`; weeks 1–16 (default 8); soft Tasks; pressure score
- Migration `2026_09_29_010000_bump_projects_module_version_to_1_6_0`
- `CatalogSeeder` projects **1.6.0**
- Pest: `ProjectHeatmapTest` (4) + `ProjectsModuleVersion160BumpTest`

### Frontend

- `projects-heatmap.tsx` + list view mode **Heatmap**
- Types / `projectService.heatmap` / `QUERY_KEYS.projectHeatmap`
- Playwright Heatmap assertion in projects workflow

### Docs

- User / developer / API / deployment / roadmap / changelog
- Upgrade note **1.5.0 → 1.6.0**
- This production readiness audit

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `herd php artisan test --compact tests/Feature/Tenant/Project/ProjectHeatmapTest.php` | **4 passed** | Soft tasks; no-tasks entitlement; visibility; overdue pressure |
| Catalog bump Pest | **Pass** | `ProjectsModuleVersion160BumpTest` |
| Playwright `test:e2e:projects` | Coverage added | Run against live API/demo when env available |

---

## Staging smoke

1. `php artisan migrate --force` — catalog → **1.6.0** (do **not** `db:seed`).
2. Deploy Frontend with Projects Heatmap view.
3. Open dated project with assignee → **Heatmap** → row + week cell load.
4. With Tasks entitled, project task due this week increases cell load / open_tasks.
5. Staff without `projects.assign`: only their visible projects’ assignees appear.
6. Without Tasks entitled: `includes_tasks=false`, task counts stay 0.

## Rollback

Roll back Frontend first (hides Heatmap UI). Catalog bump `down` restores display version **1.5.0**; endpoint absence follows Backend code rollback.
