# Accounting — User Guide

Enable **Accounting** from Marketplace (free). Nav appears under **Finance**: Accounts, Journals, Transfers, General Ledger.

## Chart of accounts

1. Open **Accounts**. A starter chart loads automatically the first time. Each row shows its **current balance** (from posted journals).
2. Use **New account** to add custom codes (code, name, type). For bank or cash wallets, set type **Asset** and tick **Cash or bank account**.
3. Starter **Cash (`1000`)** is already a cash/bank account. Add more banks (e.g. Bank – HBL) the same way so payments and expenses can deposit to / pay from them.
4. System accounts cannot be deleted or renumbered; accounts with posted journal lines cannot be deleted.
5. Soft-deleted custom accounts can be restored (or permanently deleted) via the trash filter when you have restore / force-delete permission.

## Opening / set balance (cash & bank)

Balances are never edited as a stored field. On an active cash/bank account:

1. Open the account → **Set balance**.
2. Enter the **target** amount and date. Offset defaults to **Owner Equity (`3000`)**; you can pick another active account.
3. Saving posts a journal for the **difference** only (`ADJ-` number). Increase: Dr cash/bank / Cr offset. Decrease: Dr offset / Cr cash/bank.
4. Recent adjustments appear under **Balance adjustments** on the account. **Void** reverses the linked journal (requires `accounting.void`).

## Journals

1. Open **Journals** → **New journal**.
2. Set the entry date and memo.
3. Add at least two lines. Each line needs an account and either a debit or a credit (not both).
4. Debits must equal credits before you can save.
5. Open the entry → **Post** to make it immutable and visible on the general ledger.
6. Posted entries can be **Void** (excluded from GL/reports; reason optional).

## Transfers

Move money between cash/bank accounts without treating it as income or expense:

1. Open **Transfers** → **New transfer**.
2. Choose **From** and **To** (both must be cash/bank), amount, date, optional reference/memo.
3. Saving posts a journal immediately (Dr destination / Cr source) and updates both balances.
4. Open a transfer → **Void** to reverse the journal (reason optional).

## Payments & expenses (when those modules are installed)

- **Payments**: choose **Deposit to** (cash/bank). On **Post**, Accounting creates Dr deposit / Cr Accounts Receivable.
- **Expenses**: on **Mark as paid**, choose **Paid from** (cash/bank) and optionally an expense P&amp;L account (defaults to Operating Expenses). Accounting creates Dr expense / Cr paid-from.

## General ledger

1. Open **General Ledger**.
2. Optionally filter by account and date range → **Apply filters**.
3. Review opening/closing balance and paginated line detail for posted journals only.

## Related reports

Install **Financial Reports** (requires Accounting) for Trial Balance, Profit & Loss, and Balance Sheet.
