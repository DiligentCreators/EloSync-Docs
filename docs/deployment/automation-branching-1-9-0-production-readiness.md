# Automation if/else branches (1.9.0) — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-10-17 |
| **Re-verified** | 2026-10-17 — Pest workflow/engine/branch **26/26**; headed Playwright `test:e2e:automation:headed` **1/1** |
| **Status** | **Go for production** |
| **Scope** | Optional workflow branches. Shared actions still run. The first matching branch runs; one otherwise branch is the fallback. Catalog **automation 1.8.0 → 1.9.0** |
| **Companion** | [Automation deployment](./automation) · [CHANGELOG](/changelog/) |

---

## Executive summary

Existing workflows stay linear (`branch_id` null). New `automation_branches` rows hold if/else steps. Branch conditions do not gate dispatch. A delay stores the chosen action ids on the run so the continuation uses the same plan.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** — builder change only |
| Persist if/else + otherwise last | **Pass** (Pest) |
| Matching branch vs otherwise vs no match | **Pass** (Pest, webhook URLs) |
| Branch condition does not block dispatch | **Pass** (Pest) |
| Missing module on a branch action blocks activate | **Pass** (Pest) |
| Template `manual_priority_branch` | **Pass** (Pest) |
| Catalog migrate-only **1.9.0** | **Pass** |
| SPA Add branch validation, save, otherwise, reload | **Pass** (`test:e2e:automation:headed` **1/1**, 1.2m, one login session) |

## Upgrade & staging smoke

1. `php artisan migrate --force` — creates branches and bumps catalog to **1.9.0**.
2. Deploy the SPA and hard-refresh.
3. Restart Horizon (`automations` queue).
4. Save a workflow with one if branch and an otherwise branch. Run it with `priority` high, then again with another value.

## Rollback

Catalog `down` returns **1.8.0** and drops `branch_id` plus `automation_branches`. Do that only before any workspace saves a branch. Older workers ignore branch rows and run shared actions only if the schema is still present; after `down`, branched workflows lose their branch steps.
