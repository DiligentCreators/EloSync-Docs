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

- Platform audit events: `help_desk_ticket_created`, `help_desk_ticket_updated`, `help_desk_ticket_deleted`, `help_desk_ticket_assigned`, `help_desk_ticket_status_changed`, `help_desk_ticket_note_added`, SLA breach audit via `HelpDeskSlaBreached`
- Spatie activity log name `help-desk-categories` for category CRUD (lazy seed is quiet); SLA policies log as `help-desk-sla-policies`
- Notifications: assignment, close, reopen, SLA response/resolve breach (database) via Help Desk notification classes
- Scheduler: `help-desk:scan-sla-breaches` every five minutes; `help-desk:sync-mailboxes` every minute
- Queue: `SyncHelpDeskMailboxJob` on **`help-desk-ingest`** (requires `ext-imap`, same as personal Email)
- Tenant mail settings with Central SMTP fallback

## Deploy checklist

1. Migrate help desk tables (`help_desk_categories`, `help_desk_tickets`, SLA policies, mailboxes, notes, activities, attachments, KB pivot, note mentions) and catalog bumps through **1.7.0** (Communication Template replies; Kanban agent owns **1.6.0**)
2. Register the `help-desk` catalog module (migration, not seeder) as free opt-in under the `operations` category — **no** `module_dependencies` row
3. Migrate `help-desk.*` permissions and grant to existing `admin` / `manager` / `staff` roles per default maps
4. Confirm `module:help-desk` + `help-desk.*` permissions on target roles
5. Ensure queue worker processes **`help-desk-ingest`** (and `ext-imap` for mailbox sync)
6. Deploy frontend (Help Desk nav under **Operations** — list/form/detail + Manage categories / SLAs / mailboxes; dashboard `help_desk_my_open` widget)
7. Smoke: create a **new** workspace → enable Help Desk (alone, no CRM modules) → Manage categories → Manage SLAs → create/edit/assign/note a ticket → confirm SLA clocks → transition statuses → close → reopen → soft delete/restore
8. Smoke (soft links): on a workspace with Contacts + Companies + Help Desk → create a ticket with contact/company links → confirm links resolve in detail
9. Smoke (soft-gate off): on a workspace with Help Desk but **without** Contacts → confirm contact/company pickers are hidden
10. Smoke (KB links): on a workspace with Help Desk + Knowledge Base → create a ticket linked to a published article → confirm **Related articles** on ticket view and **Linked tickets** on article view
11. Smoke (email intake): Manage mailboxes → test connection → sync (or wait for scheduler) → confirm inbound creates `source=email` ticket; reply with `HD-#####` appends a note
12. Smoke (Kanban): Board view → drag ticket between status columns → confirm status persists
13. Smoke (@mentions): Add ticket note with `@agent` → confirm database notification
14. Smoke (template reply): With Communication Templates + WhatsApp entitled and contact phone → ticket view → WhatsApp template picker

## Roadmap context

Help Desk is the first **Operations** Marketplace SKU. **1.3.0** shipped SLA policies/breach tracking + Automation triggers; **1.4.0** shipped shared IMAP email intake; **1.5.0** @mentions on ticket notes; **1.6.0** status Kanban board; **1.7.0** Communication Template reply placeholders (soft-gated WhatsApp picker). Customer portal and chat/social channels remain deferred. Soft Knowledge Base article links shipped in **1.1.0**; attachments in **1.2.0**. See [module-dependencies.md](/architecture/module-dependencies), [product-roadmap.md](/getting-started/product-roadmap), and [Phased Depth production readiness](/deployment/phased-depth-production-readiness).
