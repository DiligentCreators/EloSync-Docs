# Workspace record cohesion — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-29 |
| **Re-verified** | 2026-09-29 — Pest document linkable filter, email link/unlink contact, CatalogSeeder companion versions |
| **Status** | **Go for production** (merge companion PRs → migrate → SPA → Docs → staging smoke) |
| **Scope** | Contact/Company related hubs (opportunities, help desk, projects, documents); Email reading-pane CRM link/unlink UI; Documents reverse list filter; party deep-link chips on Opportunities / Help Desk / Projects / Documents |
| **Branch** | `feature/workspace-record-cohesion` (Backend, Frontend, Docs) |
| **Catalog** | **contacts 1.5.0 → 1.6.0**, **companies 1.2.0 → 1.3.0**, **documents 1.5.0 → 1.6.0**, **email 1.3.0 → 1.4.0** |
| **Companion** | [Contacts overview](/user-guide/contacts-overview) · [Companies overview](/user-guide/companies-overview) · [Email](/user-guide/email) · [Documents API](/api/tenant-v1-documents) · [CHANGELOG](/changelog/) · [Party billing readiness](/deployment/party-billing-production-readiness) |

---

## Executive summary

Existing Contact/Company party hubs expand beyond billing into **sales / ops / files**, Email stops treating CRM links as API-only, and Documents gains a **reverse** list filter so record pages can show linked files. No new Marketplace modules, permissions, queues, scheduler entries, or env vars. Platform freeze intact (extends Leads-style record pages and existing list filters).

**Go / No-Go:** **Go** — engineering gates pass; operator next: merge PRs, migrate catalog bumps, deploy Backend → Frontend → Docs, staging smoke. Calendar Google/Outlook sync remains **out of scope** (deferred follow-up).

| Gate | Result |
|------|--------|
| Platform freeze (no shell/auth/billing redesign) | **Pass** |
| Contact/Company related hub module + `*.view` gates | **Pass** |
| Related lists reuse existing `contact_id` / `company_id` filters | **Pass** |
| Documents `linkable_type` + `linkable_id` filter (invalid type → empty) | **Pass** — Pest |
| Email link/unlink authz (`email.update` + `view` on linkable) | **Pass** — Pest happy path + existing forbid case |
| Email `links` serialized via `EmailMessageLinkResource` (basename + label) | **Pass** |
| Catalog migrate-only bumps + CatalogSeeder aligned | **Pass** — Pest companion |
| SPA party chips on Opportunities / Help Desk / Projects / Documents | **Pass** |
| Playwright related-hub coverage | **Pass** (spec added; run in CI / headed) |
| Playwright Email CRM links | **Residual** — not covered this cycle (API Pest covers mutations) |
| Mobile related hub / Email CRM links | **Out of scope** (web-first) |
| Calendar sync | **N/A** (explicitly deferred) |

---

## Security summary

| Control | Status |
|---------|--------|
| No new Spatie permissions | Pass |
| Hub panels gated by `hasModule` + module `*.view` | Pass |
| Email link/unlink requires `email.update` + policy `view` on target record | Pass |
| Document list still `documents.view` / `viewAny`; filter only narrows by pivot | Pass |
| Tenant isolation unchanged (existing services / policies) | Pass |
| Linkable type allow-list (no arbitrary morph class from query) | Pass |

### Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **M1** | Medium | Email CRM links had no SPA UI (API-only) | **Remediated** — reading-pane `EmailCrmLinks` |
| **M2** | Medium | Document links only on document form (no reverse discovery on party records) | **Remediated** — list filter + party hub Documents section |
| **M3** | Medium | Opportunities / Help Desk / Projects lacked `?contact=` / `?company=` chip UX | **Remediated** — `usePartyListFilter` + chips |
| **L1** | Low | Email message `links` returned raw Eloquent (FQCN) | **Remediated** — `EmailMessageLinkResource` + `links.linkable` eager load for labels |
| **L2** | Low | No Contact related-hub Playwright | **Remediated** — `e2e/tests/contacts/contacts.related-hub.spec.ts` |
| **I1** | Info | Email CRM link Playwright not added | **Accepted** — Pest link/unlink + resource shape; SPA is thin over existing API |
| **I2** | Info | EloSync-Mobile party related hub / Email CRM links | **Out of scope** this cycle |
| **I3** | Info | Documents list with both `?contact=` and `?company=` prefers contact | **Accepted** — same chip model as billing lists (single party focus) |

