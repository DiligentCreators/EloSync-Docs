# Contracts 1.1.0 — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-18 |
| **Status** | **Go** — Backend migrate before SPA |
| **Scope** | Tenant Contracts module `contracts` **1.0.0 → 1.1.0** (opportunity auto-fill + HTML description/notes) |
| **Branch** | `feature/billing-documents-discounts-and-terms` |
| **Companion** | [Contracts production](./contracts) · [Developer](/developer-guide/contracts) · [User](/user-guide/contracts) · [API](/api/tenant-v1-contracts) |

Additive MINOR on the existing contracts module. No new permissions, queues, scheduler entries, or env vars. Catalog bump does **not** auto-install for workspaces that never entitled Contracts.

This audit is **Contracts 1.1.0 only**. Billing document product-picker on the same branch is a separate [Go](./billing-product-line-picker-production-readiness).

---

## Executive summary

Selecting an **Opportunity** on create auto-fills title (when empty), party name (contact or company), value, currency, and an **eligible** assignee. A linked quotation is auto-selected only when that opportunity has exactly one quotation. New `description` plus existing `notes` are TipTap HTML, sanitized on save (`DocumentHtmlSanitizer`) and display (`sanitizeDocumentHtml`). Timeline comments stay plain text.

| Gate | Result |
|------|--------|
| `module:contracts` + `contracts.*` (no new family) | **Pass** |
| Tenant isolation + assignee scope | **Pass** |
| `LinkableQuotation` entitlement / same opportunity | **Pass** |
| HTML sanitizer on save + DOMPurify on Overview | **Pass** |
| Timeline comments remain plain text | **Pass** |
| End date on or after start (API + SPA) | **Pass** (F2) |
| Owner create from opportunity | **Pass** (F1 + F5) |
| Eligible picker matches payload | **Pass** (F5) |
| Catalog `1.1.0` migrate-only | **Pass** |
| Pest HTML + owner self-assign + end date | **Pass** |
| Playwright one-session contracts + sales | **Pass** (F4) |
| Docs + upgrade + this page | **Pass** (F3) |

**Go / No-Go:** **Go** after companion CI and `php artisan migrate --force` **before** the SPA that posts `description`.

---

## Findings

| ID | Severity | Status | Finding | Action |
|----|----------|--------|---------|--------|
| F1 | High | **Fixed** | Opportunity auto-fill copied `assigned_to` from the deal (workspace owner). `EligibleOpportunityAssignee` 422ed | `StoreContractRequest` allows the creating actor; Pest owner self-assign |
| F2 | Medium | **Fixed** | End date before start had no SPA error; no Pest for `after_or_equal` | Zod `.superRefine` + `errors.end_date`; Pest `rejects an end date before the start date` |
| F3 | Low | **Fixed** | No upgrade runbook / dedicated readiness page | This page + [Upgrade](/deployment/upgrade) |
| F4 | Low | **Fixed** | Sales shared-session e2e blocked by driver.js overlay; 180s timeout | `suppressModuleTourAutoStart` + `test.setTimeout(300_000)` |
| F5 | Medium | **Fixed** | Picker listed all users / auto-fill hid owner id behind Unassigned | `filterLeadAssigneeOptions` on form + detail; copy assignee only when listed |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No new permissions | Reuse `contracts.create` / `update` / `view` |
| Owner as assignee | Owners stay ineligible in the picker. Create with omitted `assigned_to` still defaults to the actor in `ContractService`. API may pass `assigned_to` = actor (F1). |
| Timeline comments | `contract_notes.body` remains plain text |
| Catalog bump ≠ auto-install | Workspaces that never entitled Contracts are unchanged |
| Same-branch billing picker | Do not mix catalog versions with quotations/estimates/invoices product_id |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/Contract/ContractTest.php` | Required green (23 cases: HTML, owner self-assign, end date) | Isolation, quotation entitlement, status machine, assignee scope, audit unchanged |
| `npm run test:e2e:contracts` | **1 passed (~1.6m)** | One login: empty-form validation, auto-fill, end-date mistake, TipTap, search, Overview HTML, Notes tab, activate, terminate, timeline |
| `npm run test:e2e:sales` | **4 passed (~3.0m)** | Shared session: opportunities → pipeline → quotations send/accept → contracts HTML create/activate/terminate |

**Contracts e2e (single session):** empty submit → Opportunity/Title/Start date required; pick opportunity → title, party, EUR, value, quotation; end date before start → client error; TipTap description + notes; create; search; Overview HTML; Notes tab comment; Activate; Terminate; Timeline created.

---

## Deploy order

1. Companion **CI** green (Backend / Frontend / Docs)
2. **Backend** — `php artisan migrate --force` (`add_description_to_contracts_table` + catalog bump `1.1.0`)
3. Confirm catalog `contracts` version `1.1.0` (no `db:seed`)
4. **SPA** — opportunity auto-fill + TipTap description/notes + eligible assignee picker
5. **Docs**
6. Staging smoke below before production traffic

Suggested merge: **Backend → Frontend → Docs**. Do **not** `db:seed`.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Pest `ContractTest` green in CI (HTML, owner self-assign, end date) | Eng | ☐ |
| 2 | Playwright `test:e2e:contracts` (+ sales if in the same PR) | QA | ☐ |
| 3 | Migrations applied (`description` column + bump `1.1.0`) | Ops | ☐ |
| 4 | Catalog `contracts` version `1.1.0` | Ops | ☐ |
| 5 | SPA deployed **after** migrate | Ops | ☐ |
| 6 | Staging smoke signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → Opportunities, then Contracts (free). Optionally Quotations.
2. New contract → empty **Create** shows Opportunity / Title / Start date required
3. Pick an opportunity that has a contact, amount, currency, and (if entitled) exactly one quotation → party, value, currency, title, quotation fill. Assignee stays **Unassigned** when the deal is owned by the workspace owner (then save assigns the actor).
4. Set end date **before** start → error; fix end date
5. Description + Notes rich text → save → Overview shows sanitized HTML (bold/lists; no script)
6. Notes tab: add a **plain** comment
7. Activate → Terminate
8. Soft-delete → Deleted only → Restore (owner)

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA (auto-fill/TipTap disappear; `description` column remains) |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall (contract rows retained) |
| Schema | Do **not** drop `description` in prod without a data plan |
| Catalog | Bump-down is not required; display version can stay `1.1.0` |

---

## Monitoring

- Platform audit: `contract_created`, `contract_updated`, `contract_deleted`, `contract_assigned`, `contract_status_changed`, `contract_note_added`
- Nightwatch: `POST /api/tenant/v1/contracts` 422 rate after SPA rollout (assignee / end_date)
- Spatie log name `contracts`

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | **Go** / No-Go |
| Product | | | F1–F5 fixed |
| Ops | | | Staging migrate + smoke ☐ |

**Recommendation:** Merge after CI; migrate-first on staging, then production.
