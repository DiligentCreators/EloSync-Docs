# Automation 1.1.1 — Related-context Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-09-08 |
| **Status** | **Go** — ready for staging → production after CI on companion PRs |
| **Scope** | Automation catalog **1.1.0 → 1.1.1** (related-context builder UX + semantic assignees + create_task link + Manual Run context) |
| **Companion** | [Automation production](./automation) · [v1.0.0 readiness](./automation-production-readiness) · [Developer guide](/developer-guide/automation) · [User guide](/user-guide/automation) |

---

## Executive summary

This PATCH closes the “ID console” gap and the residuals from the Conditional Go audit:

- Builders pick **people / tags / stages**; **`trigger_assignee`** for assignees/notify
- Multi-recipient notify; people pickers fall back to **you** when `users.list` is missing
- `create_task` links via note; **lead follow-up is opt-in** (`create_lead_follow_up`)
- **Manual Run** dialog loads related-record context for entity-bound workflows
- Catalog migrate **1.1.1** + CatalogSeeder sync; Playwright related-context chrome coverage

**Go / No-Go:** **Go** after CI green and staging smoke.

| Gate | Result |
|------|--------|
| Related-context pickers + `trigger_assignee` | Pass |
| Multi-notify + users.list fallback | Pass |
| Lead follow-up opt-in (default off; templates on) | Pass |
| Manual Run related-record payload | Pass |
| Backward-compatible numeric IDs | Pass |
| Catalog migrate + CatalogSeeder **1.1.1** | Pass |
| Docs + CHANGELOG + readiness | Pass |
| Pest related suites | Pass (local) |
| Playwright related-context chrome | Pass (added) |
| Queues / scheduler / SSRF / activation gate | Unchanged vs 1.1.0 — still required |

---

## Deploy order

1. **Backend** — `php artisan migrate --force` (`2026_09_08_011600_bump_automation_related_context_ux`)
2. Confirm catalog `automation` version **1.1.1** (migrate-only; no `db:seed`)
3. Deploy **SPA** (builder pickers + Manual Run dialog)
4. Deploy **Docs**
5. Staging smoke below

Suggested merge order: **Backend → Frontend → Docs**.

No new env vars. Queue `automations` + `automation:dispatch-schedules` remain mandatory.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migration applied; catalog `automation` = **1.1.1** | Ops | ☐ |
| 2 | Workers still include `automations`; scheduler runs `automation:dispatch-schedules` | Ops | ☐ |
| 3 | SPA shows pickers (no “User ID” / “Tag ID” / “Stage ID” labels) | QA | ☐ |
| 4 | Manual Run on a lead-triggered workflow requires a related lead | QA | ☐ |
| 5 | Pest Automation suites green in CI | Eng | ☐ |
| 6 | Playwright `npm run test:e2e:automation` green | QA | ☐ |
| 7 | Existing workflows with numeric `user_id` / `tag_id` / `stage_id` still execute | QA | ☐ |

---

## Staging smoke (1.1.1)

1. Marketplace Automation entitled; open builder — no raw ID labels; Notify multi-select visible
2. Template **New Lead Follow-up** → activate (template opts into lead follow-up)
3. Create a lead with an assignee → task + lead note + lead follow-up
4. Custom create_task **without** “Also create a lead follow-up” → task + note only
5. Manual **Run** on that workflow → pick a lead → run completes with related context
6. Schedule daily `H:i` in workspace timezone → one run in window
7. Unwired **Contact created** cannot Save & activate
8. Numeric ID configs on older workflows still run

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA |
| Backend code | Redeploy previous release; catalog version may remain **1.1.1** (display-only) |
| Schema | No new tables — bump-only migration |

---

## Accepted residual risk

| Item | Severity | Notes |
|------|----------|-------|
| Mobile builder | Info | Web-only builder unchanged |
| Invoice Manual Run picker | Info | Supported when invoice module entitled; soft-gated by list API |

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | | ☐ Ready |
| QA | | | ☐ Ready |
| Ops | | | ☐ Ready |

**Release decision:** Go for production opt-in after CI green and staging smoke.
