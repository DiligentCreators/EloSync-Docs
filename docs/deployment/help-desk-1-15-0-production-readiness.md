# Help Desk 1.15.0 — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-08 |
| **Status** | **Go for production** |
| **Scope** | Customer reply reopens closed/resolved; `HelpDeskCustomerReplyNotification`; dedicated `email_notifications` keys; conversation UI polish (staff + portal) |
| **Catalog** | **help-desk 1.14.0 → 1.15.0** (paired with **customer-portal 1.3.0**) |
| **Companion** | [Customer Portal 1.3.0 readiness](./customer-portal-1-3-0-production-readiness) · [Help Desk developer guide](/developer-guide/help-desk) · [CHANGELOG](/changelog/) |

---

## Executive summary

Public customer replies (portal or email ingest) reopen **closed** and **resolved** tickets to **open** via system `reopenFromCustomerReply` (timeline: “Reopened by customer reply”). Assignees (fallback creator) receive in-app `help_desk.customer_reply` always; mail is optional via Settings → Notifications (`help_desk_customer_reply`, default off). Close/reopen mail no longer reuse `task_status` — they use `help_desk_closed` / `help_desk_reopened` (default off). Staff reopen from resolved also notifies.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Reopen closed + resolved only; open tickets unchanged | **Pass** |
| Staff internal notes do not reopen | **Pass** |
| In-app always; mail optional default off | **Pass** |
| Board realtime still fires on status change | **Pass** (existing StatusChanged broadcast) |
| Playwright headed Help Desk workflow | **Pass** — **3/3** |
| Playwright Customer Portal reopen path | **Pass** (portal workflow) |
| Pest reopen + preference gating + catalog bump | **Pass** |
| Docs + upgrade | **Pass** |

## Findings

### Accepted

| ID | Severity | Notes |
|----|----------|-------|
| R1 | Info | Customer reply + reopen may yield two notifications (`customer_reply` + `reopened`) — intentional |
| R2 | Ops | Migrate with Customer Portal **1.3.0**; deploy Frontend Settings toggles together |

## Operator checklist

1. `php artisan migrate --force` with Customer Portal **1.3.0** ship
2. Confirm `help-desk` **1.15.0**
3. Smoke: close ticket → portal reply → Open + database notification; mail toggles remain off until enabled

## Related

- [Customer Portal 1.3.0 readiness](./customer-portal-1-3-0-production-readiness.md)
- [Changelog](/changelog/)
