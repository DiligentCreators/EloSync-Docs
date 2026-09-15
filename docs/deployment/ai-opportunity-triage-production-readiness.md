# AI Opportunity triage tools (ai 1.6.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Re-audited** | 2026-09-15 (all code-fixable findings closed) |
| **Status** | **Go for production** — remediations closed; Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Opportunity tools: `get_opportunity`, `get_opportunity_stages`, confirmed writes `update_opportunity_stage` / `assign_opportunity` / `add_opportunity_note`; catalog **ai 1.5.0 → 1.6.0** |
| **Companion** | [AI deployment](./ai) · [AI production readiness (platform)](./ai-production-readiness) · [AI Task triage](./ai-task-triage-production-readiness) · [AI Help Desk triage](./ai-help-desk-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Opportunities](/user-guide/opportunities) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one deal + list pipeline stages. Writes: three low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Stage changes use integer `stage_id` (HTTP `POST …/stage` parity, tenant-scoped exists). Assign uses `opportunities.assign` + `EligibleOpportunityAssignee` at propose **and** confirm. Notes are text-only with confirm-time `max:5000`. No `AiToolAnyOfPermissions` (Opportunities has no complete/close permission). No new Spatie permissions, no Opportunities catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.6.0**, entitle `ai` + `opportunities`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID opportunity lookup; soft-deleted excluded | **Pass** |
| Stage propose/confirm: `opportunities.update` + policy `update` + tenant stage exists | **Pass** |
| HTTP `POST …/stage` tenant-scopes `stage_id` (matches store/update) | **Pass** |
| `get_opportunity_stages` + search `stage_id` / assignee id | **Pass** |
| Assign gated by `opportunities.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `opportunities.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Catalog migrate-only `ai` **1.6.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Opportunities cross-links, overview, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry + HTTP cross-tenant stage | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tools include stages list + get one (Opportunity Copilot HTTP unchanged) | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Stage via `stage_id` integer (not slug/name) | Pass | — | — | Pass |
| No complete/close any-of permissions | Pass | — | — | Pass |
| Catalog MINOR **ai 1.6.0** only (not opportunities) | Pass | — | — | Pass |

---

## Findings

### Closed (audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| R1 | Low | Confirm-time deny without `opportunities.update` untested | Pest: confirm stage as view-only + `ai.confirm` → 403 |
| R2 | Low | Invalid `stage_id` untested | Pest: propose **and** confirm invalid id → validation; no mutation |
| D1 | Low | Opportunities overview / ops omitted Ask EloSync | Overview bullet + ops companion link |
| A2 | Medium | HTTP `ChangeOpportunityStageRequest` `exists` was not tenant-scoped | Tenant `where` like store/update; Pest cross-tenant stage → 422; AI `assertStageExists` also filters `tenant_id` |
| A3 | Medium | `search_opportunities` serialized stage/assignee as names only | Payload now includes `stage_id`, `assigned_to` (user id), `assignee_name`; `stage` name kept |
| A4 | Medium | No stages list tool | `get_opportunity_stages` (read-only, `opportunities.view`); stage write description points at it |
| T1 | Low | Stale HTTP Pest expected owner assign to 422 (owners are eligible outside Leads) | Assert suspended assignee → 422 instead |

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| A1 | Info | Won/Lost are stage flags; moving to Won/Lost uses the same `opportunities.update` gate as HTTP. Inventing a close permission would break API parity. |
| A5 | Ops | Platform AI still needs Central `ai_api_key` + adequate FPM timeouts (unchanged from AI platform readiness). |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| List stages | `GET /opportunity-stages` + `view` | `get_opportunity_stages` |
| Get one | `view` (assignee-scoped unless `assign` / superadmin) | `get_opportunity` |
| Change stage | `update` + `POST …/stage` (tenant-scoped `stage_id`) | `update_opportunity_stage` → permission + `Gate::update` + stage exists |
| Assign / unassign | `assign` | `assign_opportunity` + `EligibleOpportunityAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_opportunity_note` + confirm `max:5000` |

---

## Code review notes

| Check | Result |
|-------|--------|
| `OpportunityAiSupport::resolveByUuid` excludes `deleted_at` | Pass |
| Writes return `pending_confirmation`; mutation only in confirm arms | Pass |
| Confirm injects `OpportunityService` (`changeStage` / `assign` / `addNote`) | Pass |
| Registry: search → pipeline → stages → get → writes | Pass |
| Risk `ReadOnly` / `LowRiskWrite`; never Destructive | Pass |
| Opportunity Copilot HTTP endpoints unchanged | Pass |

---

## Done (engineering)

| Item | Result |
|------|--------|
| Support helper + get/stages/search ids + write tools + confirm path | **Pass** |
| Tenant-scoped HTTP + AI stage exists | **Pass** |
| Migration + CatalogSeeder **ai 1.6.0** | **Pass** |
| Docs same-PR + sidebar discoverability | **Pass** |
| Pest (AI write/authz/read + HTTP cross-tenant stage) | **Pass** |

### Test evidence

```bash
php artisan test --compact --filter="opportunity" tests/Feature/Tenant/Ai/AiWriteConfirmationTest.php tests/Feature/Tenant/Ai/AiAuthorizationTest.php tests/Feature/Tenant/Ai/AiReadToolsTest.php tests/Feature/Tenant/Opportunity/OpportunityTest.php
vendor/bin/pint --dirty --format agent
```

Result (2026-09-15): **42** passed. Pint: passed.

---

## Upgrade / staging smoke

After migrate (`2026_09_15_060000_bump_ai_module_version_to_1_6_0`):

1. Confirm central catalog `ai.version` = **1.6.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Opportunities** entitled; user has `ai.use`, `ai.confirm`, and Opportunity domain perms as needed.
3. Ask EloSync: list stages → fetch opportunity → propose stage/assign/note → Confirm.
4. User without `opportunities.assign` never gets assign tool; view-only never gets stage/note writes (still gets `get_opportunity_stages`).
5. Optional: propose assign, suspend assignee, Confirm → 422.
6. Optional: propose invalid stage id → validation error; no mutation.

See [Upgrade Guide](./upgrade#ai-opportunity-triage-tools-150--160) · [AI deployment](./ai).

---

## Operator remaining

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Merge Backend + Docs PRs (if not already on `main`) | Eng | **Todo** |
| 2 | Deploy Backend; migrate catalog **ai → 1.6.0** | Ops | **Todo** |
| 3 | Staging smoke (stages / stage / assign / note) | Ops | **Todo** |
| 4 | Confirm Central AI API key + FPM timeouts (A5) | Ops | **Todo** |

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.6.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).

---

## Monitoring

Unchanged from AI platform readiness: credit wallet / `ai_usage_events`, `ai.chat_completed`, HTTP **402** when credits exhausted. Opportunity domain events still fire on confirm mutations (`opportunity_stage_changed`, `opportunity_assigned`, `opportunity_note_added`).

---

## Verdict

**Go for production** after migrate-first Backend deploy + staging smoke. All code-fixable findings closed (R1–R2, D1, A2–A4, T1). A1 remains HTTP authz parity; A5 is operator configuration.
