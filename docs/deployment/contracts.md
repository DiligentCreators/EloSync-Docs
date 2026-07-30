# Contracts — Production Guide

## Licensing

- Catalog slug: `contracts`
- Category: **Sales** (`sales`)
- **Free Marketplace opt-in** (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 60`
- **Hard dependency**: requires the **Opportunities** module — install is blocked at the Marketplace/API level until Opportunities is entitled
- **Soft optional dependency**: linking a `quotation_id` requires the **Quotations** module to also be entitled; the link is otherwise rejected by validation (`LinkableQuotation`)
- Existing workspaces that already have Contracts keep their subscription (policy change does not uninstall)

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules only (Contracts is never auto-installed)
2. Operators enable Opportunities first, then Contracts, from Marketplace (free / non-billable install activates immediately)
3. Tenant permissions include `contracts.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Contracts permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles.

## Monitoring

- Platform audit events: `contract_created`, `contract_updated`, `contract_deleted`, `contract_assigned`, `contract_status_changed`, `contract_note_added`
- Notifications: assignment via `ContractAssignedNotification`

## Deploy checklist

1. Migrate tables (`contracts`, `contract_notes`, `contract_activities`)
2. Register the `contracts` catalog module via migration (`DefaultModuleRegistrar`) as free Sales opt-in — **not** `db:seed`
3. Register the hard dependency row (`contracts` → `opportunities`) via migration
4. Run contracts permissions migration so default roles receive missing `contracts.*` grants
5. Confirm `module:contracts` + `contracts.*` permissions on target roles
6. Deploy Frontend SPA with Contracts nav/pages (mirror Opportunities/Quotations table + form) when the SPA ships
