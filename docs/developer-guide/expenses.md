# Expenses — Developer Guide

Simplified mirror of [Purchase Orders](/developer-guide/purchase-orders) / [Estimates](/developer-guide/estimates) (numbering, status machine, assignee scoping, notes, domain timeline) — no line-item child table (single `amount` + `tax_amount` MVP), and **no** hard module dependencies. `vendor_id` and `purchase_order_id` are both nullable soft links, validated only when the corresponding module is entitled.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Expense.php`, `ExpenseCategory`, `ExpenseNote`, `ExpenseActivity` |
| Enums | `ExpenseStatusEnum`, `ExpenseActivityTypeEnum` |
| Service | `app/Services/Tenant/ExpenseService.php` (+ `ScopesToAssignee`, `RetriesOnDuplicateNumber`), `ExpenseCategoryService`, `ExpenseCategorySeederService` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ExpenseController.php`, `ExpenseCategoryController` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Expense/*`, `ExpenseCategory/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Expense/*`, `ExpenseCategory/*` |
| Policy | `app/Policies/ExpensePolicy.php`, `ExpenseCategoryPolicy` (maps to `expenses.*`) |
| Events | `app/Events/Expense*.php` |
| Subscriber | `app/Listeners/ExpenseEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Expense/ExpenseAssignedNotification.php` |
| Link rules | `app/Rules/LinkableVendor.php` (reused), `app/Rules/LinkablePurchaseOrder.php` — both optional, tenant-scoped, module-entitlement-checked |
| Assignee rule | `app/Rules/EligibleExpenseAssignee.php` |
| Factories | `ExpenseFactory`, `ExpenseCategoryFactory`, `ExpenseNoteFactory`, `ExpenseActivityFactory` |
| Tests | `tests/Feature/Tenant/Expense/ExpenseTest.php`, `ExpenseCategoryTest.php` |
| Migrations | `database/migrations/2026_08_01_130000_create_expenses_table.php` … `130005_add_purchase_orders_convert_permission.php`; `2026_08_13_171652`+ expense categories + catalog bump `1.0.0 → 1.1.0` |

## Domain notes

- **No hard module dependency**: Expenses has no `module_dependencies` row — it's installable standalone, unlike Purchase Orders → Vendors. `vendor_id` / `purchase_order_id` are both nullable columns.
- **Tenant categories**: `expense_categories` lookup (name, slug, `sort_order`, `is_active`, soft deletes). `expenses.category_id` is a nullable FK. Category CRUD reuses `expenses.view|create|update|delete|restore|force.delete` — no `expense-categories.*` family. `ExpenseCategorySeederService::ensureDefaults()` lazily inserts Travel / Office / Software / Utilities / Other (slugs `travel|office|software|utilities|other`) on first list/create/PO convert; lazy seed does not write activity. Starter slugs are immutable on update. **Other** cannot be soft- or force-deleted (422). Listing does not restore deleted Travel/Office/Software/Utilities; only a missing/trashed **Other** is restored (PO convert / create default). Delete/forceDelete is also blocked while any expenses (including trashed, for force) still reference the category. Spatie log name `expense-categories`. Catalog version **1.1.0**.
- Status machine lives on `ExpenseStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → submitted|cancelled`, `submitted → approved|rejected|cancelled`, `approved → paid`, `rejected`/`paid`/`cancelled` are terminal. `ExpenseService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions.
- Content updates (`PUT`) are **draft-only** via `Expense::isEditable()` (`status === draft`). Assignment remains available after submit via `POST …/assign`.
- `submit()` / `cancel()` are assignee-scoped in `ExpensePolicy` (same as `view` / `update`) unless the actor has `expenses.assign` or is superadmin. `approve()` / `reject()` / `pay()` are **not** assignee-scoped — any actor with the specific permission can act, modeling an approver distinct from the submitter.
- `POST …/status` route middleware requires `expenses.update`; the controller then re-checks the specific gate per target status (`submitted` → `submit`, `approved` → `approve`, `rejected` → `reject`, `paid` → `pay`, `cancelled` → `cancel`, otherwise `update`) before delegating to `ExpenseService::changeStatus()` — same pattern as Purchase Orders.
- `vendor_id` validated via `LinkableVendor` (reused from Vendors/Purchase Orders — always optional here), `purchase_order_id` via the new `LinkablePurchaseOrder`. Both fail closed: null/absent value always passes; a non-null value requires the module to be entitled, the record to belong to the tenant, and (unless the actor has the `*.assign` permission or is superadmin) the record to be assigned to the actor.
- No line-item child table — `amount` and `tax_amount` are plain decimal columns set directly from the request; there's no server-side computed total (the frontend renders `amount + tax_amount` for display).
- `expenses.force.delete` is not granted to any default role — owner/superadmin only.
- Auto-numbering: `ExpenseService::nextNumber()` reads the `expenses_number_prefix` tenant setting (default `EXP-`), then zero-pads a running count to 5 digits — same pattern as Purchase Orders/Estimates/Invoices/Payments. Exposed via `PUT /settings` (`UpdateTenantSettingsRequest`). `expenses` has a `unique(tenant_id, number)` DB index; `create()` retries up to 3 times via the shared `RetriesOnDuplicateNumber` trait on a duplicate-key collision.

## Convert-from-Purchase-Order (soft)

`PurchaseOrderService::convertToExpense()` mirrors `EstimateService::convert()`'s pattern but the module check is **soft** (no `module_dependencies` row) rather than a hard dependency gate:

1. Resolves the purchase order's tenant and checks `EntitlementService::hasModule($tenant, 'expenses')` — throws a 422 `ValidationException` (`purchase_order` field) if Expenses isn't entitled, rather than a hard 403 at the module-middleware layer.
2. Checks for an existing `Expense::withTrashed()->where('purchase_order_id', $purchaseOrder->id)` — throws a 422 if one already exists (one-time).
3. Checks `PurchaseOrder::isConvertible()` (status is `sent`, `partially_received`, or `received`) — throws a 422 otherwise. Draft orders haven't incurred real spend yet; cancelled orders shouldn't become payable expenses.
4. Creates a **draft** `Expense` inside a DB transaction: `title` = PO title, `category_id` defaults to the seeded **Other** category, `amount` = PO `total`, `tax_amount` = PO `tax_total`, `currency`/`vendor_id`/`assigned_to`/`notes` copied from the PO, `purchase_order_id` = PO id, `expense_date` = today.
5. Records a `PurchaseOrderActivityTypeEnum::Converted` activity on the purchase order and fires `PurchaseOrderConverted`.

Exposed via `POST /purchase-orders/{purchaseOrder}/convert`, gated by `middleware('can:purchase-orders.convert')` at the route level (an ordinary Spatie permission, not a module-dependency check) plus `Gate::authorize('convert', $purchaseOrder)` in the controller. `PurchaseOrder::convertedExpense()` is a `hasOne(Expense::class)` relation; `ListPurchaseOrderResource` exposes `converted_expense_id` (null until converted) so the frontend can hide the button and show a link instead.

## Permissions

```
expenses.view | create | update | delete | restore | force.delete | assign | submit | approve | reject | pay | cancel
purchase-orders.convert
```

Routes use `module:expenses` then `can:expenses.*` / policies. The convert route lives under the existing `module:purchase-orders` group and only needs `can:purchase-orders.convert` — the Expenses module check happens in the service layer (soft), not route middleware (hard).

Catalog: slug `expenses`, category `purchasing`, `is_default_included = false`, `is_billable = false`, `sort_order = 30`, version **1.1.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only) — **no** `module_dependencies` row. Category CRUD is a MINOR bump (`1.0.0 → 1.1.0`).

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-expenses.md](/api/tenant-v1-expenses). Convert endpoint documented in [tenant-v1-purchase-orders.md](/api/tenant-v1-purchase-orders).

## Frontend

SPA mirrors **Purchase Orders** (table + create/edit page, record page) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path |
|-------|------|
| Page | `src/pages/expenses/` (`expenses-page.tsx`, `expense-form-dialog.tsx`, `expense-detail-sheet.tsx`, `expense-categories-dialog.tsx`) |
| Detail sheet | Overview (category name, amount/tax/total, date, assignee, related vendor/PO), notes, timeline — actions: assign, add note, submit, approve, reject, mark as paid, cancel, edit (draft only), delete |
| Form dialog | Title, category picker (`category_id`, active categories), amount, tax amount, currency, expense date, notes, and **conditional** vendor / purchase order pickers (`SearchableSelect`) shown only when `hasModule('vendors')` / `hasModule('purchase-orders')` is true |
| Service | `expenseService` + `expenseCategoryService` in `src/api/services.ts`; `purchaseOrderService.convert()` for the PO action |
| Types | `Expense*` / `ExpenseCategory*` in `src/types/api.ts`; `PurchaseOrder.converted_expense_id` added for the convert UI |
| Query keys | `QUERY_KEYS.expenses` / `expense(id)` / `expenseTimeline(id)` / `expenseStats` / `expenseCategories` |
| Permissions | `PERMISSIONS.expenses.*` (maps to `expenses.*` permission strings); **Manage categories** is `create` **or** `update` **or** `delete`; `PERMISSIONS.purchaseOrders.convert` reused for the PO action |
| Nav | **Purchasing** sidebar group, after Purchase Orders — `permission: PERMISSIONS.expenses.view`, `module: 'expenses'` |
| Route | `tenantRoutes.expenses = '/expenses'`, lazy-loaded in `App.tsx` behind `RequireAccess module="expenses"` |
| Notifications | `src/notifications/modules/expenses.ts` — `expense.assigned` → `/expenses?expense={id}` |
| PO record page | `purchase-order-detail-sheet.tsx` renders a **Convert to expense** button when `hasModule('expenses') && hasPermission('purchase-orders.convert')` and the PO status is convertible and not already converted; shows a link to the created expense afterward |
| Playwright | `e2e/pages/expenses.page.ts`, `e2e/tests/expenses/`, `npm run test:e2e:expenses` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Expense/ExpenseTest.php
php artisan test --compact tests/Feature/Tenant/Expense/ExpenseCategoryTest.php
php artisan test --compact tests/Feature/Tenant/PurchaseOrder/PurchaseOrderTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:expenses
```

## Logging

- Spatie `LogsActivity` on `Expense` (log name `expenses`)
- Domain `expense_activities` timeline
- `PlatformAuditService` via `ExpenseEventSubscriber`

## Intentional differences from Purchase Orders

| Purchase Orders | Expenses |
|-----------------|----------|
| Required `vendor_id`, hard-depends on Vendors | Optional `vendor_id` **and** `purchase_order_id`, no hard dependencies |
| Line-item child table, server-computed totals | Single `amount` + `tax_amount`, no computed total column |
| Statuses: `draft → sent → partially_received\|received\|cancelled` | Statuses: `draft → submitted → approved\|rejected`, `approved → paid`, `draft\|submitted → cancelled` |
| `send` / `receive` / `cancel` actions, no convert | `submit` / `approve` / `reject` / `pay` / `cancel` actions; **is itself** the target of a convert action |
| approve/reject/pay N/A | `approve`/`reject`/`pay` are not assignee-scoped — any holder of the permission can act, modeling an approver role |

## Deferred

- Receipt attachments / file uploads
- Reimbursement / payout tracking beyond the `paid` status
- General ledger (GL) posting / accounting integration
- Multi-line (itemized) expenses
- Dashboard widgets for Expenses
