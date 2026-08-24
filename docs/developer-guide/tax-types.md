# Tax types (developer)

Jurisdiction-agnostic tenant catalog under Accounting. Pakistan FBR-style sections are **test data only** (`authority_reference`), not hardcoded logic.

## Data model

Table `tax_types` (`BelongsToTenant`, soft deletes):

- `kind`: `sales_tax` | `withholding`
- `direction`: `add_on_sale` | `deduct_on_payment_in` | `deduct_on_payment_out`
- `rate`, `calculation_base`, optional GL FKs, `authority_reference`, `is_active`

Billing lines: nullable `tax_type_id` on invoice, credit note, quotation, estimate, and PO line tables.

Withholding columns on `customer_payments` and `expenses`: `withholding_tax_type_id`, `withholding_amount`, `withholding_authority_reference`.

Counterparty defaults: `contacts.default_withholding_tax_type_id`, `vendors.default_withholding_tax_type_id`.

## Services

- `TaxTypeService` — CRUD + `assertActiveForApply()` + `calculateWithholdingAmount()`
- `TaxTypeResolver` — resolves line `tax_rate` from active sales tax types when Accounting is entitled
- `CashMovementJournalService::createAndPostLines()` — multi-line auto-posted journals

### GL posting

| Event | Journal |
|-------|---------|
| Invoice send | Dr AR / Cr Revenue / Cr Tax Payable (`2100`) |
| Credit note apply | Reverse split |
| Payment post (with WHT) | Dr Deposit (net) / Dr WHT Receivable (`1150`) / Cr AR (gross) |
| Expense pay (with WHT) | Dr Expense (gross) / Cr Cash (net) / Cr WHT Payable (`2150`) |

Payment `amount` remains gross-to-AR; withholding reduces deposit only.

## API

See [tenant-v1-tax-types](/api/tenant-v1-tax-types). Routes: `module:accounting` + existing `accounting.*` permissions (no new slugs).

## Catalog versions

- `accounting` **1.7.0** — tax types CRUD, starter WHT accounts, invoice/credit tax split
- `accounting` **1.7.1** — withholding on payments/expenses, counterparty defaults
- `accounting` **1.7.2** — list API fix: `direction=asc|desc` sorts; enum values filter by tax direction
- `invoices` **1.8.1** — `tax_type_id` on billing lines

List query: use `sort` + `direction` (`asc`/`desc`) for ordering; pass tax direction enum values to filter. See [API](/api/tenant-v1-tax-types).

## Tests

- `tests/Feature/Tenant/Accounting/TaxTypeTest.php`
- `tests/Feature/Tenant/Accounting/PaymentWithholdingTest.php`
- `tests/Feature/Tenant/Accounting/ExpenseWithholdingTest.php`
- `tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceAccountingTest.php` (tax split)

Playwright: `e2e/tests/accounting/tax-types.spec.ts`

## Deferred

Country template imports, formula/filer engines, payroll statutory tax, WHT certificates, multi-jurisdiction per contact.
