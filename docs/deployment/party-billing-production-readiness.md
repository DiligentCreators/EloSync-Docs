# Party-first billing — production readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-09-13 |
| **Status** | **Go** — audit High/Medium/Low engineering items closed; Ops migrate + staging smoke before production traffic |
| **Scope** | Contact/company billing hubs + statements (+ PDF); vendor purchasing hubs + statements; list deep links; aged receivables customer identity; catalog **contacts 1.4.0 → 1.5.0**, **companies 1.1.0 → 1.2.0**, **vendors 1.1.0 → 1.2.0** |
| **Companion** | [Contacts user guide](/user-guide/contacts) · [Companies](/user-guide/companies) · [Vendors](/user-guide/vendors) · [Financial reports](/user-guide/financial-reports) · [Contacts API](/api/tenant-v1-contacts) · [CHANGELOG](/changelog/) |

---

## Executive summary

Party records become the hub for AR/AP discovery instead of forcing users through Billing/Purchasing lists only:

- List deep links: `/invoices?contact=`, `?company=`, `/payments?…`, quotations, credit notes, `/purchase-orders?vendor=`, `/expenses?vendor=`
- Contact/company **Billing** strip (invoiced / paid / balance) + recent docs (incl. credit notes) + **Statement** (JSON + PDF) with opening/closing balance
- Vendor **Purchasing activity** strip (PO/expense spend — not AP payable) + statement (in-app; PDF deferred)
- Aged receivables rows include contact/company identity with SPA drill-downs
- Platform freeze respected — extends existing Contact/Company/Vendor + list pages

**Go / No-Go:** **Go** for staging → production after CI on companion PRs and Ops pre-flight below.

| Gate | Result |
|------|--------|
| Party summary + statement APIs (authz, module entitlement, tenant isolation) | **Pass** |
| Customer invoice summary excludes draft/cancelled | **Pass** |
| Customer statement credits = **applied only** (aligns aged AR; excludes issued/refunded) | **Pass** |
| Vendor summary/statement exclude **draft** + cancelled | **Pass** |
| Statement `opening_balance` + closing `balance_due` (customer + vendor) | **Pass** |
| SPA hubs + ErrorState on summary failure + statement routes + deep-link chips | **Pass** |
| Statement button gated by related `*.view` (not module-only) | **Pass** |
| Catalog bump migration + CatalogSeeder **1.5.0 / 1.2.0 / 1.2.0** | **Pass** |
| Pest `PartyBilling` suite (+ aged AR shape + opening balance) | **Pass** |
| Playwright `contacts.party-billing` (contact + company + PDF smoke) | **Pass** (verify in CI / headed) |
| Docs user/developer/API/CHANGELOG | **Pass** |
| AP bills / vendor payment module / vendor PDF / mobile statement UI | **N/A** (explicitly deferred) |

---

## Audit findings (closed)

| Severity | Finding | Resolution |
|----------|---------|------------|
| High | Vendor drafts inflated purchasing totals | Exclude draft + cancelled on summary and statement |
| High | Refunded/issued credits reduced statement balance | Statement credits use **applied** status only |
| Medium | Statement button module-only vs hub `*.view` | Header Statement requires invoices/payments (or PO/expense) **view** |
| Medium | Thin company/vendor e2e | Company hub + PDF smoke added to `contacts.party-billing.spec.ts` |
| Medium | Hub silent failure on summary error | `ErrorState` + retry on customer/vendor hub panels |
| Low | No opening-balance on statement | API + SPA + PDF expose `opening_balance`; closing labeled clearly |
| Low | Vendor “balance” is spend, not AP payable | UI/docs: “Purchasing activity” / “Activity total”; API notes clarify |
| Low | Credit notes missing from hub | Recent credit notes list on customer party hub when module entitled |

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_09_12_165056_bump_contacts_companies_vendors_for_party_billing` | contacts **1.5.0**, companies **1.2.0**, vendors **1.2.0** |

Production: **migrate only**. Do **not** `db:seed` on upgrade. Fresh local/CI seed uses `CatalogSeeder` versions aligned with these bumps.

---

## Deploy order

1. **Backend** — `php artisan migrate --force` (catalog bumps)
2. Confirm central catalog versions: contacts **1.5.0**, companies **1.2.0**, vendors **1.2.0**
3. Deploy **SPA** (hubs, deep links, statement pages)
4. Deploy **Docs**
5. Optional: **Mobile** aged receivables type fields (display polish only)
6. Staging smoke below

Suggested merge order: **Backend → Frontend → Docs** (+ Mobile if shipping).

No new env vars, queues, or scheduler entries.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied; catalog contacts/companies/vendors versions match table above | Ops | ☐ |
| 2 | Contact with invoices: Billing strip shows totals; **View invoices** opens `?contact=` chip | QA | ☐ |
| 3 | Contact **Statement** date range + opening/closing + PDF download | QA | ☐ |
| 4 | Company hub + statement PDF | QA | ☐ |
| 5 | Vendor hub PO/expense totals exclude drafts; statement shows activity labels | QA | ☐ |
| 6 | Aged receivables shows customer column + links | QA | ☐ |
| 7 | User without invoices/payments view does not see Statement / Billing on contact | QA | ☐ |
| 8 | Pest `tests/Feature/Tenant/PartyBilling` green in CI | Eng | ☐ |
| 9 | Playwright `e2e/tests/contacts/contacts.party-billing.spec.ts` green | QA | ☐ |

---

## Residual risks / follow-ups

1. Vendor AP bills / payments module and vendor statement PDF (product backlog).
2. EloSync-Mobile party statement UI (web-first this cycle).
3. Optional headed vendor hub Playwright (PO/expense path) — not blocking; covered by Pest.

---

## Verdict

**Go** — audit findings closed for this cycle; ship after migrate + staging smoke and green CI on companion PRs.
