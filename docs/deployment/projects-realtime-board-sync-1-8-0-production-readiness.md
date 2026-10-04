# Projects real-time board sync (1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-05 |
| **Status** | **Go for production** |
| **Scope** | Private board channel `tenant.{id}.projects.board` + `ProjectCreated`/`ProjectUpdated`/`ProjectStatusChanged`/`ProjectAssigned`/`ProjectDeleted` broadcasts; SPA debounce-invalidate hook (Kanban only); catalog **projects 1.7.0 → 1.8.0** |
| **Companion** | [Projects developer guide](/developer-guide/projects) · [Projects overview](/user-guide/projects-overview) · [Help Desk 1.12.0 readiness](/deployment/help-desk-realtime-board-sync-1-12-0-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

The Projects status Kanban stays in sync across open tabs without a manual refresh, using the same refetch-on-signal pattern as Help Desk 1.12.0 / Tasks 1.8.0 (not Team Chat message patching). Gantt and Heatmap views do **not** join the channel.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (reuses `window.Echo`) | **Pass** |
| Channel auth: same tenant + `projects.view` | **Pass** |
| Cross-tenant isolation | **Pass** |
| Create / update / status / assign / unassign / delete broadcasts | **Pass** |
| Title-only update does not emit status_changed | **Pass** |
| Broadcast failures never break writes (`SafeRealtimeBroadcast`) | **Pass** |
| Domain events separate from `App\Events\Project\*Broadcast` | **Pass** |
| Catalog migrate-only **1.8.0** + CatalogSeeder | **Pass** |
| SPA hook board-only (~200ms debounce) | **Pass** |
| Pest | **Pass** — `ProjectRealtimeBoardTest` + `ProjectsModuleVersion180BumpTest` |

## Accepted

| ID | Notes |
|----|--------|
| R1 | Gantt/Heatmap do not subscribe (lower churn; refetch on view change) |
| R2 | Members-sync does not emit a dedicated board event; assignee changes still broadcast |
| R3 | No Reverb in CI; two-session smoke is staging |
| R4 | Playwright has no dedicated realtime spec (same as Help Desk / Tasks) |
| R5 | Payload is id-only; HTTP refetch remains visibility-scoped |

## Operator checklist

1. `php artisan migrate --force` (catalog only — **do not** `db:seed`)
2. Deploy SPA with `useProjectsBoardRealtime`
3. `php artisan reverb:restart` if Reverb is already up
4. Staging: two sessions on Projects **Board**

## Rollback

`php artisan migrate:rollback` on `2026_10_05_031200_bump_projects_module_to_1_8_0` restores catalog **1.7.0**. Redeploy previous SPA.
