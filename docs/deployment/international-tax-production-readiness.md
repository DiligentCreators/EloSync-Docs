# International Tax & Withholding — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-24 |
| **Status** | **Go** — staging → production after CI, migrate, and smoke |
| **Scope** | Accounting **1.7.0 → 1.7.2** — tax types catalog, billing line tax types, payment/expense withholding |
| **Branch** | `feature/international-tax-withholding` |
| **Companion** | [User guide](/user-guide/tax-types) · [Developer](/developer-guide/tax-types) · [API](/api/tenant-v1-tax-types) |

Additive work on the existing Accounting module. No new permission slugs (reuses `accounting.*`). No new env vars or queues. Migrate-only deploy path.

---

## Executive summary

Workspaces that already entitled **Accounting** pick up tax types and withholding after migrate. Catalog bumps do **not** auto-install for workspaces that never entitled the module. **Invoices**, **Payments**, and **Expenses** modules unlock the full billing and WHT surface.

| Gate | Result |
|------|--------|
| `module:accounting` + `accounting.*` (no new family) | **Pass** |
| Tax types CRUD + tenant isolation | **Pass** |
| Invoice/credit accrual GL split (Dr AR / Cr Revenue / Cr Tax Payable) | **Pass** |
| Payment WHT 3-line journal (Dr Deposit net / Dr WHT Receivable / Cr AR gross) | **Pass** |
| Expense pay WHT 3-line journal | **Pass** |
| List API `direction` sort vs filter collision (P0) | **Fixed** (1.7.2) |
| Sort column whitelist on tax types list | **Pass** |
| Payment & expense view pages show withholding | **Pass** |
| Pest tax/WHT/accounting | **Pass** (14+) |
| Playwright `test:e2e:accounting` | **Pass** (8 runnable, 2 authz skips on entitled demo) |
| Docs + changelog + this runbook | **Pass** |

**Go / No-Go:** **Go** after companion CI green, `php artisan migrate --force`, and staging smoke below.

---

## Findings

| ID | Severity | Status | Finding | Action |
|----|----------|--------|---------|--------|
| F1 | **Critical** | **Fixed** | Tax types list returned empty when UI sent `direction=asc\|desc` (treated as tax direction filter) | Only filter when value is a tax direction enum; use `sort` + `direction` for ordering; Pest regression |
| F2 | Medium | **Fixed** | Payment view did not show posted withholding amount | Read-only WHT fields on payment view; API loads `withholdingTaxType` |
| F3 | Low | **Fixed** | Expense view did not show withholding after pay | Same pattern on expense view |
| F4 | Low | **Fixed** | `orderBy($request->input('sort'))` without whitelist | Allowed sorts: `name`, `code`, `kind`, `direction`, `rate`, `created_at`, `updated_at` |
| F5 | Low | **Fixed** | Select controlled/uncontrolled warnings on tax type form | Stable `watch()` values; client-side zod for required GL accounts |
| F6 | Info | **Accepted** | Authz e2e skips when demo workspace has Accounting | Run negative authz on isolated tenant in CI if needed |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No new permissions | Reuse existing `accounting.*` for tax types |
| Payment `amount` = gross applied to AR | Withholding reduces deposit only |
| Jurisdiction-agnostic catalog | FBR-style values are example `authority_reference` only |
| Deferred | Country templates, WHT certificates, payroll statutory — out of scope |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/Accounting/TaxTypeTest.php` | **Pass** | CRUD, list sort/filter, invalid sort fallback, authz, soft delete |
| `PaymentWithholdingTest`, `ExpenseWithholdingTest` | **Pass** | 3-line journals |
| `CustomerInvoiceAccountingTest`, `CustomerCreditNoteAccountingTest` | **Pass** | Tax split to `2100` |
| `npm run test:e2e:accounting` | **8 passed, 2 skipped** | Tax types 4/4 in one session; authz skips on entitled demo |

**Tax types e2e (single session):** validation + CRUD; invoice tax split; payment WHT create/post + view; expense pay WHT + view.

---

## Deploy order

1. **Backend** — `composer install` then `php artisan migrate --force` (tax_types, billing line FK, WHT columns, catalog **1.7.0 → 1.7.2**)
2. **SPA** — tax types pages, billing line picker, payment/expense WHT UI, view-page withholding
3. **Docs** — user/dev/API/changelog + this page
4. Staging smoke below before production traffic

Suggested merge: **Backend → Frontend → Docs**. Do **not** `db:seed` in production.

Starter GL accounts **1150** (WHT receivable) and **2150** (WHT payable) are created via the existing chart seeder when Accounting is enabled or CoA is seeded.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied (tax_types + WHT columns + catalog bumps through **1.7.2**) | Ops | ☐ |
| 2 | Catalog `accounting` version **1.7.2** | Ops | ☐ |
| 3 | Pest tax/WHT/accounting green in CI | Eng | ☐ |
| 4 | Playwright `test:e2e:accounting` green | QA | ☐ |
| 5 | Staging smoke signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → Accounting already installed (or install free)
2. **Tax types** → list shows rows (not empty) → create sales tax + payment-in WHT
3. **Invoice** → line with tax type → send → journal splits tax to **2100**
4. **Payment** → gross amount + WHT type → post → view shows **Withheld** and **Deposit (net)**
5. **Expense** → approve → pay with WHT → view shows **Withheld** and **Cash paid (net)**
6. Contact/vendor default withholding type pre-fills payment/expense pay dialogs

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA (WHT UI disappears; API columns remain) |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall Accounting (tax type rows retained) |
| Schema | Do **not** roll back tax_types / WHT columns in prod without a data plan |

---

## Monitoring

- Spatie activity log names: `tax_types`, `customer_payments`, `expenses`
- Nightwatch: validation errors on `POST …/payments/{id}/post` and `POST …/expenses/{id}/pay` with WHT fields
- Support signal: empty tax types list after deploy → verify Backend **1.7.2** list fix is deployed

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | **Go** / No-Go |
| Product | | | F1–F5 fixed |
| Ops | | | Staging migrate + smoke ☐ |

**Recommendation:** Merge companions after CI green; run staging smoke.
