# Expenses Module

Phase 4 Purchasing module (Milestone 3, final) on the frozen platform. A simplified single-amount expense record — number, category, amount, tax, status workflow, assignment, notes, and an activity timeline — with **soft, optional** links to Vendors and Purchase Orders. Unlike Purchase Orders (hard-depends on Vendors), Expenses is **standalone**: it installs with no module dependencies, and works fully on its own.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [expenses.md](/user-guide/expenses) |
| Engineers | [expenses-developer.md](/developer-guide/expenses) |
| Production / ops | [expenses-production.md](/deployment/expenses) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [purchase-orders-overview.md](/user-guide/purchase-orders-overview) |
| Tenant API | [../api/tenant-v1-expenses.md](/api/tenant-v1-expenses) |

## Capabilities

- Header only, no line items: number (`EXP-` prefix, configurable), title, category (`travel`\|`office`\|`software`\|`utilities`\|`other`), amount, tax amount, currency, expense date, status, notes
- Optional `vendor_id` and `purchase_order_id` — soft links, only validated (and only pickable in the UI) when the corresponding module is entitled on the workspace
- Status workflow: `draft → submitted → approved | rejected`, `approved → paid`, `draft | submitted → cancelled`
- Draft-only field edits — after **Submit**, only status actions and assignment remain available
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `expenses.assign`
- Notes (comments) + activity timeline
- Table view with search, status filter, category filter, assignee filter, and **My Expenses** toggle
- KPIs via `GET /expenses/stats` (total, mine, draft, submitted, approved, rejected, paid, cancelled, approved value, paid value)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:expenses`) + Spatie permissions — **free Marketplace opt-in**, no hard dependencies
- **Soft convert**: a `purchase-orders.convert` action creates a draft Expense from a sent/partially received/received Purchase Order (one-way, one-time) — see [Purchase Orders — User Guide](/user-guide/purchase-orders#convert-to-expense)
- Audit + activity logging

## Permissions

`expenses.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `submit` · `approve` · `reject` · `pay` · `cancel`

Enable Expenses from Marketplace (free) — it has no hard dependencies, so it can be installed on its own, before or after Vendors / Purchase Orders. Catalog: slug `expenses`, category `purchasing` (Purchasing), `is_default_included = false`, `is_billable = false`, `sort_order = 30`.

## Why standalone (soft dependencies)

Purchase Orders hard-depends on Vendors because every purchase order **must** reference a vendor. Expenses is different — most day-to-day spend (a taxi ride, a software subscription) has no vendor or purchase order behind it, so both links are optional and only appear once the related module is installed. This keeps Expenses usable as a lightweight, install-anywhere module rather than forcing the full Purchasing stack.

## Explicitly deferred

- Receipt attachments / file uploads
- Reimbursement workflows and payout tracking beyond the `paid` status flag
- General ledger (GL) posting / accounting integration
- Multi-line expenses (itemized receipts) — this MVP is single-amount only
- Dashboard widgets for Expenses
