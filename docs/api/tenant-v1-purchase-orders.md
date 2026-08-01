# Tenant API v1 — Purchase Orders

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:purchase-orders`, plus permission middleware / policies.

Requires the **Vendors** module (hard `module_dependencies` row) — Marketplace blocks installing Purchase Orders on a workspace that doesn't already have Vendors, since every purchase order requires a vendor.

Assignee scoping: without `purchase-orders.assign` (and not superadmin), list/stats/view/update/**send**/**receive**/**cancel** only include purchase orders where `assigned_to` is the current user.

## Stats

### GET `/purchase-orders/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_purchase_orders": 0,
  "my_purchase_orders": 0,
  "draft": 0,
  "sent": 0,
  "partially_received": 0,
  "received": 0,
  "cancelled": 0,
  "scope": "org | mine"
}
```

## Purchase Orders CRUD

### GET `/purchase-orders`

Query: `search` (matches `title` or `number`), `status` (`draft`\|`sent`\|`partially_received`\|`received`\|`cancelled`), `vendor_id`, `assigned_to` (`unassigned` or user id), `my_purchase_orders`, `trashed` (`true`\|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `status`, `currency`, `subtotal`/`tax_total`/`total`, `order_date`, `expected_date`, `vendor` ref, assignee/creator refs, and `latest_note`.

### POST `/purchase-orders`

Body: `vendor_id` (required, must belong to the tenant and the Vendors module must be entitled), `title` (required), `notes`, `currency` (3-letter, default `USD`), `order_date`, `expected_date` (dates), `assigned_to`, `lines` (array of `{ description, quantity, unit_price, tax_rate, sort_order }`).

`subtotal`, `tax_total`, and `total` are computed server-side from `lines` — do not send them. Status always starts at `draft`; `number` is auto-generated (`PO-00001`, configurable via the `purchase_orders_number_prefix` tenant setting).

### GET `/purchase-orders/{id}`

Includes vendor, assignee, creator, lines, notes, and timeline activities.

### PUT `/purchase-orders/{id}`

Partial update of **draft** purchase orders only — including replacing the full `lines` set (recalculates totals). Non-draft purchase orders return 422 on `status` (`Only draft purchase orders can be edited.`). Assignment after send uses `POST /purchase-orders/{id}/assign`.

### DELETE `/purchase-orders/{id}`

Soft delete. Permission: `purchase-orders.delete`.

### POST `/purchase-orders/{id}/restore`

Permission: `purchase-orders.restore`.

### DELETE `/purchase-orders/{id}/force`

Permanently delete a soft-deleted purchase order. Permission: `purchase-orders.force.delete` (owner/superadmin only by default).

## Actions

### POST `/purchase-orders/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `purchase-orders.assign`.

### POST `/purchase-orders/{id}/send`

Transitions `draft → sent`. Backfills `order_date` to today if unset. Permission: `purchase-orders.send` (assignee-scoped unless the actor has `purchase-orders.assign` or is superadmin). **Status-only** — does not email or generate a PDF.

### POST `/purchase-orders/{id}/receive`

`{ "status": "partially_received"|"received" }`

Transitions `sent → partially_received|received` or `partially_received → received`. Any other `status` value is rejected with a 422 before the state machine is even evaluated. Permission: `purchase-orders.receive` (assignee-scoped unless the actor has `purchase-orders.assign` or is superadmin). **Acknowledgement only** — does not post stock movements to Inventory (no Inventory module exists on this platform).

### POST `/purchase-orders/{id}/cancel`

Transitions `draft|sent|partially_received → cancelled`. Permission: `purchase-orders.cancel` (assignee-scoped unless the actor has `purchase-orders.assign` or is superadmin).

### POST `/purchase-orders/{id}/status`

`{ "status": "draft"|"sent"|"partially_received"|"received"|"cancelled" }`

Authorization depends on the target status:
- `sent` → `purchase-orders.send`
- `partially_received` / `received` → `purchase-orders.receive`
- `cancelled` → `purchase-orders.cancel`
- other → `purchase-orders.update`

Rejects disallowed transitions with a 422 validation error on `status`. Records a `status_changed` timeline entry.

### POST `/purchase-orders/{id}/notes`

`{ "body": string }`

Permission: `purchase-orders.update`.

### GET `/purchase-orders/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `note_added`, `deleted`, `restored`, `converted`).

## Convert to expense (soft dependency on Expenses)

### POST `/purchase-orders/{id}/convert`

Permission: `purchase-orders.convert`.

Creates a **draft** `Expense` from the purchase order and returns it (201). Requires the **Expenses** module to be entitled on the workspace — this is a soft, call-time check (no `module_dependencies` row), so Purchase Orders keeps working with Expenses uninstalled and this single endpoint returns a 422 until Expenses is installed:

```json
{
  "message": "The Expenses module is not available for this workspace.",
  "errors": { "purchase_order": ["The Expenses module is not available for this workspace."] }
}
```

Other failure cases (also 422):
- The purchase order's `status` is not `sent`, `partially_received`, or `received` (`draft` and `cancelled` are not convertible).
- The purchase order has already been converted (one-time — checked by an existing `Expense` row with this `purchase_order_id`, including soft-deleted ones).

Field mapping onto the new expense: `title` ← PO `title`, `amount` ← PO `total`, `tax_amount` ← PO `tax_total`, `currency`/`vendor_id`/`assigned_to`/`notes` ← copied from the PO, `category` is always `other`, `expense_date` defaults to today. The conversion is recorded as a `converted` timeline entry on the purchase order and the created expense's id is exposed on the purchase order resource as `converted_expense_id` once loaded.
