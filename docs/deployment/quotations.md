# Quotations — Production Guide

## Licensing

- Catalog slug: `quotations`
- Category: **Sales** (`sales`)
- **Free Marketplace opt-in** (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 50`
- **Hard dependency**: requires the **Opportunities** module — install is blocked at the Marketplace/API level until Opportunities is entitled
- Existing workspaces that already have Quotations keep their subscription (policy change does not uninstall)

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules only (Quotations is never auto-installed)
2. Operators enable Opportunities first, then Quotations, from Marketplace (free / non-billable install activates immediately)
3. Tenant permissions include `quotations.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Quotations permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles.

## Monitoring

- Platform audit events: `quotation_created`, `quotation_updated`, `quotation_deleted`, `quotation_assigned`, `quotation_status_changed`, `quotation_converted`, `quotation_note_added`
- Notifications: assignment via `QuotationAssignedNotification`

## Deploy checklist

1. Migrate tables (`quotations`, `quotation_lines`, `quotation_notes`, `quotation_activities`)
2. Register the `quotations` catalog module via migration (`DefaultModuleRegistrar`) as free Sales opt-in — **not** `db:seed`
3. Register the hard dependency row (`quotations` → `opportunities`) via migration
4. Run quotations permissions migration so default roles receive missing `quotations.*` grants
5. Confirm `module:quotations` + `quotations.*` permissions on target roles
6. Deploy Frontend SPA with Quotations nav/pages (mirror Opportunities table + form) when the SPA ships
7. After catalog **1.4.0**: confirm `quotations.convert` grants and that convert stays hidden until Invoices is entitled
