# Automation create_project (1.4.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-29 |
| **Re-verified** | 2026-09-29 — Pest automation suite subset **11/11**; remediations B1/M1 closed |
| **Status** | **Go for production** (merge/deploy remaining) |
| **Scope** | Automation action `create_project` (requires Projects); template `opportunity_stage_create_project`; catalog **automation 1.3.0 → 1.4.0** |
| **Companion** | [Depth rollup](./automation-create-project-ai-company-2026-09-29-production-readiness) · [Automation developer guide](/developer-guide/automation) · [Projects deployment](./projects) · [CHANGELOG](/changelog/) |

---

## Executive summary

Workflows can create a Planned project from a trigger: title/description interpolation, `trigger_assignee`, optional start/end day offsets, soft `opportunity_id` / `company_id` / `contact_id` from the triggering record, and a note on opportunity/company/contact/lead. Builder config shipped in the SPA. Missing opportunity rows no longer invent an `opportunity_id` FK.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.4.0**.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Action registry + ActionRunner handler | **Pass** |
| Soft links + note on trigger | **Pass** (M1 closed) |
| Pest related-context + unit registry/templates | **Pass** (B1 companion expectations closed) |
| SPA Create Project action config | **Pass** |
| Catalog migrate-only **1.4.0** + CatalogSeeder | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `automation` → **1.4.0** (do **not** `db:seed`).
2. Entitle Automation + Projects; create a workflow with Create Project on `opportunity.stage_changed` (or apply template `opportunity_stage_create_project`); Manual Run or stage change; confirm project + opportunity note.
