# Reseller Payouts — User Guide

## Who can use Reseller Payouts

Your workspace must have **Reseller Payouts** installed (requires **Resellers**, which requires **Payments**). Your role needs `reseller-payouts.view` to list entries, plus `approve` / `pay` / `void` for actions.

Without `resellers.assign` (and not superadmin), you only see entries where you are the party user, or entries for a reseller linked to your login.

Invited **reseller** role users can view their commission entries — not approve, pay, or void.

## How commission appears

1. Create a reseller with commission rates
2. Link that reseller on a customer invoice (`reseller_id`)
3. Collect payment until the invoice status is fully **Paid** (not Partial)
4. Two ledger rows appear with status **Accrued** — one for the reseller party, one for the owner party

If Reseller Payouts is not installed when the invoice becomes Paid, no rows are created. Rows are not backfilled automatically later.

## List & KPIs

- Search by reseller name/email/company or invoice number/title
- Filter by status (`accrued`, `approved`, `paid`, `void`), party (`reseller` | `owner`), and reseller
- Stats: counts per status plus accrued / approved / paid amounts

## Approve, pay, void

| Action | From status | Permission |
|--------|-------------|------------|
| Approve | Accrued only | `reseller-payouts.approve` |
| Mark paid | Approved only | `reseller-payouts.pay` |
| Void | Accrued or Approved (not Paid) | `reseller-payouts.void` |

**Mark paid** records that the workspace has settled the commission — it does not move money through a payment gateway.

If a Paid invoice later leaves Paid (e.g. payment voided), **all** non-void ledger rows for that invoice are auto-voided (including ones already marked paid). The manual **Void** action still rejects entries that are already `paid`.

## Related modules

- [Resellers](/user-guide/resellers) — partner directory and rates
- [Payments](/user-guide/payments) / [Invoices](/user-guide/invoices) — invoice must be fully Paid to accrue
