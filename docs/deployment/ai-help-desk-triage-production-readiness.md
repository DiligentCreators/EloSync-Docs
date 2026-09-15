# AI Help Desk triage tools (ai 1.4.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Status** | **Eng Ready / Go** — remediation F1 closed; Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Help Desk tools: `get_help_desk_ticket`, confirmed writes `update_help_desk_ticket_status` / `assign_help_desk_ticket` / `add_help_desk_ticket_note`; catalog **ai 1.3.0 → 1.4.0** |
| **Companion** | [AI deployment](./ai) · [AI production readiness (platform)](./ai-production-readiness) · [AI workspace search](./ai-workspace-search-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. One read tool and three low-risk writes that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Status confirm reuses Help Desk close/reopen/update gates. Notes are text-only (no attachments). Confirm-time assign re-validates `EligibleHelpDeskAssignee` (closes TOCTOU if the user is suspended between propose and confirm). No new permissions, no Help Desk catalog bump, no Frontend/Mobile changes (confirm UI is tool-agnostic).

**Go / No-Go:** **Go** (engineering). Cutover: migrate-only catalog bump to **1.4.0**, entitle `ai` + `help-desk`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID ticket lookup; soft-deleted excluded | **Pass** |
| Status transition validated before propose | **Pass** |
| Status confirm mirrors controller close/reopen/update | **Pass** |
| Assign gated by `help-desk.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `help-desk.update` + policy `update` | **Pass** |
| Propose does not mutate | **Pass** |
| Catalog migrate-only `ai` **1.4.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry authz | **Pass** — **29/29** (`AiWriteConfirmationTest` 17 + `AiAuthorizationTest` 12, 2026-09-15) |
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

### Closed during audit

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| F1 | High | Confirm assign did not re-apply `EligibleHelpDeskAssignee` (TOCTOU if assignee suspended after propose) | **Fixed** — validate in `confirmAssignHelpDeskTicket`; Pest: reject confirm when assignee suspended |
| A1 | Low | Production readiness page thinner than ai 1.3.0 sibling | **Closed** — this audit expanded with findings, residuals, smoke, rollback |

### Accepted residual

| ID | Severity | Notes |
|----|----------|-------|
| R1 | Medium | No Pest yet for propose-time close denial, unassign (`null`), illegal transition, or soft-deleted UUID — logic present; prefer follow-up tests |
| R2 | Low | Status tool registry requires `help-desk.update` (parity with HTTP FormRequest); close-only roles cannot triage via AI |
| R3 | Ops | Platform AI still needs Central `ai_api_key` + adequate FPM timeouts (unchanged) |
| R4 | Low | AI user/API/tools pages remain thin in VitePress sidebars (pre-existing discoverability) |

---

## Done (engineering)

| Item | Result |
|------|--------|
| `GetHelpDeskTicketTool` + three write tools registered | **Pass** |
| `HelpDeskAiTicketSupport` UUID + status authz helper | **Pass** |
| `PendingAiActionService` confirm arms + assign eligibility | **Pass** |
| Migration `2026_09_15_040000_bump_ai_module_version_to_1_4_0` + CatalogSeeder | **Pass** |
| Docs same-PR surfaces | **Pass** |

### Test evidence

```bash
vendor/bin/pest tests/Feature/Tenant/Ai/AiWriteConfirmationTest.php   # 17 passed
vendor/bin/pest tests/Feature/Tenant/Ai/AiAuthorizationTest.php     # 12 passed
vendor/bin/pint --dirty --format agent
```

---

## Upgrade / staging smoke

After migrate (`2026_09_15_040000_bump_ai_module_version_to_1_4_0`):

1. Confirm central catalog `ai.version` = **1.4.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Help Desk** entitled; user has `ai.use`, `ai.confirm`, and Help Desk domain perms as needed.
3. Ask EloSync: list open tickets → fetch one by UUID from tool output.
4. Propose status → in progress → Confirm → ticket updated.
5. Propose assign → Confirm; propose note → Confirm.
6. User without `help-desk.assign` never gets assign tool; without `help-desk.close` cannot confirm resolve/close.
7. Optional: propose assign to a user, suspend them, Confirm → 422 and ticket unchanged.

See [Upgrade Guide](./upgrade#ai-help-desk-triage-tools-130--140) · [AI deployment](./ai).

---

## Operator remaining

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Merge Backend + Docs PRs | Eng | **Todo** |
| 2 | Deploy Backend; migrate catalog **ai → 1.4.0** | Ops | **Todo** |
| 3 | Staging smoke propose→confirm (status / assign / note) | Ops | **Todo** |

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.4.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).

---

## Monitoring

Unchanged from AI platform readiness: credit wallet / `ai_usage_events`, `ai.chat_completed`, HTTP **402** when credits exhausted. Help Desk domain events (`HelpDeskTicketStatusChanged` / `Assigned` / `NoteAdded`) still fire on confirm mutations.

---

## Verdict

**Go for production** after companion PR merge + migrate-first Backend deploy + staging smoke. No SPA/Mobile deploy required for this bump.
