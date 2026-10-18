# Accounting — User Guide

Enable **Accounting** from Marketplace (free). Nav appears under **Finance**: Accounts, Journals, Transfers, General Ledger.

## Chart of accounts

1. Open **Accounts**. A starter chart loads automatically the first time. Each row shows its **current balance** (from posted journals).
2. Use **New account** to add custom codes (code, name, type). Optionally set a **parent** account for hierarchy, and tick **Header** for non-postable grouping rows (headers cannot appear on journal lines).
3. For bank or cash wallets, set type **Asset** and tick **Cash or bank account**. Starter **Cash (`1000`)** is already cash/bank; add more banks the same way.
4. Starter chart also includes Tax Payable (`2100`) and Retained Earnings (`3100`). System accounts cannot be deleted or renumbered; accounts with posted journal lines cannot be deleted.
5. Soft-deleted custom accounts can be restored (or permanently deleted) via the trash filter when you have restore / force-delete permission.

## Opening balances (trial balance)

To load a full opening trial balance (not just one cash/bank account):

1. Open **Accounts** → **Opening balances** (`/accounts/opening-balances`).
2. Enter a date and balanced debit/credit lines across postable accounts (headers are excluded).
3. Saving posts one multi-line opening journal. Debits must equal credits.

## Set balance (cash & bank)

Balances are never edited as a stored field. On an active cash/bank account:

1. Open the account → **Set balance**.
2. Enter the **target** amount and date. Offset defaults to **Owner Equity (`3000`)**; you can pick another active account.
3. Saving posts a journal for the **difference** only (`ADJ-` number). Increase: Dr cash/bank / Cr offset. Decrease: Dr offset / Cr cash/bank.
4. Recent adjustments appear under **Balance adjustments** on the account. **Void** reverses the linked journal (requires `accounting.void`).

## Journals

1. Open **Journals** → **New journal**.
2. Set the entry date and memo.
3. Add at least two lines on the classic **Account / Debit / Credit / Memo** grid. Each line needs an account and either a debit or a credit (not both). Zero Dr/Cr cells stay blank; amounts use currency formatting.
4. Debits must equal credits before you can save. The list shows an **Amount** column for each entry.
5. Open the entry → **Post** to make it immutable and visible on the general ledger.
6. Posted entries can be **Void** (excluded from GL/reports; reason optional).

## Transfers

Move money between cash/bank accounts without treating it as income or expense:

1. Open **Transfers** → **New transfer**.
2. Choose **From** and **To** (both must be cash/bank), amount, date, optional reference/memo.
3. Saving posts a journal immediately (Dr destination / Cr source) and updates both balances.
4. Open a transfer → **Void** to reverse the journal (reason optional).

## Invoices & credit notes (when those modules are installed)

When Accounting is entitled:

- **Invoices — Send**: posts Dr Accounts Receivable (`1100`) / Cr Sales Revenue (`4000`) for the invoice total; links the journal on the invoice. **Cancel** voids that journal.
- **Credit Notes — Apply**: posts Dr Sales Revenue / Cr Accounts Receivable for the credit total; links the journal (applied credits stay irreversible).
- No backfill for invoices or credits issued before Accounting was installed.

## Purchase orders and inventory (when those modules are installed)

When Accounting is entitled:

- **Receive** a purchase order: tracked products post Dr Inventory Asset (`1200`) / Cr Accounts Payable (`2000`) for quantity × unit price. Lines that are not tracked products post Dr Operating Expenses (`6000`) / Cr Accounts Payable. Purchase-order tax is not included. One journal per receipt. Receipts from before this version are not backfilled.
- If that purchase order was already converted to an expense, no payable journal is posted. If the payable journal already exists, **Convert to expense** is blocked. Use **Pay vendor** on the purchase order (cash/bank **Paid from**) to post Dr Accounts Payable / Cr cash. Each open receipt is settled once.
- **Stock in** (not from a purchase-order receipt): Dr Inventory Asset / Cr Owner Equity (`3000`) at product cost.
- **Stock out**: Dr Cost of Goods Sold (`5000`) / Cr Inventory Asset at product cost.
- **Adjust** posts only the change in quantity, using the stock-in or stock-out pair. A zero change posts nothing.
- **Transfers** between warehouses post no journal. Cancelling a purchase order does not reverse the receipt journal.

## Payments, expenses & payroll (when those modules are installed)

- **Payments**: choose **Deposit to** (cash/bank). On **Post**, Accounting creates Dr deposit / Cr Accounts Receivable (settles the receivable booked on invoice send).
- **Expenses**: on **Mark as paid**, choose **Paid from** (cash/bank) and optionally an expense P&amp;L account (defaults to Operating Expenses). Accounting creates Dr expense / Cr paid-from. **Undo payment** voids that journal and returns the expense to approved. A locked period blocks the undo.
- **Payroll**: on **Mark paid**, choose **Paid from** (cash/bank). Accounting posts (or creates) the accrual (`Dr` Salary Expense `6400` / `Cr` Salaries Payable `2200`), then posts the payment (`Dr` Salaries Payable / `Cr` paid-from) so cash/bank decreases. Optional **Post to journal** before pay creates a draft accrual only.

## General ledger

1. Open **General Ledger**.
2. Optionally filter by account and date range → **Apply filters**.
3. Review opening/closing balance and paginated line detail for posted journals only. Amounts are currency-formatted; journal numbers link to the entry.
4. Use **Export CSV** to download the filtered ledger.

## Related reports

Install **Financial Reports** (requires Accounting) for Trial Balance, Profit & Loss, and Balance Sheet.
