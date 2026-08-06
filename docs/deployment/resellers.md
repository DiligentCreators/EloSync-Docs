# Resellers — Production Guide

## Licensing

- Catalog slug: `resellers`
- Category: `sales` (**Sales**), `category_sort_order = 20`, module `sort_order = 70`
- **Free Marketplace opt-in** (`is_default_included = false`, `is_billable = false`, price `0`)
- Hard dependency: **Payments** (`module_dependencies`, not optional)
- New workspaces receive only **Leads** + **Tasks** by default; enable Payments, then Resellers from Marketplace
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks** only)
2. Operators enable Payments, then Resellers from Marketplace
3. Tenant permissions include `resellers.*` via data migration + default role maps
4. Protected default role `reseller` is ensured for every tenant (`ensure_reseller_default_role` migration)

## Permissions rollout

New Resellers permissions for **existing** workspaces ship as additive data migrations:

- `2026_08_06_100004_add_resellers_permissions` — `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions`
- `2026_08_06_100009_ensure_reseller_default_role` — creates missing `reseller` role + grants view permissions

Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Schema migrations

| Migration | Purpose |
|-----------|---------|
| `2026_08_06_100000_create_resellers_table` | `resellers` |
| `2026_08_06_100001_add_reseller_id_to_customer_invoices_table` | nullable FK on `customer_invoices` |
| `2026_08_06_100003_register_resellers_module` | catalog via `DefaultModuleRegistrar` |
| `2026_08_06_100005_add_resellers_payments_dependency` | hard dep → payments |

## Monitoring

- Platform audit: `reseller_created`, `reseller_updated`, `reseller_deleted`, `reseller_assigned`, `reseller_login_invited`
- Spatie activity log name: `resellers`

## Deploy checklist

1. Migrate schema + catalog + permissions + Payments dependency (migrate-only; no `db:seed` in production)
2. Confirm `module:resellers` + `resellers.*` on target roles; confirm protected `reseller` role exists
3. Confirm Marketplace blocks Resellers install without Payments
4. Smoke: enable Payments → Resellers → create reseller → set rates → invite login → link on invoice
5. Frontend: deploy Sales nav when SPA milestone ships

## Deferred

Cross-workspace reseller identity remains out of Phase 1 — invite-login is same-tenant only.
