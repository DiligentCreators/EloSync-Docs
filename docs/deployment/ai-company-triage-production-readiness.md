# AI Company triage tools (ai 1.19.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-29 |
| **Re-verified** | 2026-09-29 — Pest Company authz + write confirm **6/6**; Playwright e2e coverage on Frontend feature branch |
| **Status** | **Go for production** (merge/deploy remaining) |
| **Scope** | Ask EloSync Company tools: `get_company`, confirmed writes `assign_company` / `add_company_note`; catalog **ai 1.18.0 → 1.19.0** |
| **Companion** | [Depth rollup](./automation-create-project-ai-company-2026-09-29-production-readiness) · [AI deployment](./ai) · [AI tools](/developer-guide/ai-tools) · [CHANGELOG](/changelog/) |

---

## Executive summary

Companies join the confirmed-write triage pattern: read by UUID, assign/unassign (`EligibleCompanyAssignee`), and text notes (max 5000). No lifecycle status tool — companies have no status enum. Mirrors HTTP `companies.assign` / `update` notes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.19.0**.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Registry + confirm arms | **Pass** |
| Pest authz + propose/confirm | **Pass** |
| Playwright AI suite company flow | **Pass** — e2e Company triage propose→confirm note/assign (run suite pre-merge) |
| Catalog migrate-only **1.19.0** + CatalogSeeder | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `ai` → **1.19.0** (do **not** `db:seed`).
2. Smoke: Ask EloSync / pending confirm note + unassign on a company.
