# Tax types

Configure **sales tax** and **withholding tax** rules for your workspace when the **Accounting** module is installed.

## Where to find it

Finance → **Tax types** (requires `accounting.view`).

## Tax type kinds

| Kind | Direction | Used on |
|------|-----------|---------|
| Sales tax | Add on sale | Invoice, credit note, quotation, estimate, and purchase order lines |
| Withholding | Deduct on payment in | Customer payments (tax withheld by the customer) |
| Withholding | Deduct on payment out | Expense pay (tax you withhold from a vendor) |

Each tax type has a fixed **rate** (%), optional **authority reference** (free text for your jurisdiction’s section or code), and optional GL account mapping.

## Starter GL accounts

When Accounting is first used, these system accounts are seeded (or backfilled):

| Code | Name | Role |
|------|------|------|
| `2100` | Tax Payable | Sales tax liability on invoices |
| `1150` | Withholding Tax Receivable | Customer withholding on payments |
| `2150` | Withholding Tax Payable | Vendor withholding on expense pay |

Map tax types to these accounts (or your own liability/asset accounts) on each tax type record.

## Sales tax on billing documents

On invoice and related line editors, pick an active **sales tax** type or enter a manual rate. When a tax type is selected, its rate is applied automatically.

When an invoice is **sent** (with Accounting installed), the accrual journal splits:

- **Dr** Accounts Receivable (total)
- **Cr** Revenue (subtotal)
- **Cr** Tax Payable (tax total)

## Withholding on customer payments

On a payment, **Amount** is still the gross applied to AR. Withholding reduces the **deposit** only.

Example: $1,000 payment with 4% withholding → deposit $960, WHT receivable $40, AR credit $1,000.

Optional **authority reference** can be stored on the payment (copied from the tax type when blank).

## Withholding on expense pay

When marking an expense paid, gross expense (amount + tax) is debited to the expense account. Cash credited is **net of withholding**; the withheld portion credits WHT Payable.

## Counterparty defaults

- **Contacts** — default withholding type for customer payments (payment in).
- **Vendors** — default withholding type for expense pay (payment out).

These pre-fill payment and expense pay forms when the contact or vendor is selected.

## Workspace tax profile

Settings → General (optional, for PDFs and reports):

- **Tax country** — ISO 3166-1 alpha-2
- **Tax registration ID** — your workspace tax identifier

## Related guides

- [Accounting overview](/user-guide/accounting-overview)
- [Invoices](/user-guide/invoices-overview)
- [Payments](/user-guide/payments-overview)
- [Expenses](/user-guide/expenses-overview)
