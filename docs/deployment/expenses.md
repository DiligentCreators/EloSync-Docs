# Expenses — Production Guide

## Licensing

- Catalog slug: `expenses`
- Category: `purchasing` (**Purchasing**), `category_sort_order = 40`, `sort_order = 30`
- **Free Marketplace opt-in** module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`
- **No hard module dependency** — Expenses installs standalone; Vendors and Purchase Orders are optional soft links, only offered in the UI (and only validated) when already entitled
- New workspaces receive only **Leads** + **Tasks** by default; enable Expenses from Marketplace at any time, independent of Vendors / Purchase Orders
- Existing workspaces that already have Expenses keep their subscription
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks** only)
2. Operators enable **Expenses** from Marketplace whenever needed — no prerequisite modules
3. Tenant permissions include `expenses.*` via `config/tenant-permissions.php` / default role maps
4. `purchase-orders.convert` ships alongside Expenses (same migration wave) so existing Purchase Orders installs can surface the convert action once Expenses is also enabled

No stage or status seeder — expense status defaults to `draft` at creation time and advances via the state machine. Expense categories (Travel / Office / Software / Utilities / Other) are lazy-seeded on first category list, expense create, or PO convert — not via `db:seed`.

## Permissions rollout

New Expenses permissions (and `purchase-orders.convert`) for **existing** workspaces must ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Tenant settings

`expenses_number_prefix` (default `EXP-`) controls the auto-generated `number` prefix, same mechanism as `purchase_orders_number_prefix`. Updatable via `PUT /api/tenant/v1/settings`.

## Monitoring

- Platform audit events: `expense_created`, `expense_updated`, `expense_deleted`, `expense_assigned`, `expense_status_changed`, `expense_note_added`, `expense_restored`
- Spatie activity log name `expense-categories` for category CRUD (lazy seed is quiet)
- Notifications: assignment (mail + database) via `ExpenseAssignedNotification`
- Tenant mail settings with Central SMTP fallback

## Deploy checklist

1. Migrate expense tables (`expenses`, `expense_notes`, `expense_activities`, `expense_categories`) and catalog bump **1.0.0 → 1.1.0** — **before** deploying the SPA (`category` string → `category_id` + embed)
2. Register the `expenses` catalog module (migration, not seeder) as free opt-in under the `purchasing` category — **no** `module_dependencies` row
3. Migrate the `purchase-orders.convert` permission and grant it to existing `admin`/`manager` roles
4. Confirm `module:expenses` + `expenses.*` permissions on target roles (category CRUD reuses the same permissions)
5. Deploy frontend (Expenses nav item under **Purchasing**, after Purchase Orders — list/form/detail + **Manage categories**; Convert to expense button on the Purchase Order detail sheet)
6. Smoke: create a **new** workspace → enable Expenses (alone, no other Purchasing modules) → Manage categories → create a custom category → create/edit/assign/note an expense → submit → approve → mark as paid → soft delete/restore
7. Smoke (soft convert): on a workspace with Vendors + Purchase Orders + Expenses all enabled → create a purchase order → send it → **Convert to expense** → confirm a draft expense with the PO's amount/vendor and **Other** category was created and the action is now hidden
8. Smoke (soft-gate off): on a workspace with Purchase Orders but **without** Expenses enabled → confirm the Convert button does not appear and the API returns a clear error if called directly

## Phase 4 roadmap context

Expenses is Milestone 3 (final) of **Phase 4 Purchasing**. Unlike Vendors → Purchase Orders (hard dependency chain), Expenses has no hard dependencies — Vendors and Purchase Orders links are soft/optional, and the Purchase-Order-to-Expense convert action is a soft cross-module integration (entitlement check at call time, not a `module_dependencies` row). This completes Phase 4. See [module-dependencies.md](/architecture/module-dependencies) and [product-roadmap.md](/getting-started/product-roadmap).
