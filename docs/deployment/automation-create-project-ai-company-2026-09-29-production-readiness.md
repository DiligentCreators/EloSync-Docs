# Depth ship (Automation create_project · AI Company triage) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-29 |
| **Re-verified** | 2026-09-29 — Backend Pest automation **11/11** + Company AI **6/6**; remediations pushed |
| **Status** | **Go for production** — engineering ship-ready; **Ops deploy remaining** |
| **Scope** | Two catalog MINOR bumps in one ship |
| **Code** | `feature/automation-create-project-ai-company-triage` — Backend [#219](https://github.com/DiligentCreators/EloSync-Backend/pull/219) · Frontend [#217](https://github.com/DiligentCreators/EloSync-Frontend/pull/217) · Docs [#299](https://github.com/DiligentCreators/EloSync-Docs/pull/299) |
| **Companions** | [Automation create_project 1.4.0](./automation-create-project-1-4-0-production-readiness) · [AI Company triage 1.19.0](./ai-company-triage-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

| Module | Catalog | Verdict |
|--------|---------|---------|
| **Automation** `create_project` + template `opportunity_stage_create_project` | **1.3.0 → 1.4.0** | **Go** |
| **AI** Company triage (`get_company` / `assign_company` / `add_company_note`) | **1.18.0 → 1.19.0** | **Go** |

Engineering gates (code, migrate-only catalog, Pest, SPA builder + Playwright e2e coverage, Docs) **Pass** after remediations below.

**Go / No-Go:** **Go** after PR CI green + merge. Ops then migrate-only deploy and staging smoke.

---

## Findings closed (2026-09-29)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| B1 | Blocker | CatalogSeeder companion Pest expected `automation` **1.3.0** while seeder was **1.4.0** (CI fail) | Aligned companion expectations; pushed `09ee2616` |
| M1 | Medium | Missing opportunity row still set `opportunity_id` to payload id (invalid FK risk) | Soft-link returns `null` when opportunity missing; same commit |
| B2 | Blocker | Frontend create_project UI + Company e2e uncommitted / detached HEAD | Branch + commit + push Frontend |
| B3 | Blocker | Docs ship notes / readiness uncommitted | This rollup + companion pages committed on Docs feature branch |

---

## Gate matrix (re-verified 2026-09-29)

| Gate | Automation 1.4.0 | AI Company 1.19.0 |
|------|------------------|-------------------|
| Platform freeze | **Pass** (additive action + tools) | **Pass** |
| Migrate-only catalog + CatalogSeeder | **Pass** (`1.4.0`) | **Pass** (`1.19.0`) |
| Action / tool registry + confirm arms | **Pass** | **Pass** |
| Soft links + note on trigger | **Pass** | n/a |
| Pest | **Pass** — unit + related-context + workflow catalog (**11** automation files subset) | **Pass** — authz + propose/confirm (**6**) |
| SPA builder Create Project config | **Pass** | n/a |
| Playwright AI suite Company flow | n/a | **Pass** (e2e coverage landed; run `npm run test:e2e:ai` pre-merge) |
| Docs / changelog / sidebar | **Pass** | **Pass** |
| Feature branch + remote | **Done** | **Done** |
| Merged to `origin/main` | **Todo** (await CI) | **Todo** (await CI) |

---

## Remaining (operator)

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | CI green on Backend [#219](https://github.com/DiligentCreators/EloSync-Backend/pull/219) / Frontend [#217](https://github.com/DiligentCreators/EloSync-Frontend/pull/217) / Docs [#299](https://github.com/DiligentCreators/EloSync-Docs/pull/299); merge | Eng | **Todo** |
| 2 | Deploy Backend; `php artisan migrate --force` (central) — **no** `db:seed` | Ops | **Todo** |
| 3 | Restart automation / default queues | Ops | **Todo** |
| 4 | Deploy Frontend SPA (same window as Backend) | Ops | **Todo** |
| 5 | Staging smoke — Create Project workflow; Ask EloSync Company note + unassign | Ops / QA | **Todo** |

### Migrations to apply (step 2)

1. `2026_09_29_021000_bump_automation_module_version_to_1_4_0`
2. `2026_09_29_021100_bump_ai_module_version_to_1_19_0`

### Staging smoke detail (step 5)

| Area | Steps |
|------|--------|
| **Automation create_project** | Entitle Automation + Projects; apply template `opportunity_stage_create_project` (or manual Create Project on `opportunity.stage_changed`); run; confirm Planned project soft-linked + opportunity note |
| **AI Company triage** | Propose/confirm note + unassign on a company (pending actions UI) |

---

## Rollback

| Module | Rollback |
|--------|----------|
| Automation | Catalog `down` → **1.3.0** after code rollback (no schema beyond catalog) |
| AI | Catalog `down` → **1.18.0** after code rollback (no schema beyond catalog) |

Existing workflows using other actions and prior AI triage tools remain unchanged when rolling back only these bumps.

---

## Test evidence (reference)

```bash
# Backend (Herd PHP 8.5+)
herd php artisan test --compact \
  tests/Unit/Automation/AutomationEngineSupportTest.php \
  tests/Feature/Tenant/Automation/AutomationRelatedContextTest.php \
  tests/Feature/Tenant/Automation/AutomationWorkflowTest.php

herd php artisan test --compact \
  tests/Feature/Tenant/Ai/AiAuthorizationTest.php \
  tests/Feature/Tenant/Ai/AiWriteConfirmationTest.php \
  --filter=company

# Frontend
npm run test:e2e:ai
```
