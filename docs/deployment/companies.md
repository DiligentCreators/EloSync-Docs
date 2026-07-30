# Companies — Production Guide

## Licensing

- Catalog slug: `companies`
- **Free and default-included** CRM module (same family as Leads/Tasks/Contacts/Calendar/Meetings)
- Catalog flags: `is_default_included = true`, `is_billable = false`, price `0`, `sort_order = 12`
- New workspaces receive `module:companies` automatically via `ModuleSubscriptionService::installDefaultModules()` (subscription `source = included`)
- Existing workspaces missing the entitlement are backfilled by the Companies registration / ensure migrations
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs every published `is_default_included` module, including **Companies**
2. Entitlement is non-billable (`price = 0`, `source = included`)
3. Tenant permissions include `companies.*` via `config/tenant-permissions.php` / default role maps

No stage or status seeder (unlike Leads) — Companies is a flat directory record.

## Permissions rollout

New Companies permissions for **existing** workspaces must ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Monitoring

- Platform audit events: `company_created`, `company_updated`, `company_deleted`, `company_assigned`, `company_note_added`, `company_restored`
- Notifications: assignment (mail + database) via `CompanyAssignedNotification`
- Tenant mail settings with Central SMTP fallback

## Contact integration

When Companies is installed alongside Contacts, Contact create/update accept `company_id`. The legacy `company` string is synced from the linked Company name when a link is set. No automatic backfill runs for existing free-text `company` values — that job is deferred.

## Deploy checklist

1. Migrate company tables (`companies`, `company_notes`, `company_activities`) and `contacts.company_id`
2. Register the `companies` catalog module (migration, not seeder) with `is_default_included` / ensure backfill for existing workspaces
3. Confirm `module:companies` + `companies.*` permissions on target roles
4. Deploy frontend (Companies nav item, list/form/detail, dashboard **Recent Companies** widget + **Create Company** quick action, Contact form company picker)
5. Smoke: create a **new** workspace → Companies appears in nav without Marketplace purchase → create/edit/assign/note a company → link a Contact via company picker → confirm `company_id` + synced `company` string
