# Help Desk — Production Guide

## Licensing

- Catalog slug: `help-desk`
- Category: `operations` (**Operations**), `category_sort_order = 40`, `sort_order = 10`
- **Free Marketplace opt-in** module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`
- **No hard module dependency** — Help Desk installs standalone; Contacts and Companies are optional soft links, only offered in the UI (and only validated) when already entitled
- New workspaces receive only **Leads** + **Tasks** + **ToDos** by default; enable Help Desk from Marketplace at any time
- Existing workspaces that already have Help Desk keep their subscription
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks**, **ToDos** only)
2. Operators enable **Help Desk** from Marketplace whenever needed — no prerequisite modules
3. Tenant permissions include `help-desk.*` via `config/tenant-permissions.php` / default role maps

No status seeder — ticket status defaults to `open` at creation. Categories (General / Technical / Billing / Account / Other) lazy-seed on first category list or ticket create — not via `db:seed`.

## Permissions rollout

New Help Desk permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

## Tenant settings

`help_desk_number_prefix` (default `HD-`) controls the auto-generated `number` prefix. Updatable via `PUT /api/tenant/v1/settings`.

## Monitoring

- Platform audit events: `help_desk_ticket_created`, `help_desk_ticket_updated`, `help_desk_ticket_deleted`, `help_desk_ticket_assigned`, `help_desk_ticket_status_changed`, `help_desk_ticket_note_added`
- Spatie activity log name `help-desk-categories` for category CRUD (lazy seed is quiet)
- Notifications: assignment, close, reopen (database + mail) via `HelpDeskAssignedNotification` / `HelpDeskStatusNotification`
- Tenant mail settings with Central SMTP fallback

## Deploy checklist

1. Migrate help desk tables (`help_desk_categories`, `help_desk_tickets`, `help_desk_notes`, `help_desk_activities`) and register catalog module **1.0.0**
2. Register the `help-desk` catalog module (migration, not seeder) as free opt-in under the `operations` category — **no** `module_dependencies` row
3. Migrate `help-desk.*` permissions and grant to existing `admin` / `manager` / `staff` roles per default maps
4. Confirm `module:help-desk` + `help-desk.*` permissions on target roles
5. Deploy frontend (Help Desk nav under **Operations** — list/form/detail + **Manage categories**; dashboard `help_desk_my_open` widget)
6. Smoke: create a **new** workspace → enable Help Desk (alone, no CRM modules) → Manage categories → create a custom category → create/edit/assign/note a ticket → transition statuses → close → reopen → soft delete/restore
7. Smoke (soft links): on a workspace with Contacts + Companies + Help Desk → create a ticket with contact/company links → confirm links resolve in detail
8. Smoke (soft-gate off): on a workspace with Help Desk but **without** Contacts → confirm contact/company pickers are hidden

## Roadmap context

Help Desk is the first **Operations** Marketplace SKU — internal ticketing MVP only. SLAs, multi-channel intake, customer portal, and Knowledge Base remain future. See [module-dependencies.md](/architecture/module-dependencies) and [product-roadmap.md](/getting-started/product-roadmap).
