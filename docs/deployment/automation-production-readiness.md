# Automation — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-13 |
| **Status** | Ready for merge / staging go-live (billable Marketplace add-on) |
| **Scope** | Automation module `automation` v1.0.0 |
| **Branch** | `feature/automation-module` |
| **Companion** | [Automation production](./automation) · [Developer guide](/developer-guide/automation) · [User guide](/user-guide/automation) |

---

## Executive summary

Automation is a **billable** Marketplace SKU (`$29/mo`, `$290/yr`). It is **not** default-included. Workspaces install from Marketplace after migrate; existing tenants are unchanged until they subscribe.

**Go / No-Go:** **Go** for staging → production after CI on companion PRs and the ops follow-ups below.

| Gate | Result |
|------|--------|
| Activation bypass closed (create inactive → `activate()`) | Pass |
| Outbound webhook SSRF + timeouts | Pass |
| Schedule 90s window + 2-minute dedup + cache lock | Pass |
| Run job `failed()` + per-run cache lock + `$timeout` 60s | Pass |
| Pest Automation suites | Pass (local) — confirm CI on Backend PR |
| Playwright `test:e2e:automation` | Pass (local) — confirm on staging |
| Docs + marketing SKU | Pass |

---

## Deploy order

1. **Backend** `php artisan migrate --force` (schema + catalog + permissions)
2. Update queue workers to include **`automations`** before `emails,default`
3. Confirm scheduler: `automation:dispatch-schedules` every minute (`withoutOverlapping(5)`, `onOneServer`)
4. Deploy **SPA** (Automation nav + builder)
5. Deploy **Docs** + **marketing site**
6. Staging smoke (below) before production traffic

Suggested merge order: **Backend → Frontend → Docs → Website**.

Optional env: `AUTOMATION_WEBHOOK_SECRET` (default HMAC when a webhook action omits its own secret).

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied on staging/prod (`automation_*` tables + catalog row + permission grants) | Ops | ☐ |
| 2 | Catalog shows `automation` published, billable, **not** default-included | Ops | ☐ |
| 3 | Queue daemon: `--queue=automations,emails,default --timeout=90` | Ops | ☐ |
| 4 | Scheduler runs `automation:dispatch-schedules`; shared Redis/cache for `onOneServer` | Ops | ☐ |
| 5 | `AUTOMATION_WEBHOOK_SECRET` set if default webhook HMAC is desired | Ops | ☐ |
| 6 | Frontend routes gated with `RequireAccess` (`module=automation`, `automation.view`) | QA | ☐ |
| 7 | Pest Automation suites green in CI | Eng | ☐ |
| 8 | Playwright `npm run test:e2e:automation` green on staging | QA | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Automation** (paid add-on; test gateway / entitled workspace)
2. Sidebar shows **Automation** for a role with `automation.view`
3. Templates → Use template → workflow opens **inactive**
4. Save & activate a **Manual** + Create task (or notification) workflow
5. **Run** → Runs page shows pending/running then completed or failed with logs
6. Pick an unwired trigger (Contact created) → **Save & activate** stays disabled / API 422; workflow remains inactive
7. Optional: schedule daily `H:i` in workspace timezone; wait for dispatcher; confirm a single run (no duplicates)

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA; Automation nav disappears until re-deploy |
| Backend code | Redeploy previous release; keep migrations (catalog insert is additive) |
| Module disable | Marketplace uninstall / cancel subscription (workflow rows retained) |
| Schema | Do **not** roll back Automation migrations in production without a data plan |

---

## Monitoring

- Run statuses: `pending` / `running` / `completed` / `failed` / `skipped` / `cancelled`
- `automation_logs` step detail; Nightwatch on `ExecuteAutomationRunJob` and `automation:dispatch-schedules`
- Failed jobs: `php artisan queue:failed` on the `automations` queue
- Platform audit + Spatie activity on workflow CRUD

---

## Accepted residual risk

| Item | Severity | Notes |
|------|----------|-------|
| DNS-rebinding to private IPs after hostname allow | Low | Literal private IPs and localhost are blocked; hostname resolve is best-effort |
| Unwired catalog triggers visible in builder | Info | Cannot activate; intentional stubs |
| Delay continuation uses the same run id | Info | Per-run cache lock waits then continues; do not use `ShouldBeUnique` on run id |
| Staff default role includes `automation.run` | Info | Same pattern as other module defaults; customize per workspace |

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** Ready for production opt-in after CI green and staging smoke.
