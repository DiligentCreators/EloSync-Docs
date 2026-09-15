# AI Lead assign + note tools (ai 1.12.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-15 |
| **Re-audited** | 2026-09-15 |
| **Status** | **Go for production** — Backend + Docs; **no SPA/Mobile code** |
| **Scope** | Ask EloSync Lead writes: confirmed `assign_lead` / `add_lead_note` (status + Copilot already shipped); get/search payloads `assigned_to` (user id) + `assignee_name`; catalog **ai 1.11.0 → 1.12.0** |
| **Companion** | [AI deployment](./ai) · [AI Payment triage](./ai-payment-triage-production-readiness) · [AI Expense triage](./ai-expense-triage-production-readiness) · [AI tools](/developer-guide/ai-tools) · [Tenant AI API](/api/tenant-v1-ai) · [User guide](/user-guide/ai-assistant) · [Leads](/user-guide/leads-overview) · [CHANGELOG](/changelog/) |

---

## Executive summary

Additive AI tools depth on the existing `AIGateway` + `AIToolRegistry` + `PendingAiActionService` path. Existing Lead reads (`search_leads`, `get_lead`, stale/recent) and `update_lead_status` stay. New writes: assign/unassign and text note — both propose pending actions; mutations run only after `POST /ai/actions/{id}/confirm`. Assign uses `leads.assign` + `EligibleLeadAssignee` at propose **and** confirm (optional reason, max 500). Notes require `leads.update` with confirm-time `max:5000`. No new Spatie permissions, no Leads catalog bump, no Frontend/Mobile changes.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump to **1.12.0**, entitle `ai` + `leads`, staging smoke propose→confirm.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel AI stack) | **Pass** |
| UUID lead lookup; soft-deleted excluded | **Pass** |
| Assign gated by `leads.assign` + eligible assignee (propose **and** confirm) | **Pass** |
| Note gated by `leads.update` + policy `update` + body max 5000 on confirm | **Pass** |
| Propose does not mutate | **Pass** |
| Get/search expose `assigned_to` (id) + `assignee_name` | **Pass** |
| Catalog migrate-only `ai` **1.12.0** + CatalogSeeder sync | **Pass** |
| Docs (tools, API, user tip, Leads cross-links, ops, roadmap, changelog, upgrade, VitePress) | **Pass** |
| Pest write confirmation + registry | **Pass** |
| Playwright AI e2e | **N/A** — no SPA surface change |

---

## Locked-decision matrix

| Decision | Backend | Frontend | Mobile | Docs |
|----------|---------|----------|--------|------|
| Existing Lead reads + status write unchanged | Pass | — | — | Pass |
| Confirmed assign + note via existing pending actions | Pass | Pass (generic UI) | Pass (generic UI) | Pass |
| Catalog MINOR **ai 1.12.0** only (not leads) | Pass | — | — | Pass |

---

## Authz map (HTTP ↔ AI)

| Action | HTTP | AI tool / confirm |
|--------|------|-------------------|
| Get / search | `view` | `get_lead` / `search_leads` (existing) |
| Change status | `update` | `update_lead_status` (existing) |
| Assign / unassign | `assign` | `assign_lead` + `EligibleLeadAssignee` at propose **and** confirm |
| Note (text) | `update` | `add_lead_note` + confirm `max:5000` |

---

## Upgrade / staging smoke

After migrate (`2026_09_15_120000_bump_ai_module_version_to_1_12_0`):

1. Confirm central catalog `ai.version` = **1.12.0** (do **not** `db:seed`).
2. Workspace has **AI** + **Leads** entitled; user has `ai.use`, `ai.confirm`, and Lead domain perms as needed.
3. Ask EloSync: fetch lead → propose assign/note → Confirm (status still via existing `update_lead_status`).
4. Assign without `leads.assign` is excluded; view-only never gets writes.

See [Upgrade Guide](./upgrade#ai-lead-assign--note-tools-1110--1120) · [AI deployment](./ai).

---

## Rollback

Redeploy previous Backend release. Catalog version may remain **1.12.0** (display-only); tools disappear with the code rollback. Pending actions for removed tools fail confirm with unsupported tool — cancel or let expire (24h).
