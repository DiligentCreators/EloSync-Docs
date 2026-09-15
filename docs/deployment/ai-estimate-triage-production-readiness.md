# AI Estimate triage tools (ai 1.13.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-16 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Estimate tools: `get_estimate`, confirmed writes `update_estimate_status` / `assign_estimate` / `add_estimate_note`; catalog **ai 1.12.0 → 1.13.0** |
| **Companion** | [AI deployment](./ai) · [AI Lead assign + note](./ai-lead-assign-note-production-readiness) · [AI Invoice triage](./ai-invoice-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Estimates](/user-guide/estimates) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one estimate. Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status changes call `EstimateService::changeStatus` (same as HTTP `POST …/status`). Status auth mirrors the controller: Sent → `send`, Accepted → `accept`, else → `update`. Registry visibility for status uses `AiToolAnyOfPermissions` (`estimates.update` | `estimates.send` | `estimates.accept`). Assign uses `estimates.assign` + `EligibleEstimateAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No new Spatie permissions, no Estimates catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.13.0**, entitle `ai` + `estimates`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID estimate lookup; soft-deleted excluded | **Pass** |
| Status propose/confirm: target-dependent send/accept/update + `changeStatus` | **Pass** |
| Status tool visible with any of update/send/accept | **Pass** |
| Assign gated by `estimates.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `estimates.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Catalog migrate-only `ai` **1.13.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Estimates cross-links, overview, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tool: get one estimate | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Status via HTTP `/status` semantics | Pass | — | — | Pass |
| `AiToolAnyOfPermissions` for status visibility | Pass | — | — | Pass |
| Catalog MINOR **ai 1.13.0** only (not estimates) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` (assignee-scoped unless `assign` / superadmin) | `get_estimate` |
| Change status | target-dependent (`send` / `accept` / `update`) + `POST …/status` | `update_estimate_status` → `EstimateAiSupport::authorizeStatusChange` + `changeStatus` |
| Assign / unassign | `assign` | `assign_estimate` + `EligibleEstimateAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_estimate_note` + confirm `max:5000` |

---

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `ai` → **1.13.0** (do **not** `db:seed`).
2. Entitle `ai` + `estimates`.
3. Smoke: Ask EloSync fetch estimate → propose status/assign/note → Confirm.

## Rollback

Roll back the catalog bump migration (`down` → **1.12.0**). Tools remain in code but version claim reverts; no schema change.

## Monitoring

Unchanged from AI platform readiness (Nightwatch / logs on AI gateway + pending action confirm failures).
