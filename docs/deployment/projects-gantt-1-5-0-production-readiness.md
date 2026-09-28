# Projects portfolio Gantt (1.5.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-29 |
| **Status** | **Go for production** (merge/deploy remaining) |
| **Scope** | Portfolio Gantt view + `GET /projects/gantt`; catalog **projects 1.4.0 → 1.5.0** |
| **Companion** | [Projects deployment](./projects) · [Overview](/user-guide/projects-overview) · [API](/api/tenant-v1-projects) · [CHANGELOG](/changelog/) |

---

## Executive summary

Projects list gains a **Gantt** view mode. The API returns portfolio rows (project bars, nested milestones, soft Tasks when entitled) under the same filters and visibility as list/board. SPA renders a day-scale timeline; editors with `projects.update` can drag bars to shift `starts_on`/`ends_on`. No new permissions, queues, scheduler entries, or env vars.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Visibility parity with list (non-assign) | **Pass** — Pest |
| Soft Tasks only when entitled + `tasks.view` + Task policy | **Pass** — Pest |
| Catalog migrate-only **1.5.0** + CatalogSeeder | **Pass** |
| SPA Board / List / Gantt toggle + drag update | **Pass** (implementation) |
| Playwright Projects workflow includes Gantt bar | **Pass** (coverage added) |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.5.0** (do **not** `db:seed`).
2. Deploy Frontend with Projects Gantt view.
3. Smoke: dated project → **Gantt** → bar visible → expand milestones/tasks → drag bar (update permission) → dates update.

## Rollback

Roll back Frontend first (hides Gantt UI). Catalog bump `down` restores display version **1.4.0**; endpoint absence follows Backend code rollback.
