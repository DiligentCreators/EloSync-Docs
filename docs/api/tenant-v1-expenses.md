# Tenant API v1 — Expenses

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:expenses`, plus permission middleware / policies.

No hard `module_dependencies` — Expenses installs standalone. `vendor_id` and `purchase_order_id` are optional; supplying either requires the corresponding module (`vendors` / `purchase-orders`) to be entitled on the workspace, enforced by `LinkableVendor` / `LinkablePurchaseOrder`.

Assignee scoping: without `expenses.assign` (and not superadmin), list/stats/view/update/**submit**/**cancel** only include expenses where `assigned_to` is the current user. `approve`/`reject`/`pay` are **not** assignee-scoped — any actor holding the specific permission may act on any expense they can otherwise view.

## Stats

### GET `/expenses/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_expenses": 0,
  "my_expenses": 0,
  "draft": 0,
  "submitted": 0,
  "approved": 0,
  "rejected": 0,
  "paid": 0,
  "cancelled": 0,
  "approved_value": 0,
  "paid_value": 0,
  "scope": "org | mine"
}
```

## Expenses CRUD

### GET `/expenses`

Query: `search` (matches `title` or `number`), `status` (`draft`\|`submitted`\|`approved`\|`rejected`\|`paid`\|`cancelled`), `category_id`, `vendor_id`, `purchase_order_id`, `assigned_to` (`unassigned` or user id), `my_expenses`, `trashed` (`true`\|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `status`, `category_id`, embedded `category` (`{ id, name, slug }` when loaded), `amount`, `tax_amount`, `currency`, `expense_date`, `vendor`/`purchase_order` refs (when linked), assignee/creator refs, and `latest_note`.

### POST `/expenses`

Body: `title` (required), `category_id` (optional — tenant `expense_categories` id, must be active; defaults to the seeded **Other** category), `amount` (required), `tax_amount` (optional, default `0`), `currency` (3-letter, default `USD`), `expense_date`, `notes`, `vendor_id` (optional — must belong to the tenant and the Vendors module must be entitled), `purchase_order_id` (optional — must belong to the tenant and the Purchase Orders module must be entitled), `assigned_to`.

Status always starts at `draft`; `number` is auto-generated (`EXP-00001`, configurable via the `expenses_number_prefix` tenant setting). There is no server-computed total — `amount` and `tax_amount` are stored as given.

### GET `/expenses/{id}`

Includes vendor, purchase order, assignee, creator, notes, and timeline activities. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/expenses/{id}`

Partial update of **draft** expenses only. Non-draft expenses return 422 on `status` (`Only draft expenses can be edited.`). Assignment after submit uses `POST /expenses/{id}/assign`.

### DELETE `/expenses/{id}`

Soft delete. Permission: `expenses.delete`.

### POST `/expenses/{id}/restore`

Permission: `expenses.restore`.

### DELETE `/expenses/{id}/force`

Permanently delete a soft-deleted expense. Permission: `expenses.force.delete` (owner/superadmin only by default).

## Actions

### POST `/expenses/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `expenses.assign`.

### POST `/expenses/{id}/submit`

Transitions `draft → submitted`. Permission: `expenses.submit` (assignee-scoped unless the actor has `expenses.assign` or is superadmin).

### POST `/expenses/{id}/approve`

Transitions `submitted → approved`. Permission: `expenses.approve` (not assignee-scoped).

### POST `/expenses/{id}/reject`

Transitions `submitted → rejected` (terminal). Permission: `expenses.reject` (not assignee-scoped).

### POST `/expenses/{id}/pay`

Transitions `approved → paid` (terminal). Permission: `expenses.pay` (not assignee-scoped).

### POST `/expenses/{id}/cancel`

Transitions `draft|submitted → cancelled` (terminal). Permission: `expenses.cancel` (assignee-scoped unless the actor has `expenses.assign` or is superadmin).

### POST `/expenses/{id}/status`

`{ "status": "draft"|"submitted"|"approved"|"rejected"|"paid"|"cancelled" }`

Authorization depends on the target status:
- `submitted` → `expenses.submit`
- `approved` → `expenses.approve`
- `rejected` → `expenses.reject`
- `paid` → `expenses.pay`
- `cancelled` → `expenses.cancel`
- other → `expenses.update`

Rejects disallowed transitions with a 422 validation error on `status`. Records a `status_changed` timeline entry.

### POST `/expenses/{id}/notes`

`{ "body": string }`

Permission: `expenses.update`.

### GET `/expenses/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `note_added`, `deleted`, `restored`).

## Expense categories

Categories use the same `module:expenses` gate and `expenses.*` permissions (no separate permission family). Listing lazy-seeds Travel / Office / Software / Utilities / Other when missing. Starter slugs (`travel|office|software|utilities|other`) are not changed on rename. Listing does not restore a soft-deleted starter except **Other**.

- `GET /expense-categories` — list (`expenses.view`)
- `POST /expense-categories` — create (`expenses.create`). Body: `name` (required); optional `slug`, `sort_order`, `is_active`
- `GET|PUT|DELETE /expense-categories/{expenseCategory}` — view, update, soft-delete (`view` / `update` / `delete`)
- `POST /expense-categories/{expenseCategory}/restore` — restore (`expenses.restore`)
- `DELETE /expense-categories/{expenseCategory}/force` — permanently delete a soft-deleted category (`expenses.force.delete`)

Delete and force-delete return 422 if the category slug is `other`, or if any expenses (including trashed, for force) still reference the category.

## Related: convert a Purchase Order to an Expense

### POST `/purchase-orders/{id}/convert`

Documented under [Tenant Purchase Orders — Convert to expense](/api/tenant-v1-purchase-orders#convert-to-expense-soft-dependency-on-expenses). Requires the Expenses module to be entitled (soft check — 422 if not) and the `purchase-orders.convert` permission. Returns the newly created draft `Expense` (201).
