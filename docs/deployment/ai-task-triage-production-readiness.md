# AI Task triage tools (ai 1.5.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Re-audited** | 2026-09-15 (remediations closed — staff complete/reopen parity) |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Task tools: `get_task`, confirmed writes `update_task_status` / `assign_task` / `add_task_note`; catalog **ai 1.4.0 → 1.5.0** |
| **Companion** | [AI deployment](./ai) · [AI production readiness (platform)](./ai-production-readiness) · [AI Help Desk triage](./ai-help-desk-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. One read tool and three low-risk writes that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status confirm reuses Task complete/reopen/update gates. `update_task_status` is visible with **`tasks.update` or `tasks.complete`** (`AiToolAnyOfPermissions`); complete/reopen still require `tasks.complete`, other statuses require `tasks.update`. Notes are text-only with confirm-time `max:5000`. Confirm-time assign re-validates `EligibleTaskAssignee`. No new Spatie permissions, no Tasks catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.5.0**, entitle `ai` (Tasks is default-included), staging smoke propose→confirm (owner/manager **and** complete-only staff).

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID task lookup; soft-deleted excluded | **Pass** |
| Status confirm mirrors controller complete/reopen/update | **Pass** |
| Staff with only `tasks.complete` can propose/confirm complete/reopen via AI | **Pass** |
| Complete-only staff cannot propose non-complete status changes | **Pass** |
| Assign gated by `tasks.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `tasks.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Catalog migrate-only `ai` **1.5.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Tasks cross-links, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry authz | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Four tools only (no Task Copilot) | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status tool any-of `update` **or** `complete`; authorize per target | Pass | — | — | Pass |
| No Task status transition graph (parity with TaskService) | Pass | — | — | Pass |
| Catalog MINOR **ai 1.5.0** only (not tasks) | Pass | — | — | Pass |

---

## Findings

### Closed (audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | Medium | Status tool required `tasks.update` only — staff with `tasks.complete` could HTTP complete/reopen but not via Ask EloSync | `AiToolAnyOfPermissions` + `UpdateTaskStatusTool` any-of `tasks.update`\|`tasks.complete`; adapter + registry; Pest complete-only propose/confirm + registry |
| R1 | Low | Reopen propose/confirm deny not covered | Pest: propose + confirm reopen without `tasks.complete` → deny |

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| A2 | Info | AI requires `tasks.complete` for complete/reopen; HTTP `PATCH` can set `status=completed` with only `tasks.update`. AI remains stricter on that path — intentional. |
| A3 | Info | `cancelled` uses `update` auth (no special perm) — matches HTTP `PATCH`. |
| A4 | Info | Confirm assign returns `assignee_name` from `TaskService::update` → `fresh(['assignee', …])` — OK. |
| A5 | Ops | Platform AI still needs Central `ai_api_key` + adequate FPM timeouts (unchanged from AI platform readiness). |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` | `get_task` |
| Status (non-complete) | `update` | `update_task_status` → `authorizeStatusChange` → `update` |
| Complete | `complete` | `update_task_status` (visible with update **or** complete) → `complete` |
| Reopen (completed→open) | `complete` | same → `complete` |
| Assign / unassign | `assign` | `assign_task` + `EligibleTaskAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_task_note` + confirm `max:5000` |

---

## Done (engineering)

| Item | Result |
|------|--------|
| `TaskAiSupport` + tools + confirm path + assign eligibility + note max | **Pass** |
| `AiToolAnyOfPermissions` + staff complete/reopen parity | **Pass** |
| Migration + CatalogSeeder **ai 1.5.0** | **Pass** |
| Docs same-PR + sidebar discoverability | **Pass** |
| Pest (complete deny, reopen deny, complete-only happy path, non-complete deny) | **Pass** |

### Test evidence

```bash
php artisan test --compact tests/Feature/Tenant/Ai/AiWriteConfirmationTest.php tests/Feature/Tenant/Ai/AiAuthorizationTest.php
vendor/bin/pint --dirty --format agent
```

---

## Upgrade / staging smoke

After migrate (`2026_09_15_050000_bump_ai_module_version_to_1_5_0`):

1. Confirm central catalog `ai.version` = **1.5.0** (do **not** `db:seed`).
2. Workspace has **AI** entitled; Tasks is default-included; user has `ai.use`, `ai.confirm`, and Task domain perms as needed.
3. Ask EloSync (manager): overdue / due-today → fetch → propose status/assign/note → Confirm.
4. Ask EloSync (staff with `tasks.complete` only): propose complete → Confirm; propose `in_progress` → denied.
5. User without `tasks.assign` never gets assign tool.
6. Optional: propose assign, suspend assignee, Confirm → 422.

See [Upgrade Guide](./upgrade#ai-task-triage-tools-140--150) · [AI deployment](./ai).

---

## Operator remaining

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Merge Backend + Docs PRs (if not already on `main`) | Eng | **Todo** |
| 2 | Deploy Backend; migrate catalog **ai → 1.5.0** | Ops | **Todo** |
| 3 | Staging smoke (manager + complete-only staff) | Ops | **Todo** |

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.5.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).

---

## Monitoring

Unchanged from AI platform readiness: credit wallet / `ai_usage_events`, `ai.chat_completed`, HTTP **402** when credits exhausted. Task domain events still fire on confirm mutations.

---

## Verdict

**Go for production** after migrate-first Backend deploy + staging smoke. All fixable audit findings (A1, R1) closed; A2–A5 remain intentional parity / ops.
