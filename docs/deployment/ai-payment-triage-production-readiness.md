# AI Payment triage tools (ai 1.11.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Re-audited** | 2026-09-15 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Payment tools: `get_payment` plus confirmed writes `update_payment_status` / `assign_payment` / `add_payment_note`; get payload `assigned_to` (user id) + `assignee_name`; catalog **ai 1.10.0 → 1.11.0** |
| **Companion** | [AI deployment](./ai) · [AI Purchase Order triage](./ai-purchase-order-triage-production-readiness) · [AI Lead assign + note](./ai-lead-assign-note-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Payments](/user-guide/payments-overview) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one payment. Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status confirm calls **`CustomerPaymentService::post()`** for Posted and **`void()`** for Void (not a generic `changeStatus`). Draft as a target is rejected. Status auth mirrors post/void policies. Registry visibility for status uses `AiToolAnyOfPermissions` (`payments.update` | `payments.post` | `payments.void`). Assign uses `payments.assign` + `EligiblePaymentAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Payments catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.11.0**, entitle `ai` + `payments`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID payment lookup; soft-deleted excluded | **Pass** |
| Status propose/confirm: Posted→`post()`, Void→`void()`; Draft target rejected | **Pass** |
| Status tool visible with any of update/post/void | **Pass** |
| Assign gated by `payments.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `payments.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Get payload exposes `assigned_to` (id) + `assignee_name` | **Pass** |
| Catalog migrate-only `ai` **1.11.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Payments cross-links, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tool `get_payment` | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via dedicated `post()` / `void()` (not draft) | Pass | — | — | Pass |
| `AiToolAnyOfPermissions` for status visibility | Pass | — | — | Pass |
| Catalog MINOR **ai 1.11.0** only (not payments) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` | `get_payment` |
| Post | `post` | `update_payment_status` → `post()` |
| Void | `void` | `update_payment_status` → `void()` |
| Assign / unassign | `assign` | `assign_payment` + eligible assignee at propose **and** confirm |
| Note (text) | `update` | `add_payment_note` + confirm `max:5000` |

---

## Upgrade / staging smoke

After migrate (`2026_09_15_110000_bump_ai_module_version_to_1_11_0`):

1. Confirm central catalog `ai.version` = **1.11.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Payments** entitled; user has `ai.use`, `ai.confirm`, and Payment domain perms as needed.
3. Ask EloSync: fetch payment → propose post/void/assign/note → Confirm.
4. Post-only can propose Posted; void needs `payments.void`; Draft target fails; view-only never gets writes.

See [Upgrade Guide](./upgrade#ai-payment-triage-tools-1100--1110) · [AI deployment](./ai).

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.11.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).