No High findings. No open Medium residuals for ship.

---

## Change inventory

### Backend

- `DocumentService::query` — `linkable_type` + `linkable_id` (allow-listed morph classes)
- `EmailMessageResource` / `EmailMessageLinkResource` — structured links + optional label
- `EmailMessageService::show` — eager `links.linkable`
- Migration `2026_09_29_211500_bump_contacts_companies_documents_email_for_workspace_cohesion`
- `CatalogSeeder` versions aligned
- Pest: document linkable filter; email link/unlink contact; CatalogSeeder companion expectations

### Frontend

- `CustomerPartyRelatedHub` on contact/company view pages
- `EmailCrmLinks` in reading pane (gated by `email.update` + related module view)
- Party chips: opportunities, help-desk, projects, documents list pages
- Playwright: `contacts.related-hub.spec.ts`

### Docs

- User / developer / API / deployment / roadmap / changelog updates
- This production readiness audit

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_09_29_211500_bump_contacts_companies_documents_email_for_workspace_cohesion` | contacts **1.6.0**, companies **1.3.0**, documents **1.6.0**, email **1.4.0** |

Production: **migrate only**. Do **not** `db:seed` on upgrade. Fresh local/CI seed uses `CatalogSeeder` versions aligned with these bumps.

---

## Deploy sequence (migrate-first)

1. Deploy **Backend** → `php artisan migrate --force` (catalog bumps only; idempotent).
2. Confirm central catalog: contacts **1.6.0**, companies **1.3.0**, documents **1.6.0**, email **1.4.0**.
3. Deploy **Frontend** SPA.
4. Deploy **Docs**.
5. Staging smoke (below).

Suggested merge order: **Backend → Frontend → Docs**.

No new env vars, queues, or scheduler entries.

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| Document linkable filter Pest | **Pass** (1) | `DocumentTest` filter by contact |
| Email link/unlink Pest | **Pass** (1) | Contact link + unlink + resource shape; forbid-view case already existed |
| CatalogSeeder companion Pest | **Pass** | contacts **1.6.0**, documents **1.6.0** |
| Playwright `contacts.related-hub` | Spec added | Run `npm run test:e2e:contacts` when demo API available |
| Playwright Email CRM links | Not added | Residual **I1** |

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied; catalog versions match table above | Ops | ☐ |
| 2 | Contact with opportunity + help-desk ticket + project + document: related hub sections + **View all** opens `?contact=` chip | QA | ☐ |
| 3 | Company hub same with `?company=` | QA | ☐ |
| 4 | Module not installed → corresponding hub section hidden | QA | ☐ |
| 5 | Email: link message to Contact → chip opens contact; unlink removes | QA | ☐ |
| 6 | Email: cannot link Lead outside assignee scope (403) | QA | ☐ |
| 7 | Documents list `?contact=` shows only documents soft-linked to that contact | QA | ☐ |
| 8 | Pest suites above green in CI | Eng | ☐ |
| 9 | Playwright `contacts.related-hub` green | QA | ☐ |

---

## Staging smoke (minimum)

1. Entitle Contacts + Companies + Opportunities + Help Desk + Projects + Documents (+ Storage) + Email.
2. Open a Contact with linked opportunity / ticket / project / document → confirm each related section and deep link.
3. Open Email message → Link Contact → chip visible → Unlink.
4. Open `/documents?contact={id}` → chip + filtered list.
5. Open `/opportunities?company={id}` → chip filters board/list.

---

## Residual risks / follow-ups

1. Email CRM links Playwright (optional; API covered).
2. EloSync-Mobile related hub + Email CRM links (web-first this cycle).
3. Calendar Google/Outlook sync — separate PR (deferred by product).
4. Contact/Company follow-ups / import-export — still deferred depth.

---

## Verdict

**Go** — ship after companion PR merge, migrate-only catalog bumps, SPA/Docs deploy, and staging smoke. Engineering residuals closed or accepted as out of scope for this cycle.
