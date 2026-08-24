# Tenant API — Tax types

Base path: `/api/tenant/v1/tax-types`

Requires **Accounting** module entitlement and `accounting.*` permissions.

## List tax types

`GET /tax-types`

Query: `search`, `kind`, `direction`, `is_active`, `trashed`, pagination.

## Create tax type

`POST /tax-types`

```json
{
  "name": "Standard VAT",
  "code": "VAT-STD",
  "kind": "sales_tax",
  "direction": "add_on_sale",
  "rate": 15,
  "calculation_base": "net_of_discount",
  "payable_account_id": 12,
  "authority_reference": null,
  "is_active": true
}
```

Withholding examples:

- Payment in: `kind: "withholding"`, `direction: "deduct_on_payment_in"`, `receivable_account_id`
- Payment out: `kind: "withholding"`, `direction: "deduct_on_payment_out"`, `payable_account_id`

## Show / update / delete

- `GET /tax-types/{id}`
- `PUT /tax-types/{id}`
- `DELETE /tax-types/{id}`
- `POST /tax-types/{id}/restore`
- `DELETE /tax-types/{id}/force`

## Related endpoints

- Billing lines accept `lines.*.tax_type_id` on invoices, credit notes, quotations, estimates, POs (when Accounting entitled).
- Payments: `withholding_tax_type_id`, `withholding_authority_reference` on create/update; `withholding_amount` computed on post.
- Expenses: same withholding fields on `POST /expenses/{id}/pay`.
- Contacts / vendors: `default_withholding_tax_type_id`.

See [developer guide](/developer-guide/tax-types) for journal semantics.
