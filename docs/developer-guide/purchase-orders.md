# Purchase Orders — Developer Guide

Mirror of the [Estimates developer guide](/developer-guide/estimates) (assignee scope, notes, domain timeline, hard module dependency, first-class `lines` child table, status machine) and the optional related-record pickers — swapped for a single **required** `vendor_id`. A **soft** convert-to-expense action was added in Phase 4 Milestone 3 (see [Expenses developer guide](/developer-guide/expenses)). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/PurchaseOrder.php`, `PurchaseOrderLine`, `PurchaseOrderNote`, `PurchaseOrderActivity` |
| Enums | `PurchaseOrderStatusEnum`, `PurchaseOrderActivityTypeEnum` |
| Service | `app/Services/Tenant/PurchaseOrderService.php` (+ `ScopesToAssignee`, `RetriesOnDuplicateNumber`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/PurchaseOrderController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/PurchaseOrder/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/PurchaseOrder/*` |
| Policy | `app/Policies/PurchaseOrderPolicy.php` |
| Events | `app/Events/PurchaseOrder*.php` |
| Subscriber | `app/Listeners/PurchaseOrderEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/PurchaseOrder/PurchaseOrderAssignedNotification.php` |
| Link rule | `app/Rules/LinkableVendor.php` — `vendor_id` is required, tenant-scoped, and validates the Vendors module is entitled |
| Dependency migration | `database/migrations/2026_08_01_120006_add_purchase_orders_vendors_dependency.php` (mirrors estimates → invoices) |
| Convert | `PurchaseOrderService::convertToExpense()` (soft Expenses entitlement check, no hard dependency) — see [Expenses developer guide](/developer-guide/expenses#convert-from-purchase-order-soft) |
| Convert permission migration | `database/migrations/2026_08_01_130005_add_purchase_orders_convert_permission.php` |
| Factories | `PurchaseOrderFactory`, `PurchaseOrderLineFactory`, `PurchaseOrderNoteFactory`, `PurchaseOrderActivityFactory` |
| Tests | `tests/Feature/Tenant/PurchaseOrder/PurchaseOrderTest.php`, `tests/Feature/Central/Module/PurchaseOrdersModuleDependencyTest.php` |

## Domain notes

- **Hard dependency**: Purchase Orders declares a required `module_dependencies` row on Vendors — Marketplace install is blocked until Vendors is entitled, same pattern as Estimates → Invoices.
- Status machine lives on `PurchaseOrderStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → sent|cancelled`, `sent → partially_received|received|cancelled`, `partially_received → received|cancelled`, `received`/`cancelled` are terminal. `PurchaseOrderService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions.
- `send()` backfills `order_date` to today if it wasn't already set, then transitions `draft → sent`.
- `receive()` only accepts a target status of `partially_received` or `received` — any other value throws a 422 validation error before even checking the state machine.
- Content updates (`PUT`) and line sync are **draft-only** via `PurchaseOrder::isEditable()` (`status === draft`). Assignment remains available after send via `POST …/assign`.
- `POST …/status` route middleware requires `purchase-orders.update`; the controller then re-checks the specific gate per target status (`sent` → `send`, `partially_received`/`received` → `receive`, `cancelled` → `cancel`, otherwise `update`) before delegating to `PurchaseOrderService::changeStatus()`.
- `send` / `receive` / `cancel` policies are assignee-scoped (same as `view` / `update`) unless the actor has `purchase-orders.assign` or is superadmin.
- Lines are a first-class child table (`purchase_order_lines`), not embedded JSON — each row is `{ description, quantity, unit_price, tax_rate, sort_order }`. `subtotal`/`tax_total`/`total` are recomputed server-side from lines on create/update, same as Estimates/Invoices/Quotations.
- Assignee scoping via `ScopesToAssignee` with `purchase-orders.assign`.
- `purchase-orders.force.delete` is not granted to any default role — owner/superadmin only.
- `vendor_id` is **required** (unlike Estimates' optional contact/company) and validated via `LinkableVendor` — must exist, belong to the tenant, and the Vendors module must be entitled.
- Auto-numbering: `PurchaseOrderService::nextNumber()` reads the `purchase_orders_number_prefix` tenant setting (default `PO-`), then zero-pads a running count to 5 digits — same pattern as Estimates/Invoices/Payments. Exposed via `PUT /settings` (`UpdateTenantSettingsRequest`), not yet surfaced in the Tenant Settings UI. `purchase_orders` has a `unique(tenant_id, number)` DB index; `create()` retries up to 3 times via the shared `RetriesOnDuplicateNumber` trait on a duplicate-key collision.
- **Receiving is acknowledgement only** — `receive()` does not post stock movements to an Inventory module (none exists on this platform yet).
- **Convert to expense is soft, one-way, one-time**: `PurchaseOrderService::convertToExpense()` checks `EntitlementService::hasModule($tenant, 'expenses')` at call time (not a hard `module_dependencies` row), rejects if an `Expense` already references this `purchase_order_id` (`withTrashed()` check), and only allows `sent`/`partially_received`/`received` source statuses via `PurchaseOrder::isConvertible()`. `PurchaseOrder::convertedExpense()` (`hasOne`) and `ListPurchaseOrderResource.converted_expense_id` let the frontend hide the action once used.

## Permissions

```
purchase-orders.view | create | update | delete | restore | force.delete | assign | send | receive | cancel | convert
```

Routes use `module:purchase-orders` then `can:purchase-orders.*` / policies.

Catalog: slug `purchase-orders`, category `purchasing`, `is_default_included = false`, `is_billable = false`, `sort_order = 20`. Registered via `DefaultModuleRegistrar` migration (migrate-only), with a follow-up migration inserting the `module_dependencies` row on `vendors`.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-purchase-orders.md](/api/tenant-v1-purchase-orders).

## Frontend

SPA mirrors **Estimates** (table + form dialog, detail sheet) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path |
|-------|------|
| Page | `src/pages/purchase-orders/` (`purchase-orders-page.tsx`, `purchase-order-form-dialog.tsx`, `purchase-order-detail-sheet.tsx`) |
| Detail sheet | Overview (vendor, totals, dates, assignee, related converted expense), line items, notes, timeline — actions: assign, add note, send, mark partially received, mark received, cancel, convert to expense (soft), edit (draft only), delete |
| Form dialog | Title, required vendor picker (`SearchableSelect` backed by `vendorService.list()`), currency, order date, expected date, notes, and a line-items editor (`useFieldArray`) with live subtotal/tax/total preview |
| Service | `purchaseOrderService` in `src/api/services.ts` |
| Types | `PurchaseOrder*` in `src/types/api.ts` |
| Query keys | `QUERY_KEYS.purchaseOrders` / `purchaseOrder(id)` / `purchaseOrderTimeline(id)` / `purchaseOrderStats` |
| Permissions | `PERMISSIONS.purchaseOrders.*` (maps to `purchase-orders.*` permission strings) |
| Nav | **Purchasing** sidebar group, after Vendors — `permission: PERMISSIONS.purchaseOrders.view`, `module: 'purchase-orders'` |
| Route | `tenantRoutes.purchaseOrders = '/purchase-orders'`, lazy-loaded in `App.tsx` behind `RequireAccess module="purchase-orders"` |
| Notifications | `src/notifications/modules/purchase-orders.ts` — `purchase-order.assigned` → `/purchase-orders?purchase_order={id}` |
| Playwright | `e2e/pages/purchase-orders.page.ts`, `e2e/tests/purchase-orders/`, `npm run test:e2e:purchase-orders` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/PurchaseOrder/PurchaseOrderTest.php tests/Feature/Central/Module/PurchaseOrdersModuleDependencyTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:purchase-orders
```

## Logging

- Spatie `LogsActivity` on `PurchaseOrder` (log name `purchase-orders`)
- Domain `purchase_order_activities` timeline
- `PlatformAuditService` via `PurchaseOrderEventSubscriber`

## Intentional differences from Estimates

| Estimates | Purchase Orders |
|-----------|------------------|
| Optional `contact_id`/`company_id`/`opportunity_id`/`quotation_id` | Single **required** `vendor_id` |
| Hard-depends on Invoices | Hard-depends on **Vendors** |
| `convert()` → draft `CustomerInvoice` (hard dependency) | `convertToExpense()` → draft `Expense` (**soft** entitlement check, no hard dependency) |
| Statuses: `draft → sent → accepted\|rejected\|expired` | Statuses: `draft → sent → partially_received\|received\|cancelled` |
| `accept` / `send` / `convert` actions | `send` / `receive` / `cancel` / `convert` actions |

## Deferred

- Inventory stock posting on receipt (no Inventory module exists yet)
- Per-line partial receiving
- Dashboard widgets for Purchase Orders
- Communication template placeholders for Purchase Orders
