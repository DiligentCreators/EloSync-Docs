# AI Help Desk triage tools (ai 1.4.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Status** | **Go for production** — audit remediations closed; Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Help Desk tools: `get_help_desk_ticket`, confirmed writes `update_help_desk_ticket_status` / `assign_help_desk_ticket` / `add_help_desk_ticket_note`; catalog **ai 1.3.0 → 1.4.0** |
| **Companion** | [AI deployment](./ai) · [AI production readiness (platform)](./ai-production-readiness) · [AI workspace search](./ai-workspace-search-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. One read tool and three low-risk writes that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status confirm reuses Help Desk close/reopen/update gates. Notes are text-only with confirm-time `max:5000`. Confirm-time assign re-validates `EligibleHelpDeskAssignee`. No new permissions, no Help Desk catalog bump, no Frontend/Mobile changes (confirm UI is tool-agnostic).

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.4.0**, entitle `ai` + `help-desk`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID ticket lookup; soft-deleted excluded | **Pass** |
| Status transition validated before propose | **Pass** |
| Status confirm mirrors controller close/reopen/update | **Pass** |
| Assign gated by `help-desk.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `help-desk.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Catalog migrate-only `ai` **1.4.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Help Desk cross-links, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry authz | **Pass** — **34/34** (`AiWriteConfirmationTest` 22 + `AiAuthorizationTest` 12) |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Four tools only (no Help Desk Copilot) | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Registry `update` for status visibility; close/reopen at propose+confirm | Pass | — | — | Pass |
| Catalog MINOR **ai 1.4.0** only (not help-desk) | Pass | — | — | Pass |

---

## Findings

### Closed (audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| F1 | High | Confirm assign skipped `EligibleHelpDeskAssignee` (TOCTOU) | Validate on confirm; Pest when assignee suspended |
| F5 | Low | Confirm note did not re-check `max:5000` | Validator on confirm; Pest oversized body → 422 |
| R1 | Medium | Missing Pest for propose-close deny, unassign, illegal transition, soft-delete | Five residual Pest cases |
| A1 | Low | Thin readiness page vs ai 1.3.0 sibling | This audit expanded |
| R4 | Low | AI pages missing from VitePress sidebars | User/API/dev AI entries + Help Desk cross-links |

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| R2 | Info | Status tool registry requires `help-desk.update` — **parity** with `ChangeHelpDeskTicketStatusRequest` |
| R3 | Ops | Platform AI still needs Central `ai_api_key` + adequate FPM timeouts (unchanged) |

---

## Done (engineering)

| Item | Result |
|------|--------|
| Tools + confirm path + assign eligibility + note max | **Pass** |
| Migration + CatalogSeeder **ai 1.4.0** | **Pass** |
| Docs same-PR + sidebar discoverability | **Pass** |

### Test evidence

```bash
vendor/bin/pest tests/Feature/Tenant/Ai/AiWriteConfirmationTest.php   # 22 passed
vendor/bin/pest tests/Feature/Tenant/Ai/AiAuthorizationTest.php     # 12 passed
vendor/bin/pint --dirty --format agent
```

---

## Upgrade / staging smoke

After migrate (`2026_09_15_040000_bump_ai_module_version_to_1_4_0`):

1. Confirm central catalog `ai.version` = **1.4.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Help Desk** entitled; user has `ai.use`, `ai.confirm`, and Help Desk domain perms as needed.
3. Ask EloSync: list open tickets → fetch one → propose status/assign/note → Confirm.
4. User without `help-desk.assign` never gets assign tool; without `help-desk.close` cannot propose or confirm resolve/close.
5. Optional: propose assign, suspend assignee, Confirm → 422.

See [Upgrade Guide](./upgrade#ai-help-desk-triage-tools-130--140) · [AI deployment](./ai).

---

## Operator remaining

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Merge Backend + Docs remediation PRs (if not already on `main`) | Eng | **Todo** |
| 2 | Deploy Backend; migrate catalog **ai → 1.4.0** | Ops | **Todo** |
| 3 | Staging smoke propose→confirm | Ops | **Todo** |

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.4.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).

---

## Monitoring

Unchanged from AI platform readiness: credit wallet / `ai_usage_events`, `ai.chat_completed`, HTTP **402** when credits exhausted. Help Desk domain events still fire on confirm mutations.

---

## Verdict

**Go for production** after remediation merge (if needed) + migrate-first Backend deploy + staging smoke. No SPA/Mobile deploy required. All fixable audit findings closed; R2/R3 are intentional parity / ops.
