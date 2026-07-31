# Estimates — Production Guide

## Licensing

- Catalog slug: `estimates`
- Category: **Billing** (`billing`)
- **Free Marketplace opt-in** (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 40`
- **Hard dependency on Invoices** — declares a required `module_dependencies` row on `invoices`; Marketplace blocks installing Estimates on a workspace that doesn't already have Invoices entitled

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules only (Estimates is never auto-installed)
2. Operators must enable **Invoices** before Estimates becomes installable from Marketplace
3. Tenant permissions include `estimates.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Estimates permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` (see `database/migrations/2026_07_31_223005_add_estimates_permissions.php`). Do **not** re-seed roles.

## Monitoring

- Platform audit events: `estimate_created`, `estimate_updated`, `estimate_deleted`, `estimate_assigned`, `estimate_status_changed`, `estimate_converted`, `estimate_note_added`
- Notifications: assignment via `EstimateAssignedNotification`
- Converting an estimate creates a draft `CustomerInvoice` and updates the estimate's status synchronously in the same request — no queued job to monitor

## Deploy checklist

1. Migrate tables (`estimates`, `estimate_lines`, `estimate_notes`, `estimate_activities`)
2. Register the `estimates` catalog module via migration (`DefaultModuleRegistrar`) as free Billing opt-in — **not** `db:seed`
3. Run the `module_dependencies` migration that links `estimates` → `invoices` (required)
4. Run the migration that adds the `customer_invoices.estimate_id` foreign key (`2026_07_31_223007_add_estimate_foreign_key_to_customer_invoices_table.php`) — requires the `estimates` table to already exist
5. Run the estimates permissions migration so default roles receive missing `estimates.*` grants
6. Confirm `module:estimates` + `estimates.*` permissions on target roles
7. Deploy Frontend SPA with Estimates nav (Billing sidebar group, after Credit Notes) — verify a workspace **without** Invoices installed cannot install Estimates from Marketplace
8. Verify converting an estimate correctly creates a linked draft invoice and marks the estimate **Accepted**, in a staging smoke test before rollout

::: warning MySQL identifier length
The `customer_invoice_activities`, `customer_payment_activities`, and `customer_credit_note_activities` migrations from this same Phase 3 batch originally generated composite index names that exceeded MySQL's 64-character identifier limit (`{table}_tenant_id_{fk}_created_at_index`), as did the `customer_payment_allocations` unique constraint and the `customer_credit_note_notes` / `customer_credit_note_lines` indexes. These were given explicit, shorter index names before this module shipped — if you're migrating an environment that already partially applied the original migrations, drop the affected tables first so they can be recreated with the corrected index names.
:::
