# Credit Notes — Production Guide

## Licensing

- Catalog slug: `credit-notes`
- Category: **Billing** (`billing`)
- **Free Marketplace opt-in** (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 30`
- **Hard dependency on Invoices** — declares a required `module_dependencies` row on `invoices`; Marketplace blocks installing Credit Notes on a workspace that doesn't already have Invoices entitled

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules only (Credit Notes is never auto-installed)
2. Operators must enable **Invoices** before Credit Notes becomes installable from Marketplace
3. Tenant permissions include `credit-notes.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Credit Notes permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` (see `database/migrations/2026_07_31_222005_add_credit_notes_permissions.php`). Do **not** re-seed roles.

## Monitoring

- Platform audit events: `customer_credit_note_created`, `customer_credit_note_updated`, `customer_credit_note_deleted`, `customer_credit_note_assigned`, `customer_credit_note_status_changed`, `customer_credit_note_note_added`
- Notifications: assignment via `CustomerCreditNoteAssignedNotification`
- Issuing/applying/voiding a credit note updates the linked `CustomerInvoice` balance synchronously in the same request — no queued job to monitor

## Deploy checklist

1. Migrate tables (`customer_credit_notes`, `customer_credit_note_lines`, `customer_credit_note_notes`, `customer_credit_note_activities`)
2. Register the `credit-notes` catalog module via migration (`DefaultModuleRegistrar`) as free Billing opt-in — **not** `db:seed`
3. Run the `module_dependencies` migration that links `credit-notes` → `invoices` (required)
4. Run the credit notes permissions migration so default roles receive missing `credit-notes.*` grants
5. Confirm `module:credit-notes` + `credit-notes.*` permissions on target roles
6. Deploy Frontend SPA with Credit Notes nav (Billing sidebar group, after Payments) — verify a workspace **without** Invoices installed cannot install Credit Notes from Marketplace
7. Verify applying a credit note correctly increases the linked invoice's `amount_credited` and reduces `balance_due`, in a staging smoke test before rollout
