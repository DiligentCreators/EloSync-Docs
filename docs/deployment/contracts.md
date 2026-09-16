# Contracts — Production Guide

Full go-live audit / checklist: [Contracts 1.1.0 production readiness](./contracts-production-readiness).

## Licensing

- Catalog slug: `contracts`
- Category: **Sales** (`sales`)
- **Free Marketplace opt-in** (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 60`, version **1.5.0**
- **Hard dependency**: requires the **Opportunities** module — install is blocked at the Marketplace/API level until Opportunities is entitled
- **Soft optional dependency**: linking a `quotation_id` requires the **Quotations** module to also be entitled; the link is otherwise rejected by validation (`LinkableQuotation`)
- Existing workspaces that already have Contracts keep their subscription (policy change does not uninstall)

## Bootstrap

On **new workspace** create:

1. `installDefaultModules()` installs published `is_default_included` modules only (Contracts is never auto-installed)
2. Operators enable Opportunities first, then Contracts, from Marketplace (free / non-billable install activates immediately)
3. Tenant permissions include `contracts.*` via `config/tenant-permissions.php` / default role maps

## Permissions rollout

New Contracts permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles. Catalog **1.5.0** adds `contracts.send` and `contracts.accept` via that grant path.

## Monitoring

- Platform audit events: `contract_created`, `contract_updated`, `contract_deleted`, `contract_assigned`, `contract_status_changed`, `contract_invoice_created`, `contract_note_added`
- Notifications: assignment via `ContractAssignedNotification`
- Domain timeline also records `emailed`, `signature_requested`, and `signed` for PDF/email/accept flows

## Deploy checklist

1. Migrate tables (`contracts`, `contract_notes`, `contract_activities`) plus `description` (1.1.0), `customer_invoices.contract_id` (1.2.0), convert permission, acceptance columns, `contracts.send` / `contracts.accept` grants, and catalog bump through **1.5.0**
2. Register the `contracts` catalog module via migration (`DefaultModuleRegistrar`) as free Sales opt-in — **not** `db:seed`
3. Register the hard dependency row (`contracts` → `opportunities`) via migration
4. Run contracts permissions migration so default roles receive missing `contracts.*` grants (including `send` / `accept` for 1.5.0)
5. Confirm `module:contracts` + `contracts.*` permissions on target roles
6. Deploy Frontend SPA with Contracts nav/pages (mirror Opportunities/Quotations table + form) when the SPA ships
7. After catalog **1.2.0**: confirm `contracts.convert` grants and that create-invoice stays hidden until Invoices is entitled
8. After catalog **1.5.0**: migrate acceptance columns; confirm PDF throttle `contracts-pdf` and public throttle `contract-acceptance`; deploy SPA guest route `/#/accept/contracts/:token`; smoke **Download PDF**, **Send for signature** → **Copy accept link** / **Email customer** → public accept → signer metadata on the record; verify **Activate without signature** still works from draft
