# AI Contract triage tools (ai 1.17.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-27 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** (confirm UI is tool-agnostic); Playwright AI suite extended with API propose→confirm |
| **Scope** | Ask EloSync Contract tools: `get_contract`, confirmed writes `update_contract_status` / `assign_contract` / `add_contract_note`; catalog **ai 1.16.0 → 1.17.0** |
| **Companion** | [AI deployment](./ai) · [AI Leave triage](./ai-leave-triage-production-readiness) · [AI Quotation triage](./ai-quotation-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Contracts](/user-guide/contracts) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one contract (by UUID; payload includes `title` — contracts have **no** `number` field). Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status confirm routes: **Sent** → `ContractService::send()` (issues acceptance token); **Active** from **Sent** → `accept()`; other targets (including Draft→Active without signature) → `changeStatus`. Status visibility uses `AiToolAnyOfPermissions` (`contracts.update` | `contracts.send` | `contracts.accept`). Assign uses `contracts.assign` + `EligibleOpportunityAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Contracts catalog bump, no Frontend/Mobile product-surface changes beyond Playwright coverage.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.17.0**, entitle `ai` + `contracts` (+ `opportunities`), staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID contract lookup; soft-deleted excluded | **Pass** |
| Payload uses `title` (no `number`) | **Pass** |
| Status propose/confirm: Sent→send / Active-from-Sent→accept / else update + `changeStatus` | **Pass** |
| Status tool visible with any of update/send/accept | **Pass** |
| Assign gated by `contracts.assign` + `EligibleOpportunityAssignee` (propose **and** confirm) | **Pass** |
| Note gated by `contracts.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Catalog migrate-only `ai` **1.17.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Contracts cross-links, overview, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **Pass** — same-session API propose→confirm for status / note validation / assign |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tool: get one contract | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via send/accept/changeStatus semantics | Pass | — | — | Pass |
| `AiToolAnyOfPermissions` for status visibility | Pass | — | — | Pass |
| Catalog MINOR **ai 1.17.0** only (not contracts) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` (assignee-scoped unless `assign` / superadmin) | `get_contract` |
| Send for signature | `send` + `POST …/send` | `update_contract_status` → Sent via `send()` |
| Accept / activate from Sent | `accept` + `POST …/accept` | `update_contract_status` → Active via `accept()` |
| Other status (Draft→Active, expire, terminate) | `update` + `POST …/status` | `update_contract_status` → `changeStatus` |
| Assign / unassign | `assign` | `assign_contract` + `EligibleOpportunityAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_contract_note` + confirm `max:5000` |

---

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `ai` → **1.17.0** (do **not** `db:seed`).
2. Entitle `ai` + `opportunities` + `contracts`.
3. Smoke: Ask EloSync fetch contract → propose status/assign/note → Confirm; Sent issues acceptance token.

## Rollback

Roll back the catalog bump migration (`down` → **1.16.0**). Tools remain in code but version claim reverts; no schema change.

## Monitoring

Unchanged from AI platform readiness (Nightwatch / logs on AI gateway + pending action confirm failures).
