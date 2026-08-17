# Newest-first notes & activity history — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Status** | **Go for production** after companion CI green + staging smoke |
| **Scope** | Module detail **notes/comments** and domain **activities** (track history) return newest-first on `GET …/{id}` show payloads |
| **Branch** | `feature/newest-first-notes-activity` |
| **Backend** | Relationship order + Pest coverage + `(tenant_id, parent_id, created_at)` indexes on notes / lead assignment histories |
| **Frontend** | Playwright newest-first asserts + Leads/Tasks e2e hardeners |
| **Docs** | API show contract + module-development convention + this audit |

**Companion docs:** [Module development guide](/developer-guide/module-development-guide) · [API Reference](/api/) · [Changelog](/changelog/) · [Leads deploy](/deployment/leads) · [Tasks deploy](/deployment/tasks)

---

## Executive summary

Detail sheets for Leads, Tasks, and other modules with threaded notes + domain timelines previously rendered embedded `notes` / `activities` **oldest-first** (unordered `HasMany` → DB insertion order). Dedicated `GET …/timeline` endpoints were already **DESC**. This ship aligns **show** relationships with timeline/Reseller:

```php
return $this->hasMany(…::class)->latest('created_at')->latest('id');
```

Applied to every module parent model’s notes (`notes` / `*Notes` / `noteEntries` / `helpDeskNotes` / …) and `activities` relations, plus Lead `assignmentHistories`. SPA detail UIs map API order as-is (no client sort).

Does **not** redesign auth, tenancy, RBAC, or timeline APIs (platform freeze). No catalog version bumps (ordering polish + indexes only).

**Go / No-Go:** **Go** — residuals from the initial audit are remediated; intentional exclusions remain documented.

| Gate | Result |
|------|--------|
| Relationship default order `created_at DESC, id DESC` on module notes + activities | **Pass** |
| Dedicated `GET …/timeline` already DESC (unchanged) | **Pass** |
| Lead assignment-history API already DESC; relation aligned | **Pass** |
| Feedback comments remain ASC (conversation thread) | **Pass** (intentional) |
| Follow-ups unchanged (due-date scheduling) | **Pass** (intentional) |
| `latestNote()` / `latestOfMany` list previews unchanged | **Pass** |
| Pest Lead + Task + Contact + Company + Opportunity show newest-first | **Pass** |
| Unit dataset: all parent models’ notes/activities relations order DESC | **Pass** (45 cases) |
| Composite indexes on notes + lead assignment histories for DESC order | **Pass** |
| API / module-development show contract documented newest-first | **Pass** |
| Playwright Leads pipeline + Tasks workflow newest-first | **Pass** |
| Catalog bumps | **N/A** — ordering polish; indexes are schema-only |

---

## Security summary

| Control | Status |
|---------|--------|
| No new endpoints or permission surface | Pass |
| Authz / module gates unchanged | Pass |
| Tenant isolation unchanged (same relations, different `ORDER BY`) | Pass |
| No secrets, tokens, or audit property exposure changes | Pass |
| Show collection order documented as newest-first (API contract) | Pass |

### Findings

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **L1** | Low | Only Lead + Task Pest asserted show order | **Remediated** — Contact/Company/Opportunity show tests + unit dataset covering all parent note/activity relations |
| **L2** | Low | Clients assuming chronological ASC on show | **Remediated** — API index + Tenant v1 show docs + module-development guide state newest-first as contract |
| **L3** | Low | Eager-loaded notes/activities unbounded | **Remediated (indexes)** — `(tenant_id, parent_id, created_at)` on all `*_notes` + `lead_assignment_histories`; activity tables already indexed. No hard `limit()` on `HasMany` (unsafe under multi-parent eager load; would hide history). Full show embed remains intentional; paginated `GET …/timeline` for large histories |
| **I1** | Info | Feedback ticket comments stay oldest-first | **Intentional** — chat-style thread |
| **I2** | Info | Lead follow-ups not reversed | **Intentional** — scheduling by due date |

No High or Medium open residuals.

---

## Change inventory

### Backend

- Models: Lead, Task, Contact, Company, Opportunity, Activity, Asset, Vendor, Product, Warehouse, KnowledgeBaseArticle, Project, Quotation, Contract, Estimate, Expense, HelpDeskTicket, PurchaseOrder, CustomerInvoice, CustomerPayment, CustomerCreditNote, Reseller (`noteEntries` dual `latest` tie-break).
- Migration: `add_newest_first_indexes_to_notes_and_activities_tables` — notes + lead assignment history indexes.
- Tests: Lead/Task/Contact/Company/Opportunity show newest-first; `NewestFirstNotesActivitiesTest` relation-order dataset.

### Frontend

- Playwright asserts newest note/comment first (Leads pipeline, Tasks workflow).
- E2E hardeners: Storage module for Lead Import; MentionComposer `pressSequentially`; offline/KPI wait resilience; integrations load wait.

### Docs

- Module development guide: newest-first contract + index / no-limit guidance.
- API Reference index + Tenant v1 show pages: newest-first documented.
- Changelog delivery note (remediation).

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| Pest `--filter="newest-first"` (Lead/Task/Contact/Company/Opportunity + unit relations) | **Pass** | 48 passed, 69 assertions (re-verified 2026-08-17) |
| Playwright `leads.pipeline` + `tasks.workflow` | **Pass** | Newest-first notes/comments + activity row order |
| Playwright Leads import / integrations / shortcuts / tags / tour | **Pass** | Companion e2e on same branch (queue worker required for import) |

---

## Staging smoke

1. Open a Lead with ≥2 notes → **Notes** tab: newest note first; **Activity** tab: newest event first (not “Lead created” at top after further actions).
2. Open a Task → **Comments**: add two comments → newest first; **Activity**: completed/note events above created.
3. Spot-check one non-Lead module with notes (e.g. Contact or Invoice) → same newest-first on show.
4. Confirm Feedback ticket comments still read oldest → newest (unchanged).
5. Confirm Lead follow-ups still ordered by product rules (not reversed as a chat feed).

---

## Deploy

- **Migrate** Backend (index migration) then deploy Backend (relationship order) then Frontend (e2e-only product code; SPA already maps API order).
- Deploy Docs companion for operators/developers.
- No catalog / seeder / queue / env changes for this feature.
- Lead Import e2e locally still needs `queue:work` on `imports` and Storage entitlement — production import already requires those ops independently.

### Rollback

- Revert Backend commits (relationship order + index migration `down`). No data rewrite to undo.
- Frontend can remain; UI will again show oldest-first if Backend relationship order rolls back alone.

---

## Sign-off

| Role | Decision | Date |
|------|----------|------|
| Engineering | **Go** | 2026-08-17 |
| Ops | ☐ Staging smoke | |
| Product | **Go** — newest-first notes/history accepted | 2026-08-17 |

**Current decision (2026-08-17):** **Go** — L1–L3 remediated; merge after CI green; complete staging smoke before production traffic.
