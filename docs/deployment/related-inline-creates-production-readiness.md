# Related inline creates — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-09-04 |
| **Status** | **Go for production** after PR merge + migrate-first deploy + staging smoke |
| **Scope** | Platform-wide gated **New** dialogs on related FK pickers (Contact, Company, Opportunity, Lead, Vendor); URL query prefills preserved; catalog MINOR bumps |
| **Branch** | `feature/related-inline-creates` (Frontend, Backend, Docs) |
| **Backend** | Idempotent catalog bump migration only (no new APIs) |
| **Frontend** | Shared `Create*Dialog` + `RelatedEntityPicker`; wired across CRM/billing/ops forms |
| **Docs** | Module Development Guide standard + user-guide notes + changelog + this audit |

**Companion docs:** [Module development](/developer-guide/module-development) · [Changelog](/changelog/) · [Upgrade](/deployment/upgrade)

---

## Executive summary

Create/edit forms that pick records from another module now offer a **New** control beside the picker. The dialog creates a minimal related record and auto-selects it so users do not leave the parent form. **New** is shown only when the related module is entitled **and** the user has `*.create`. Pickers require `hasModule` + `*.view`.

Platform freeze is intact: no AppLayout, auth, tenancy, RBAC, or billing redesign. Creates use existing tenant `*Service.create` endpoints; backend authz/policies are unchanged.

**Go / No-Go:** **Go** — audit residuals **B1/B2/M1/I2** remediated; Mobile remains out of scope. Operator next: merge companion PRs, migrate catalog bumps, deploy Backend → Frontend → Docs, staging smoke.

| Gate | Result |
|------|--------|
| Shared dialogs (company, contact, vendor, opportunity, lead) | **Pass** |
| RelatedEntityPicker + module/create gates | **Pass** |
| Wired forms (CRM, billing, purchasing, ops) | **Pass** |
| URL `?contact=` / `?company=` prefill survives form reset | **Pass** (remediated) |
| Prefetch missing picker options for deep-link ids | **Pass** |
| Catalog MINOR bumps via idempotent migration | **Pass** |
| Platform freeze | **Pass** |
| Playwright related-creates + invoices workflow + authz | **Pass** (related-creates suite including authz) |
| Mobile SPA parity | **Out of scope** (tenant web only) |
| Dedicated Pest | **N/A** (no new backend endpoints) |

---

## Security summary

| Control | Status |
|---------|--------|
| No new auth / tenancy / billing systems | Pass |
| **New** gated by `hasModule(related)` + `related.create` | Pass |
| Picker gated by `hasModule` + `related.view` | Pass |
| Create calls existing tenant APIs (policy / form-request authz unchanged) | Pass |
| Dialogs are secondary UX only (not primary record pages) | Pass |

### Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **B1** | High | URL prefill cleared when currency settings hydrate `reset()` | **Remediated** — reset keeps query params; prefill waits for module gates; merge prefetched contact/company into picker options |
| **B2** | Medium | Dialog submit raced empty controlled Name (Create stayed disabled) | **Remediated** — shared Create*Dialogs reset fields on close (not open); e2e helper still asserts Name + enabled submit |
| **B3** | High | Dialog **Create** also submitted the parent create form (invoice/quotation/etc.) via React portal event bubbling | **Remediated** — all shared Create*Dialog `onSubmit` call `stopPropagation` |
| **M1** | Medium | User-guide create steps only detailed for invoices / quotations / POs | **Remediated** — create steps updated for estimates, contracts, payments, credit notes, opportunities, projects, activities, help desk, documents, expenses, assets (plus existing invoices / quotations / POs / contacts) |
| **I1** | Info | Shared-demo “module not installed” negative e2e invalid | **Removed** — modules accumulate on demo tenant; Pest/module middleware remain source of truth |
| **I2** | Info | `*.create` permission-only negative e2e not covered | **Remediated** — Playwright `related-creates.authz` asserts Company/Contact pickers without **New** when `companies.create` / `contacts.create` are denied |
| **I3** | Info | EloSync-Mobile not updated | **Out of scope** for this web UX |

No High, Medium, or Info **open** residuals for ship (Mobile remains out of scope).

---

## Change inventory

### Backend

- Migration `2026_09_03_204444_bump_modules_for_related_inline_creates` — MINOR bumps: invoices **1.9.0**, quotations **1.7.0**, estimates **1.6.0**, contracts **1.3.0**, payments **1.3.0**, credit-notes **1.3.0**, purchase-orders **1.3.0**, opportunities **1.2.0**, projects **1.2.0**, activities **1.1.0**, help-desk **1.8.0**, documents **1.4.0**, expenses **1.4.0**, assets **1.1.0**.

### Frontend

- Shared: `CreateCompanyDialog`, `CreateContactDialog`, `CreateVendorDialog`, `CreateOpportunityDialog`, `CreateLeadDialog`, `RelatedEntityPicker`.
- Forms: contact, opportunity, quotation, contract, estimate, invoice, payment, credit note, project, activity, help desk, documents, purchase order, expense, asset.
- Prefill: `withPrefillOption` + create-mode reset preserves `?contact=` / `?company=`.
- Playwright: `related-creates/related-inline-creates` (shared session), `related-creates.authz` (create permission gate), module `*.related-creates`, contacts regression.

### Docs

- Module Development Guide related-create standard.
- User-guide create notes (invoices, quotations, purchase orders) + overview version lines.
- Changelog delivery note.
- This production readiness page.

---

## Deploy sequence (migrate-first)

1. Deploy **Backend** → `php artisan migrate --force` (catalog bumps only; idempotent).
2. Deploy **Frontend** SPA build.
3. Deploy **Docs**.
4. Staging smoke (below).
5. Production same order.

No `db:seed` in production. Catalog bumps do **not** auto-install modules for workspaces that never entitled them.

---

## Staging smoke (minimum)

1. Workspace with Contacts + Companies + Invoices: **New invoice** → **New** company → **New** contact → empty submit shows validation → fill line → Create → record appears with links.
2. Opportunities + Quotations: **New quotation** → empty submit shows “Opportunity is required” → **New** opportunity → Create quotation succeeds.
3. Vendors + Purchase Orders: **New PO** → empty submit shows “Vendor is required” → **New** vendor → Create succeeds.
4. Without Companies entitled (fresh workspace or uninstall if available): invoice form has no Company picker / **New**.
5. Contact view **New quotation** deep link still prefills Contact combobox after SPA load.
6. Role with `companies.view` / `contacts.view` but **without** create: invoice form shows Company/Contact pickers and **no** **New** buttons.

---

## Rollback

- Revert Frontend SPA first (dialogs disappear; pickers remain).
- Catalog versions can remain elevated (cosmetic Marketplace version); optional down-migration only for local.

## Related

- [Changelog](/changelog/)
- [Module development guide](/developer-guide/module-development)
- [Invoices user guide](/user-guide/invoices)
- [Quotations user guide](/user-guide/quotations)
- [Purchase orders user guide](/user-guide/purchase-orders)
