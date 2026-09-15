# AI Expense triage tools (ai 1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Re-audited** | 2026-09-15 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Expense tools: `get_expense`, confirmed writes `update_expense_status` / `assign_expense` / `add_expense_note`; pending-approval list assignee id enrichment; catalog **ai 1.7.0 → 1.8.0** |
| **Companion** | [AI deployment](./ai) · [AI production readiness (platform)](./ai-production-readiness) · [AI Invoice triage](./ai-invoice-triage-production-readiness) · [AI Opportunity triage](./ai-opportunity-triage-production-readiness) · [AI Task triage](./ai-task-triage-production-readiness) · [AI Help Desk triage](./ai-help-desk-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Expenses](/user-guide/expenses) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one expense (existing pending-approval list kept). Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status changes call `ExpenseService::changeStatus` (same as HTTP `POST …/status`: Paid routes through `pay([], …)` — when Accounting is entitled, `paid_from_account_id` must already be on the expense, same as HTTP status without dedicated `/pay` payload). Status auth mirrors the controller: Submitted→`submit`, Approved→`approve`, Rejected→`reject`, Paid→`pay`, Cancelled→`cancel`, else→`update`. Registry visibility for status uses `AiToolAnyOfPermissions` (`expenses.update` | `submit` | `approve` | `reject` | `pay` | `cancel`). Assign uses `expenses.assign` + `EligibleExpenseAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Expenses catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.8.0**, entitle `ai` + `expenses`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID expense lookup; soft-deleted excluded | **Pass** |
| Status propose/confirm: target-dependent workflow perms + `changeStatus` | **Pass** |
| Status tool visible with any of update/submit/approve/reject/pay/cancel | **Pass** |
| Assign gated by `expenses.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `expenses.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Pending-approval rows expose `assigned_to` (id) + `assignee_name` | **Pass** |
| Catalog migrate-only `ai` **1.8.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Expenses cross-links, overview, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry + read pending assignee fields | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tools include get one + existing pending approval | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via HTTP `/status` semantics (Paid → `pay([])`) | Pass | — | — | Pass |
| `AiToolAnyOfPermissions` for status visibility | Pass | — | — | Pass |
| Catalog MINOR **ai 1.8.0** only (not expenses) | Pass | — | — | Pass |

---

## Findings

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| A1 | Info | Paid via AI uses `changeStatus` → `pay([])`, matching HTTP `POST …/status`. When Accounting is entitled, set `paid_from_account_id` on the expense first (or use the dedicated **Mark as paid** UI with an account). Documented for operators and users. |
| A2 | Ops | Platform AI still needs Central `ai_api_key` + adequate FPM timeouts (unchanged from AI platform readiness). |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` (assignee-scoped unless `assign` / superadmin) | `get_expense` |
| List pending approval | `view` | `get_expense_pending_approval` |
| Change status | target-dependent (`submit` / `approve` / `reject` / `pay` / `cancel` / `update`) + `POST …/status` | `update_expense_status` → `ExpenseAiSupport::authorizeStatusChange` + `changeStatus` |
| Assign / unassign | `assign` | `assign_expense` + `EligibleExpenseAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_expense_note` + confirm `max:5000` |

---

## Code review notes

| Check | Result |
|-------|--------|
| `ExpenseAiSupport::resolveByUuid` excludes `deleted_at` | Pass |
| Writes return `pending_confirmation`; mutation only in confirm arms | Pass |
| Confirm injects `ExpenseService` (`changeStatus` / `assign` / `addNote`) | Pass |
| Registry: pending → get → status/assign/note | Pass |
| Risk `ReadOnly` / `LowRiskWrite`; never Destructive | Pass |

---

## Done (engineering)

| Item | Result |
|------|--------|
| Support helper + get/status/assign/note + pending assignee ids + confirm path | **Pass** |
| Migration + CatalogSeeder **ai 1.8.0** | **Pass** |
| Docs same-PR + sidebar discoverability | **Pass** |
| Pest (AI write/authz/read) | **Pass** |

### Test evidence

```bash
php artisan test --compact tests/Feature/Tenant/Ai/AiAuthorizationTest.php --filter="expense"
php artisan test --compact tests/Feature/Tenant/Ai/AiReadToolsTest.php --filter="expense"
php artisan test --compact tests/Feature/Tenant/Ai/AiWriteConfirmationTest.php --filter="expense"
vendor/bin/pint --dirty --format agent
```

Result (2026-09-15): expense filter **25** passed (5 + 4 + 16). Pint: passed.

---

## Upgrade / staging smoke

After migrate (`2026_09_15_080000_bump_ai_module_version_to_1_8_0`):

1. Confirm central catalog `ai.version` = **1.8.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Expenses** entitled; user has `ai.use`, `ai.confirm`, and Expense domain perms as needed.
3. Ask EloSync: fetch expense / pending approval list → propose status/assign/note → Confirm.
4. Approve-only staff can see status tool and approve submitted expenses; Draft→Approved fails transition; view-only never gets writes.
5. Optional: propose assign, suspend assignee, Confirm → 422.
6. Optional: Paid with Accounting entitled requires `paid_from_account_id` already on the expense (A1).

See [Upgrade Guide](./upgrade#ai-expense-triage-tools-170--180) · [AI deployment](./ai).

---

## Operator remaining

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Merge Backend + Docs PRs (if not already on `main`) | Eng | **Todo** |
| 2 | Deploy Backend; migrate catalog **ai → 1.8.0** | Ops | **Todo** |
| 3 | Staging smoke (get / status / assign / note) | Ops | **Todo** |
| 4 | Confirm Central AI API key + FPM timeouts (A2) | Ops | **Todo** |

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.8.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).

---

## Monitoring

Unchanged from platform AI readiness (provider errors, pending-action expiry, confirm 403/422 rates).
