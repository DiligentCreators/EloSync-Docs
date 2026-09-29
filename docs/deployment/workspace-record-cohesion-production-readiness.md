# Workspace record cohesion — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-29 |
| **Re-verified** | 2026-09-29 — residuals I1/I2/I3 remediated; Pest document filters (linkable + contact/company AND + invalid type); Email CRM Playwright + Mobile related hub |
| **Status** | **Go for production** (merge companion PRs → migrate → SPA → Mobile → Docs → staging smoke) |
| **Scope** | Contact/Company related hubs (opportunities, help desk, projects, documents); Email reading-pane CRM link/unlink UI; Documents reverse list filter (`linkable_*` + `contact_id`/`company_id`); party deep-link chips; Mobile related hub |
| **Branch** | `feature/workspace-record-cohesion` (Backend, Frontend, Docs, Mobile) |
| **Catalog** | **contacts 1.5.0 → 1.6.0**, **companies 1.2.0 → 1.3.0**, **documents 1.5.0 → 1.6.0**, **email 1.3.0 → 1.4.0** |
| **Companion** | [Contacts overview](/user-guide/contacts-overview) · [Companies overview](/user-guide/companies-overview) · [Email](/user-guide/email) · [Documents API](/api/tenant-v1-documents) · [CHANGELOG](/changelog/) · [Party billing readiness](/deployment/party-billing-production-readiness) |

---

## Executive summary

Existing Contact/Company party hubs expand beyond billing into **sales / ops / files**, Email exposes CRM links in the reading pane, Documents supports reverse filters (including party chips with AND semantics), and Mobile mirrors the related hub on contact/company records. No new Marketplace modules, permissions, queues, scheduler entries, or env vars. Platform freeze intact.

**Go / No-Go:** **Go** — all audit residuals closed for this cycle. Operator next: merge PRs, migrate catalog bumps, deploy Backend → Frontend → Mobile → Docs, staging smoke. Calendar Google/Outlook sync remains **product-deferred** (not an audit defect).

| Gate | Result |
|------|--------|
| Platform freeze (no shell/auth/billing redesign) | **Pass** |
| Contact/Company related hub module + `*.view` gates | **Pass** |
| Related lists reuse existing `contact_id` / `company_id` filters | **Pass** |
| Documents `linkable_type`/`linkable_id` + `contact_id`/`company_id` (AND) | **Pass** — Pest |
| Invalid `linkable_type` returns empty list | **Pass** — Pest |
| Email link/unlink authz (`email.update` + `view` on linkable) | **Pass** — Pest |
| Email `links` via `EmailMessageLinkResource` | **Pass** |
| Catalog migrate-only bumps + CatalogSeeder | **Pass** — Pest companion |
| SPA party chips on Opportunities / Help Desk / Projects / Documents | **Pass** |
| Playwright related-hub | **Pass** — `contacts.related-hub.spec.ts` |
| Playwright Email CRM links | **Pass** — `email.crm-links.spec.ts` (seeded inbox) |
| Mobile related hub on contact/company | **Pass** — `PartyRelatedHub` |
| Calendar sync | **N/A** (product deferred; not in scope) |

---

## Security summary

| Control | Status |
|---------|--------|
| No new Spatie permissions | Pass |
| Hub panels gated by `hasModule` + module `*.view` | Pass |
| Email link/unlink requires `email.update` + policy `view` on target record | Pass |
| Document list still `documents.view` / `viewAny`; filters only narrow by pivot | Pass |
| Linkable type allow-list (no arbitrary morph class from query) | Pass |
| Tenant isolation unchanged | Pass |

### Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **M1** | Medium | Email CRM links had no SPA UI | **Remediated** — `EmailCrmLinks` |
| **M2** | Medium | No reverse document discovery on party records | **Remediated** — filter + hub |
| **M3** | Medium | Missing party chips on Opportunities / Help Desk / Projects | **Remediated** |
| **L1** | Low | Email `links` raw FQCN | **Remediated** — `EmailMessageLinkResource` |
| **L2** | Low | No Contact related-hub Playwright | **Remediated** — `contacts.related-hub.spec.ts` |
| **I1** | Info | Email CRM Playwright missing | **Remediated** — `email.crm-links.spec.ts` + inbox seed helper |
| **I2** | Info | Mobile related hub missing | **Remediated** — `PartyRelatedHub` on contact/company |
| **I3** | Info | Documents dual `?contact=` + `?company=` ignored company | **Remediated** — API `contact_id`/`company_id` AND; SPA uses `partyFilterParams` |

No open High / Medium / Info residuals for ship (Calendar sync and follow-ups/import remain product backlog, not audit defects).

---

## Change inventory

### Backend

- `DocumentService::query` — `linkable_type`/`linkable_id` + `contact_id`/`company_id` (AND)
- Email link resources + eager `links.linkable`
- Catalog bump migration + CatalogSeeder
- Pest: linkable filter, contact+company AND, invalid type, email link/unlink, CatalogSeeder companion

### Frontend

- `CustomerPartyRelatedHub`; Email CRM links UI; party chips
- Documents list uses `partyFilterParams` (`contact_id`/`company_id`)
- Playwright: `contacts.related-hub`, `email.crm-links` (+ `seed-email-inbox-message`)

### Mobile

- `components/records/PartyRelatedHub.tsx` on contact/company view screens

### Docs

- User/developer/API/upgrade/roadmap/changelog + this audit

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_09_29_211500_bump_contacts_companies_documents_email_for_workspace_cohesion` | contacts **1.6.0**, companies **1.3.0**, documents **1.6.0**, email **1.4.0** |

Production: **migrate only**. Do **not** `db:seed` on upgrade.

---

## Deploy sequence (migrate-first)

1. Deploy **Backend** → `php artisan migrate --force`
2. Confirm catalog versions (table above)
3. Deploy **Frontend** SPA
4. Deploy **Mobile** (related hub)
5. Deploy **Docs**
6. Staging smoke (below)

No new env vars, queues, or scheduler entries.

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| Document Pest (linkable / contact+company / invalid type) | **Pass** | Re-verified locally |
| Email link/unlink Pest | **Pass** | |
| CatalogSeeder companion Pest | **Pass** | |
| Playwright `contacts.related-hub` | Spec ready | `npm run test:e2e:contacts` |
| Playwright `email.crm-links` | Spec ready | `npm run test:e2e:email` |

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied; catalog versions match | Ops | ☐ |
| 2 | Contact related hub + View all `?contact=` chips | QA | ☐ |
| 3 | Company hub + `?company=` | QA | ☐ |
| 4 | Documents list with both chips applies AND filter | QA | ☐ |
| 5 | Email CRM link/unlink Contact in reading pane | QA | ☐ |
| 6 | Mobile contact/company shows related sections when modules entitled | QA | ☐ |
| 7 | Pest + Playwright suites green in CI | Eng | ☐ |

---

## Staging smoke (minimum)

1. Entitle Contacts + Companies + Opportunities + Help Desk + Projects + Documents (+ Storage) + Email.
2. Contact with linked opportunity/ticket/project/document → related sections + deep links.
3. Email: link Contact → chip → unlink.
4. `/documents?contact={id}&company={id}` → only docs linked to **both**.
5. Mobile: open same contact → related rows navigate.

---

## Residual risks / follow-ups (product backlog — not ship blockers)

1. Calendar Google/Outlook sync (deferred by product).
2. Contact/Company follow-ups / import-export.
3. Mobile Email CRM link/unlink UI (web Email CRM shipped; mobile inbox still read-focused).

---

## Verdict

**Go** — audit residuals **I1/I2/I3** remediated; production-ready after migrate-first deploy and staging smoke.
