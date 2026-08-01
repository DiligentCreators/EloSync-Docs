# Purchase Orders — Production Guide

## Licensing

- Catalog slug: `purchase-orders`
- Category: `purchasing` (**Purchasing**), `category_sort_order = 40`, `sort_order = 20`
- **Free Marketplace opt-in** module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`
- **Hard dependency on Vendors** — Marketplace blocks installing Purchase Orders on a workspace that doesn't already have Vendors entitled
- New workspaces receive only **Leads** + **Tasks** by default; enable Vendors, then Purchase Orders, from Marketplace
- Existing workspaces that already have Purchase Orders keep their subscription
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks** only)
2. Operators enable **Vendors** first, then **Purchase Orders**, from Marketplace (free / non-billable install activates immediately)
3. Tenant permissions include `purchase-orders.*` via `config/tenant-permissions.php` / default role maps

No stage or status seeder — purchase order status defaults to `draft` at creation time and advances via the state machine.

## Permissions rollout

New Purchase Orders permissions for **existing** workspaces must ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Tenant settings

`purchase_orders_number_prefix` (default `PO-`) controls the auto-generated `number` prefix, same mechanism as `estimates_number_prefix`. Updatable via `PUT /api/tenant/v1/settings`.

## Monitoring

- Platform audit events: `purchase_order_created`, `purchase_order_updated`, `purchase_order_deleted`, `purchase_order_assigned`, `purchase_order_status_changed`, `purchase_order_note_added`, `purchase_order_restored`
- Notifications: assignment (mail + database) via `PurchaseOrderAssignedNotification`
- Tenant mail settings with Central SMTP fallback

## Deploy checklist

1. Migrate purchase order tables (`purchase_orders`, `purchase_order_lines`, `purchase_order_notes`, `purchase_order_activities`)
2. Register the `purchase-orders` catalog module (migration, not seeder) as free opt-in under the `purchasing` category, with a `module_dependencies` row on `vendors`
3. Confirm `module:purchase-orders` + `purchase-orders.*` permissions on target roles
4. Deploy frontend (Purchase Orders nav item under **Purchasing**, after Vendors — list/form/detail)
5. Smoke: create a **new** workspace → enable Vendors, then Purchase Orders, from Marketplace → create a vendor → create/edit/assign/note a purchase order → send → mark partially received → mark received → soft delete/restore

## Convert to expense (soft, Milestone 3)

Once the **Expenses** module is also enabled, `sent`/`partially_received`/`received` purchase orders can be converted to a draft Expense via `POST /purchase-orders/{id}/convert`, gated by the `purchase-orders.convert` permission and a soft (call-time) entitlement check — not a hard `module_dependencies` row. See [Expenses — Production Guide](/deployment/expenses).

## Phase 4 roadmap context

Purchase Orders is Milestone 2 of **Phase 4 Purchasing**, hard-depending on Vendors (Milestone 1). Expenses (Milestone 3, final) has a soft dependency on Vendors and Purchase Orders and adds the convert-from-purchase-order action described above. Phase 4 Purchasing is now complete. See [module-dependencies.md](/architecture/module-dependencies) and [product-roadmap.md](/getting-started/product-roadmap).
