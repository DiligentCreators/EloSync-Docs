# Newest-first notes & activity history — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-08-17 |
| **Status** | **Go for production** after companion CI green + staging smoke |
| **Scope** | Module detail **notes/comments** and domain **activities** (track history) return newest-first on `GET …/{id}` show payloads |
| **Branch** | `feature/newest-first-notes-activity` |
| **Backend** | `0cc0d2a` |
| **Frontend** | `8590aba1` |
| **Docs** | Companion changelog + module-development convention |

**Companion docs:** [Module development guide](/developer-guide/module-development-guide) · [Changelog](/changelog/) · [Leads deploy](/deployment/leads) · [Tasks deploy](/deployment/tasks)

---

## Executive summary

Detail sheets for Leads, Tasks, and other modules with threaded notes + domain timelines previously rendered embedded `notes` / `activities` **oldest-first** (unordered `HasMany` → DB insertion order). Dedicated `GET …/timeline` endpoints were already **DESC**. This ship aligns **show** relationships with timeline/Reseller:

```php
return $this->hasMany(…::class)->latest('created_at')->latest('id');
```

Applied to every module parent model’s notes (`notes` / `*Notes` / `noteEntries`) and `activities` relations, plus Lead `assignmentHistories`. SPA detail UIs map API order as-is (no client sort).

Does **not** redesign auth, tenancy, RBAC, or timeline APIs (platform freeze). No migrations. No catalog version bumps (ordering polish only).

**Go / No-Go:** **Go** — no security or data-integrity blockers; intentional exclusions documented.

| Gate | Result |
|------|--------|
| Relationship default order `created_at DESC, id DESC` on module notes + activities | **Pass** |
| Dedicated `GET …/timeline` already DESC (unchanged) | **Pass** |
| Lead assignment-history API already DESC; relation aligned | **Pass** |
| Feedback comments remain ASC (conversation thread) | **Pass** (intentional) |
| Follow-ups unchanged (due-date scheduling) | **Pass** (intentional) |
| `latestNote()` / `latestOfMany` list previews unchanged | **Pass** |
| Pest Lead + Task show newest-first | **Pass** (2 tests / 16 assertions) |
| Playwright Leads pipeline + Tasks workflow newest-first | **Pass** |
| Docs module-development convention + changelog | **Pass** |
| Migrations / catalog bumps | **N/A** — none required |

---

## Security summary

| Control | Status |
|---------|--------|
| No new endpoints or permission surface | Pass |
| Authz / module gates unchanged | Pass |
| Tenant isolation unchanged (same relations, different `ORDER BY`) | Pass |
| No secrets, tokens, or audit property exposure changes | Pass |
| Soft API contract: show collection order was never documented as ASC | Pass — product intent is newest-first |

### Findings

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **L1** | Low | Only Lead + Task Pest assert show order; other modules share the same relationship pattern | **Accepted** — pattern is identical; Leads/Tasks are the UI reference modules |
| **L2** | Low | Clients or scripts that assumed chronological ASC on show `notes`/`activities` will see reverse order | **Accepted** — intentional UX; timeline endpoints already DESC |
| **L3** | Low | Eager-loaded notes/activities still unbounded (same as before) | **Accepted** — no regression; pagination of timelines remains a future enhancement |
| **I1** | Info | Feedback ticket comments stay oldest-first | **Intentional** — chat-style thread |
| **I2** | Info | Lead follow-ups not reversed | **Intentional** — scheduling by due date |

No High or Medium open residuals.

---

## Change inventory

### Backend

- Models: Lead, Task, Contact, Company, Opportunity, Activity, Asset, Vendor, Product, Warehouse, KnowledgeBaseArticle, Project, Quotation, Contract, Estimate, Expense, HelpDeskTicket, PurchaseOrder, CustomerInvoice, CustomerPayment, CustomerCreditNote, Reseller (`noteEntries` dual `latest` tie-break).
- Tests: `LeadTest` / `TaskTest` — `returns notes and activities newest-first on show`.

### Frontend

- Playwright asserts newest note/comment first (Leads pipeline, Tasks workflow).
- E2E hardeners: Storage module for Lead Import; MentionComposer `pressSequentially`; offline/KPI wait resilience; integrations load wait.

### Docs

- Module development guide: notes + activities on show default newest-first.
- Changelog delivery note.

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| Pest `--filter="returns notes and activities newest-first on show"` | **Pass** | 2 passed, 16 assertions (re-verified 2026-08-17) |
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

- **No migrations.** Deploy Backend (relationship order) then Frontend (e2e-only product code; SPA already maps API order).
- Deploy Docs companion for operators/developers.
- No catalog / seeder / queue / env changes for this feature.
- Lead Import e2e locally still needs `queue:work` on `imports` and Storage entitlement — production import already requires those ops independently.

### Rollback

- Revert Backend commit restoring unordered `HasMany` (or pin previous release). No data migration to undo.
- Frontend can remain; UI will again show oldest-first if Backend rolls back alone.

---

## Sign-off

| Role | Decision | Date |
|------|----------|------|
| Engineering | **Go** | 2026-08-17 |
| Ops | ☐ Staging smoke | |
| Product | **Go** — newest-first notes/history accepted | 2026-08-17 |

**Current decision (2026-08-17):** **Go** — merge after CI green; complete staging smoke before production traffic.
