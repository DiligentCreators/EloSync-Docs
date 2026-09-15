# AI Project triage tools (ai 1.9.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Re-audited** | 2026-09-15 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Project tools: existing `get_project` / search / overdue plus confirmed writes `update_project_status` / `assign_project` / `add_project_note`; get payload `assigned_to` (user id) + `assignee_name`; catalog **ai 1.8.0 → 1.9.0** |
| **Companion** | [AI deployment](./ai) · [AI Expense triage](./ai-expense-triage-production-readiness) · [AI Purchase Order triage](./ai-purchase-order-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Projects](/user-guide/projects-overview) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one project (search + overdue kept). Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status changes call `ProjectService::changeStatus` (same as HTTP `POST …/status`) and require `projects.update`. Assign uses `projects.assign` + `EligibleProjectAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Projects catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.9.0**, entitle `ai` + `projects`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID project lookup; soft-deleted excluded | **Pass** |
| Status propose/confirm: `projects.update` + `changeStatus` | **Pass** |
| Assign gated by `projects.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `projects.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Get payload exposes `assigned_to` (id) + `assignee_name` | **Pass** |
| Catalog migrate-only `ai` **1.9.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Projects cross-links, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tools include get one + existing search/overdue | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via HTTP `/status` semantics (`changeStatus`) | Pass | — | — | Pass |
| Catalog MINOR **ai 1.9.0** only (not projects) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` | `get_project` |
| Change status | `update` + `POST …/status` | `update_project_status` → `ProjectService::changeStatus` |
| Assign / unassign | `assign` | `assign_project` + `EligibleProjectAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_project_note` + confirm `max:5000` |

---

## Upgrade / staging smoke

After migrate (`2026_09_15_090000_bump_ai_module_version_to_1_9_0`):

1. Confirm central catalog `ai.version` = **1.9.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Projects** entitled; user has `ai.use`, `ai.confirm`, and Project domain perms as needed.
3. Ask EloSync: fetch project → propose status/assign/note → Confirm.
4. View-only never gets writes; assign without `projects.assign` is excluded from the registry.

See [Upgrade Guide](./upgrade#ai-project-triage-tools-180--190) · [AI deployment](./ai).

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.9.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).
