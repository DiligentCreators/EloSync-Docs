# AI Purchase Order triage tools (ai 1.10.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Re-audited** | 2026-09-15 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Purchase Order tools: `get_purchase_order` plus confirmed writes `update_purchase_order_status` / `assign_purchase_order` / `add_purchase_order_note`; get payload `assigned_to` (user id) + `assignee_name`; catalog **ai 1.9.0 → 1.10.0** |
| **Companion** | [AI deployment](./ai) · [AI Project triage](./ai-project-triage-production-readiness) · [AI Payment triage](./ai-payment-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Purchase Orders](/user-guide/purchase-orders-overview) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one purchase order. Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status changes call `PurchaseOrderService::changeStatus` (same as HTTP `POST …/status`). Status auth mirrors the controller: Sent→`send`, PartiallyReceived/Received→`receive`, Cancelled→`cancel`, else→`update`. Registry visibility for status uses `AiToolAnyOfPermissions` (`purchase-orders.update` | `send` | `receive` | `cancel`). Assign uses `purchase-orders.assign` + `EligiblePurchaseOrderAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Purchase Orders catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.10.0**, entitle `ai` + `purchase-orders`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID PO lookup; soft-deleted excluded | **Pass** |
| Status propose/confirm: target-dependent send/receive/cancel/update + `changeStatus` | **Pass** |
| Status tool visible with any of update/send/receive/cancel | **Pass** |
| Assign gated by `purchase-orders.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `purchase-orders.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Get payload exposes `assigned_to` (id) + `assignee_name` | **Pass** |
| Catalog migrate-only `ai` **1.10.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, PO cross-links, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tool `get_purchase_order` | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via HTTP `/status` semantics | Pass | — | — | Pass |
| `AiToolAnyOfPermissions` for status visibility | Pass | — | — | Pass |
| Catalog MINOR **ai 1.10.0** only (not purchase-orders) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` | `get_purchase_order` |
| Change status | target-dependent (`send` / `receive` / `cancel` / `update`) + `POST …/status` | `update_purchase_order_status` → `PurchaseOrderAiSupport::authorizeStatusChange` + `changeStatus` |
| Assign / unassign | `assign` | `assign_purchase_order` + eligible assignee at propose **and** confirm |
| Note (text) | `update` | `add_purchase_order_note` + confirm `max:5000` |

---

## Upgrade / staging smoke

After migrate (`2026_09_15_100000_bump_ai_module_version_to_1_10_0`):

1. Confirm central catalog `ai.version` = **1.10.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Purchase Orders** entitled; user has `ai.use`, `ai.confirm`, and PO domain perms as needed.
3. Ask EloSync: fetch PO → propose status/assign/note → Confirm.
4. Send-only can propose Draft→Sent; receive/cancel need matching perms; view-only never gets writes.

See [Upgrade Guide](./upgrade#ai-purchase-order-triage-tools-190--1100) · [AI deployment](./ai).

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.10.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).
