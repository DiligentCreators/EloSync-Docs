# AI Credit Note triage tools (ai 1.15.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-16 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Credit Note tools: `get_credit_note`, confirmed writes `update_credit_note_status` / `assign_credit_note` / `add_credit_note_note`; catalog **ai 1.14.0 → 1.15.0** |
| **Companion** | [AI deployment](./ai) · [AI Quotation triage](./ai-quotation-triage-production-readiness) · [AI Payment triage](./ai-payment-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Credit Notes](/user-guide/credit-notes) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one credit note (UUID; payload includes number, title, amounts, linked invoice, assignee, latest note). Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status confirm calls **`CustomerCreditNoteService::issue()`** for Issued, **`apply()`** for Applied, **`void()`** for Void, and **`refund()`** for Refunded (Payment-style dedicated actions — not a generic `changeStatus`). Draft as a target is rejected. Status auth mirrors issue/apply/void/refund policies. Registry visibility for status uses `AiToolAnyOfPermissions` (`credit-notes.update` | `issue` | `apply` | `void` | `refund`). Assign uses `credit-notes.assign` + `EligibleCreditNoteAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Credit Notes catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.15.0**, entitle `ai` + `credit-notes` (requires Invoices), staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID credit note lookup; soft-deleted excluded | **Pass** |
| Status propose/confirm: Issued→`issue()`, Applied→`apply()`, Void→`void()`, Refunded→`refund()`; Draft target rejected | **Pass** |
| Status tool visible with any of update/issue/apply/void/refund | **Pass** |
| Assign gated by `credit-notes.assign` + `EligibleCreditNoteAssignee` (propose **and** confirm) | **Pass** |
| Note gated by `credit-notes.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Get payload exposes invoice link + `assigned_to` / `assignee_name` | **Pass** |
| Catalog migrate-only `ai` **1.15.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Credit Notes cross-links, overview, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tool: get one credit note | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via dedicated `issue()` / `apply()` / `void()` / `refund()` (not draft) | Pass | — | — | Pass |
| `AiToolAnyOfPermissions` for status visibility | Pass | — | — | Pass |
| Catalog MINOR **ai 1.15.0** only (not credit-notes) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` (assignee-scoped unless `assign` / superadmin) | `get_credit_note` |
| Issue | `issue` | `update_credit_note_status` → `issue()` |
| Apply | `apply` | `update_credit_note_status` → `apply()` |
| Void | `void` | `update_credit_note_status` → `void()` |
| Refund | `refund` | `update_credit_note_status` → `refund()` |
| Assign / unassign | `assign` | `assign_credit_note` + `EligibleCreditNoteAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_credit_note_note` + confirm `max:5000` |

---

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `ai` → **1.15.0** (do **not** `db:seed`).
2. Entitle `ai` + `credit-notes` (Invoices required).
3. Smoke: Ask EloSync fetch credit note → propose status/assign/note → Confirm; Issued needs `issue`; Draft target fails.

## Rollback

Roll back the catalog bump migration (`down` → **1.14.0**). Tools remain in code but version claim reverts; no schema change.

## Monitoring

Unchanged from AI platform readiness (Nightwatch / logs on AI gateway + pending action confirm failures).
