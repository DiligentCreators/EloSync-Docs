# Expenses — User Guide

## Who can use Expenses

Enable the **Expenses** module from Marketplace (free) — no other modules are required first. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `submit`, `approve`, `reject`, `pay`, `cancel` as needed).

Without **assign**, you only see expenses assigned to you.

## List & table

Open **Expenses** from the sidebar, under the **Purchasing** group (after Purchase Orders). Search by title or number, filter by status or category, toggle **My Expenses**, and switch KPI cards (Total, Mine, Draft, Submitted, Approved, Paid) to quick-filter the table. The table shows category, status, amount, expense date, assignee, and the **latest note**.

Use **Manage categories** (visible with `expenses.create`, `expenses.update`, or `expenses.delete`) to add, rename, activate/deactivate, or delete workspace expense categories. New workspaces start with Travel, Office, Software, Utilities, and Other. You cannot delete **Other** (it is the default for new expenses and Purchase Order convert). You also cannot delete a category that still has expenses. Renaming a starter category keeps its slug.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted expense from the row menu
- **Delete permanently** requires `expenses.force.delete` — granted to the workspace **owner** by default

## Create an expense

1. Click **New expense**
2. Enter a title, category (from your workspace list), amount, and optional tax amount
3. Optionally set currency and an expense date
4. If **Vendors** or **Purchase Orders** are installed on your workspace, optionally link a vendor and/or a purchase order — use **New** beside the vendor picker to create and select a vendor inline when you have `vendors.create`
5. Optionally attach a **receipt** file (images or PDF, up to 5 MB) — counts toward your workspace [Storage](/user-guide/storage) quota
6. Optionally set an assignee (requires **assign**)
7. Save

Edit from the row menu or the record page while the expense is still **Draft**. After **Submit**, content is locked; use status actions and assignment instead. You can add a receipt while editing a draft expense.

## Receipts

On the expense record page, the **Receipts** section lists uploaded files with a **Download** action. Receipts are stored privately in your workspace Storage quota (not public URLs). Upload failures due to quota or missing Storage entitlement show inline errors on the form.

## Status workflow

An expense starts in **Draft**. Move it forward with:

- **Submit** (`draft → submitted`) — sends the expense for approval
- **Approve** (`submitted → approved`) — requires `expenses.approve`, not limited to the assignee
- **Reject** (`submitted → rejected`) — requires `expenses.reject`; terminal
- **Mark as paid** (`approved → paid`) — requires `expenses.pay`; terminal. When **Accounting** is installed, you must choose **Paid from** (cash/bank account); optionally pick an expense P&amp;L account (defaults to Operating Expenses). Accounting posts **Dr** expense / **Cr** paid-from for amount + tax so that bank's balance decreases
- **Cancel** (`draft → cancelled` or `submitted → cancelled`) — terminal

Invalid transitions (e.g. paying directly from Draft) are rejected with a validation error. `Rejected`, `Paid`, and `Cancelled` are terminal — no further transitions.

## Optional vendor / purchase order links

Both links are **soft** — they only appear in the create/edit form when the corresponding module (**Vendors** / **Purchase Orders**) is installed on your workspace, and they're always optional even when installed. An expense created without either link works exactly the same as one that has them; they're purely for cross-referencing spend to a supplier or an order.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & timeline

- **Notes** — free-form notes on the expense
- **Timeline** — history of create, update, assignment, status change, note, and delete/restore events

## What's not here yet

Reimbursement/payout tracking beyond the **paid** status, and multi-line (itemized) expenses are planned but not part of this module yet — see the [Product Roadmap](/getting-started/product-roadmap).

> **Accounting (shipped):** when Accounting is installed, **Mark as paid** posts a journal — see [Accounting](/user-guide/accounting).
