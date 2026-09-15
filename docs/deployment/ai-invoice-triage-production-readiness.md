# AI Invoice triage tools (ai 1.7.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Re-audited** | 2026-09-15 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Invoice tools: `get_invoice`, confirmed writes `update_invoice_status` / `assign_invoice` / `add_invoice_note`; overdue list assignee id enrichment; catalog **ai 1.6.0 → 1.7.0** |
| **Companion** | [AI deployment](./ai) · [AI production readiness (platform)](./ai-production-readiness) · [AI Opportunity triage](./ai-opportunity-triage-production-readiness) · [AI Task triage](./ai-task-triage-production-readiness) · [AI Help Desk triage](./ai-help-desk-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Invoices](/user-guide/invoices) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one invoice (existing overdue list + balance summary kept). Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status changes call `CustomerInvoiceService::changeStatus` (same as HTTP `POST …/status`: Cancelled routes through `void()`; Draft→Unpaid does **not** call `send()`, so no send-only accrual/issue_date side effects). Status auth mirrors the controller: Unpaid → `send`, Cancelled → `void`, else → `update`. Registry visibility for status uses `AiToolAnyOfPermissions` (`invoices.update` | `invoices.send` | `invoices.void`). Assign uses `invoices.assign` + `EligibleInvoiceAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Invoices catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.7.0**, entitle `ai` + `invoices`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID invoice lookup; soft-deleted excluded | **Pass** |
| Status propose/confirm: target-dependent send/void/update + `changeStatus` | **Pass** |
| Status tool visible with any of update/send/void | **Pass** |
| Assign gated by `invoices.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `invoices.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Overdue rows expose `assigned_to` (id) + `assignee_name` | **Pass** |
| Catalog migrate-only `ai` **1.7.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Invoices cross-links, overview, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry + read overdue assignee fields | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tools include get one + existing overdue/balance | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via HTTP `/status` semantics (not dedicated `/send`) | Pass | — | — | Pass |
| `AiToolAnyOfPermissions` for status visibility | Pass | — | — | Pass |
| Catalog MINOR **ai 1.7.0** only (not invoices) | Pass | — | — | Pass |

---

## Findings

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| A1 | Info | Draft→Unpaid via AI uses `changeStatus` + `send` permission, matching HTTP `POST …/status`, not `send()` (no accrual/PDF warm). Documented for operators and users. |
| A2 | Ops | Platform AI still needs Central `ai_api_key` + adequate FPM timeouts (unchanged from AI platform readiness). |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` (assignee-scoped unless `assign` / superadmin) | `get_invoice` |
| List overdue / balance | `view` | `get_overdue_invoices`, `get_invoice_balance_summary` |
| Change status | target-dependent (`send` / `void` / `update`) + `POST …/status` | `update_invoice_status` → `InvoiceAiSupport::authorizeStatusChange` + `changeStatus` |
| Assign / unassign | `assign` | `assign_invoice` + `EligibleInvoiceAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_invoice_note` + confirm `max:5000` |

---

## Code review notes

| Check | Result |
|-------|--------|
| `InvoiceAiSupport::resolveByUuid` excludes `deleted_at` | Pass |
| Writes return `pending_confirmation`; mutation only in confirm arms | Pass |
| Confirm injects `CustomerInvoiceService` (`changeStatus` / `assign` / `addNote`) | Pass |
| Registry: overdue → balance → get → status/assign/note | Pass |
| Risk `ReadOnly` / `LowRiskWrite`; never Destructive | Pass |

---

## Done (engineering)

| Item | Result |
|------|--------|
| Support helper + get/status/assign/note + overdue assignee ids + confirm path | **Pass** |
| Migration + CatalogSeeder **ai 1.7.0** | **Pass** |
| Docs same-PR + sidebar discoverability | **Pass** |
| Pest (AI write/authz/read) | **Pass** |

### Test evidence

```bash
vendor/bin/pest --compact --filter="invoice" tests/Feature/Tenant/Ai/
vendor/bin/pest --compact tests/Feature/Tenant/Ai/AiAuthorizationTest.php tests/Feature/Tenant/Ai/AiReadToolsTest.php tests/Feature/Tenant/Ai/AiWriteConfirmationTest.php
vendor/bin/pint --dirty --format agent
```

Result (2026-09-15): invoice filter **25** passed; full three AI suites **109** passed. Pint: passed.

---

## Upgrade / staging smoke

After migrate (`2026_09_15_070000_bump_ai_module_version_to_1_7_0`):

1. Confirm central catalog `ai.version` = **1.7.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Invoices** entitled; user has `ai.use`, `ai.confirm`, and Invoice domain perms as needed.
3. Ask EloSync: fetch invoice / overdue list → propose status/assign/note → Confirm.
4. Send-only staff can see status tool and Draft→Unpaid; void required for cancelled; view-only never gets writes.
5. Optional: propose assign, suspend assignee, Confirm → 422.
6. Optional: cancel with `amount_paid > 0` → 422 (ledger guard).

See [Upgrade Guide](./upgrade#ai-invoice-triage-tools-160--170) · [AI deployment](./ai).

---

## Operator remaining

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Merge Backend + Docs PRs (if not already on `main`) | Eng | **Todo** |
| 2 | Deploy Backend; migrate catalog **ai → 1.7.0** | Ops | **Todo** |
| 3 | Staging smoke (get / status / assign / note) | Ops | **Todo** |
| 4 | Confirm Central AI API key + FPM timeouts (A2) | Ops | **Todo** |

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.7.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).

---

## Monitoring

Unchanged from platform AI readiness (provider errors, pending-action expiry, confirm 403/422 rates).
