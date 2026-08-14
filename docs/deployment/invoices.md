# Invoices — Production Guide

## Licensing

- Catalog slug: `invoices`
- Category: **Billing** (`billing`)
- **Free Marketplace opt-in** (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 10`
- Catalog version: **1.1.0** (recurring series + PDF download)
- **No hard dependency** — unlike Quotations/Contracts, Invoices does **not** require Opportunities (or any other module) and can be installed standalone
- The **Payments** module (shipped — see [deployment/payments.md](/deployment/payments)) declares a required `module_dependencies` row on Invoices, so Invoices must be installed first before a workspace can enable Payments

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules only (Invoices is never auto-installed)
2. Operators enable Invoices from Marketplace at any time — no prerequisite module install order
3. Tenant permissions include `invoices.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Invoices permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` (see `database/migrations/2026_07_31_220005_add_invoices_permissions.php`). Do **not** re-seed roles.

## Monitoring

- Platform audit events: `customer_invoice_created`, `customer_invoice_updated`, `customer_invoice_deleted`, `customer_invoice_assigned`, `customer_invoice_status_changed`, `customer_invoice_note_added`
- Notifications: assignment via `CustomerInvoiceAssignedNotification`

## Scheduler

- `invoices:generate-recurring` daily (`withoutOverlapping(120)`, `onOneServer`) — for entitled workspaces, creates **draft** occurrences when `recurrence_next_issue_on` is due in the **workspace timezone**. Skips tenants without Invoices installed.

## Deploy checklist

1. Migrate tables (`customer_invoices`, `customer_invoice_lines`, `customer_invoice_notes`, `customer_invoice_activities`)
2. Register the `invoices` catalog module via migration (`DefaultModuleRegistrar`) as free Billing opt-in — **not** `db:seed`
3. Run invoices permissions migration so default roles receive missing `invoices.*` grants
4. Confirm `module:invoices` + `invoices.*` permissions on target roles
5. Deploy Frontend SPA with Invoices nav (new **Billing** sidebar group)/pages (mirror Quotations table + form) when the SPA ships
6. Confirm scheduler includes `invoices:generate-recurring`
7. Payments (shipped) declares a `module_dependencies` row on `invoices` — confirm it blocks install on workspaces without Invoices entitled (see [deployment/payments.md](/deployment/payments))
