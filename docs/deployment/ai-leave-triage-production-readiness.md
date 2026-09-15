# AI Leave triage tools (ai 1.16.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-16 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Leave tools: `get_leave_request`, `get_pending_leave_requests`, confirmed writes `approve_leave_request` / `reject_leave_request`; catalog **ai 1.15.0 → 1.16.0** |
| **Companion** | [AI deployment](./ai) · [AI Credit Note triage](./ai-credit-note-triage-production-readiness) · [AI Quotation triage](./ai-quotation-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Leave Management](/user-guide/leave-management) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Reads: fetch one leave request or list pending. Writes: two low-risk tools that propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Approve/reject call `LeaveRequestService::approve` / `reject` (same as HTTP). Auth mirrors the controller via `LeaveAiSupport` + `LeaveRequestPolicy` (non-admins cannot self-approve). Reject requires `review_notes`; approve optionally takes `review_notes` / `deduct_salary` with the same override-notes rule as `ReviewLeaveRequestRequest`. No assign or timeline-note tools. No new Spatie permissions, no Leave catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.16.0** (after **1.15.0** Credit Note triage), entitle `ai` + `leave-management` (+ `employees`), staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID leave lookup; soft-deleted excluded | **Pass** |
| Pending list uses `status=pending` via `LeaveRequestService::paginate` | **Pass** |
| Approve/reject propose/confirm: `leave-management.approve` + policy | **Pass** |
| Self-approve blocked for non-admin | **Pass** |
| Reject requires review notes; deduct override requires notes | **Pass** |
| Propose does not mutate | **Pass** |
| Catalog migrate-only `ai` **1.16.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Leave cross-links, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Read tools: get one + pending list | Pass | — | — | Pass |
| Confirmed writes via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Approve/reject via HTTP semantics (not status enum tool) | Pass | — | — | Pass |
| No assign / timeline notes | Pass | — | — | Pass |
| Catalog MINOR **ai 1.16.0** only (not leave-management) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get one | `view` (self-scoped unless approve / admin) | `get_leave_request` |
| List pending | `viewAny` + service scoping | `get_pending_leave_requests` |
| Approve | `approve` + optional notes/deduct | `approve_leave_request` → `LeaveAiSupport` + `approve()` |
| Reject | `reject` + required notes | `reject_leave_request` → `LeaveAiSupport` + `reject()` |

---

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `ai` → **1.16.0** (requires prior **1.15.0**; do **not** `db:seed`).
2. Entitle `ai` + `employees` + `leave-management`.
3. Smoke: Ask EloSync list pending / fetch leave → propose approve or reject → Confirm.

## Rollback

Roll back the catalog bump migration (`down` → **1.15.0**). Tools remain in code but version claim reverts; no schema change.

## Monitoring

Unchanged from AI platform readiness (Nightwatch / logs on AI gateway + pending action confirm failures).
