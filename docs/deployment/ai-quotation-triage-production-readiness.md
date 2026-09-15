# AI Quotation triage tools (ai 1.14.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-16 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Quotation tools: `get_quotation`, confirmed writes `update_quotation_status` / `assign_quotation` / `add_quotation_note`; catalog **ai 1.13.0 → 1.14.0** |
| **Companion** | [AI deployment](./ai) · [AI Estimate triage](./ai-estimate-triage-production-readiness) · [AI Lead assign + note](./ai-lead-assign-note-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Quotations](/user-guide/quotations) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one quotation (by UUID; payload includes `title` — quotations have **no** `number` field). Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status changes call `QuotationService::changeStatus` (same as HTTP `POST …/status`). Status auth mirrors the controller: Sent → `send`, Accepted → `accept`, else → `update`. Registry visibility for status uses `AiToolAnyOfPermissions` (`quotations.update` | `quotations.send` | `quotations.accept`). Assign uses `quotations.assign` + `EligibleOpportunityAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Quotations catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.14.0**, entitle `ai` + `quotations`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID quotation lookup; soft-deleted excluded | **Pass** |
| Payload uses `title` (no `number`) | **Pass** |
| Status propose/confirm: target-dependent send/accept/update + `changeStatus` | **Pass** |
| Status tool visible with any of update/send/accept | **Pass** |
| Assign gated by `quotations.assign` + `EligibleOpportunityAssignee` (propose **and** confirm) | **Pass** |
| Note gated by `quotations.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Catalog migrate-only `ai` **1.14.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Quotations cross-links, overview, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tool: get one quotation | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via HTTP `/status` semantics | Pass | — | — | Pass |
| `AiToolAnyOfPermissions` for status visibility | Pass | — | — | Pass |
| Catalog MINOR **ai 1.14.0** only (not quotations) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` (assignee-scoped unless `assign` / superadmin) | `get_quotation` |
| Change status | target-dependent (`send` / `accept` / `update`) + `POST …/status` | `update_quotation_status` → `QuotationAiSupport::authorizeStatusChange` + `changeStatus` |
| Assign / unassign | `assign` | `assign_quotation` + `EligibleOpportunityAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_quotation_note` + confirm `max:5000` |

---

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `ai` → **1.14.0** (do **not** `db:seed`).
2. Entitle `ai` + `quotations`.
3. Smoke: Ask EloSync fetch quotation → propose status/assign/note → Confirm.

## Rollback

Roll back the catalog bump migration (`down` → **1.13.0**). Tools remain in code but version claim reverts; no schema change.

## Monitoring

Unchanged from AI platform readiness (Nightwatch / logs on AI gateway + pending action confirm failures).
