# Contacts — Production Guide

## Licensing

- Catalog slug: `contacts`
- **Free and default-included** CRM module (same family as Leads/Tasks/Calendar/Meetings)
- Catalog flags: `is_default_included = true`, `is_billable = false`, price `0`
- New workspaces receive `module:contacts` automatically via `ModuleSubscriptionService::installDefaultModules()` (subscription `source = included`)
- Existing workspaces missing the entitlement are backfilled by the Contacts registration / ensure migrations
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs every published `is_default_included` module, including **Contacts**
2. Entitlement is non-billable (`price = 0`, `source = included`)
3. Tenant permissions include `contacts.*` via `config/tenant-permissions.php` / default role maps

No stage or status seeder (unlike Leads) — Contacts is a flat directory record.

## Permissions rollout

New Contacts permissions for **existing** workspaces must ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Monitoring

- Platform audit events: `contact_created`, `contact_updated`, `contact_deleted`, `contact_assigned`, `contact_note_added`, `contact_restored`
- Notifications: assignment (mail + database) via `ContactAssignedNotification`
- Tenant mail settings with Central SMTP fallback

## Lead integration

When Contacts is installed alongside Leads, `leads.convert` starts creating/linking real Contacts (`leads.contact_id`) instead of the status-only placeholder. No backfill runs automatically for leads converted before Contacts was installed — those keep `conversion_meta.stub = true`.

## Deploy checklist

1. Migrate contact tables (`contacts`, `contact_notes`, `contact_activities`) and `leads.contact_id`
2. Register the `contacts` catalog module (migration, not seeder)
3. Confirm `module:contacts` + `contacts.*` permissions on target roles
4. Deploy frontend (Contacts nav item, list/form/detail, dashboard **Recent Contacts** widget + **Create Contact** quick action, Lead detail **View contact** link)
5. Smoke: create a **new** workspace → Contacts appears in nav without Marketplace purchase → create/edit/assign/note a contact → convert a Lead → confirm `contact_id` + **View contact** link
