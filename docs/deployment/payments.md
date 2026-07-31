# Payments — Production Guide

## Licensing

- Catalog slug: `payments`
- Category: **Billing** (`billing`)
- **Free Marketplace opt-in** (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 20`
- **Hard dependency on Invoices** — declares a required `module_dependencies` row on `invoices`; Marketplace blocks installing Payments on a workspace that doesn't already have Invoices entitled

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules only (Payments is never auto-installed)
2. Operators must enable **Invoices** before Payments becomes installable from Marketplace
3. Tenant permissions include `payments.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Payments permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` (see `database/migrations/2026_07_31_221005_add_payments_permissions.php`). Do **not** re-seed roles.

## Monitoring

- Platform audit events: `customer_payment_created`, `customer_payment_updated`, `customer_payment_deleted`, `customer_payment_assigned`, `customer_payment_status_changed`, `customer_payment_note_added`
- Notifications: assignment via `CustomerPaymentAssignedNotification`
- Posting/voiding a payment updates linked `CustomerInvoice` balances synchronously in the same request — no queued job to monitor

## Deploy checklist

1. Migrate tables (`customer_payments`, `customer_payment_allocations`, `customer_payment_notes`, `customer_payment_activities`)
2. Register the `payments` catalog module via migration (`DefaultModuleRegistrar`) as free Billing opt-in — **not** `db:seed`
3. Run the `module_dependencies` migration that links `payments` → `invoices` (required)
4. Run the payments permissions migration so default roles receive missing `payments.*` grants
5. Confirm `module:payments` + `payments.*` permissions on target roles
6. Deploy Frontend SPA with Payments nav (Billing sidebar group, after Invoices) — verify a workspace **without** Invoices installed cannot install Payments from Marketplace
7. Verify posting a payment correctly advances the linked invoice(s) to `partial`/`paid`, and voiding reverses it, in a staging smoke test before rollout
