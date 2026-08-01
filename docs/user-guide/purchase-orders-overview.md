# Purchase Orders Module

Phase 4 Purchasing module (Milestone 2) on the frozen platform. Mirrors the [Estimates](/user-guide/estimates-overview) reference architecture — a header + line-item document with a status workflow, assignment, notes, and an activity timeline. Purchase Orders hard-depends on the **Vendors** module (Milestone 1) — every purchase order must reference a vendor.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [purchase-orders.md](/user-guide/purchase-orders) |
| Engineers | [purchase-orders-developer.md](/developer-guide/purchase-orders) |
| Production / ops | [purchase-orders-production.md](/deployment/purchase-orders) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [estimates.md](/user-guide/estimates-overview) |
| Tenant API | [../api/tenant-v1-purchase-orders.md](/api/tenant-v1-purchase-orders) |

## Capabilities

- Header: number (`PO-` prefix, configurable), required vendor, title, status, currency, order date, expected date, notes, subtotal/tax/total
- Line items (description, quantity, unit price, tax rate) — subtotal/tax/total recomputed server-side, draft-only edits
- Status workflow: `draft → sent → partially_received | received | cancelled` (also `sent → cancelled`, `partially_received → received | cancelled`)
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `purchase-orders.assign`
- Notes (comments) + activity timeline
- Table view with search, status filter, assignee filter, and **My Purchase Orders** toggle
- KPIs via `GET /purchase-orders/stats` (total, mine, draft, sent, partially received, received, cancelled)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:purchase-orders`) + Spatie permissions — **free Marketplace opt-in**, hard-depends on `vendors`
- Audit + activity logging

## Permissions

`purchase-orders.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign` · `send` · `receive` · `cancel`

Enable Purchase Orders from Marketplace (free) — Marketplace blocks the install until **Vendors** is already entitled. Catalog: slug `purchase-orders`, category `purchasing` (Purchasing), `is_default_included = false`, `is_billable = false`, `sort_order = 20`.

## Receiving is acknowledgement only

Marking a purchase order **partially received** or **received** is a status-only acknowledgement. It does **not** post stock movements to an Inventory module — there is no inventory module yet on this platform.

## Convert to expense (soft, Phase 4 Milestone 3)

Sent, partially received, or received purchase orders can be converted to a draft [Expense](/user-guide/expenses-overview) — a one-way, one-time action gated by the `purchase-orders.convert` permission and a **soft** entitlement check on the Expenses module (no hard `module_dependencies` row). See [Purchase Orders — User Guide](/user-guide/purchase-orders#convert-to-expense).

## Explicitly deferred

- Inventory stock posting on receipt
- Purchase order PDFs / e-mail delivery to vendors
- Partial-quantity receiving per line item (status is currently header-level only)
- Dashboard widgets for Purchase Orders
