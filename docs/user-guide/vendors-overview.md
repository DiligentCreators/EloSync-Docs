# Vendors Module

Phase 4 Purchasing module (Milestone 1) on the frozen platform. Mirrors the [Companies](/user-guide/companies-overview) reference architecture — a workspace directory of suppliers, with assignment, notes, and an activity timeline. Vendors is the foundation for future **Purchase Orders** and **Expenses** modules.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [vendors.md](/user-guide/vendors) |
| Engineers | [vendors-developer.md](/developer-guide/vendors) |
| Production / ops | [vendors-production.md](/deployment/vendors) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [companies.md](/user-guide/companies-overview) |
| Tenant API | [../api/tenant-v1-vendors.md](/api/tenant-v1-vendors) |

## Capabilities

- Name, email, phone, website, address, tax ID, payment terms, currency, status (active/inactive)
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `vendors.assign`
- Notes (comments) + activity timeline
- Table view with search (including tax ID), status filter, and **My Vendors** toggle
- KPIs via `GET /vendors/stats` (total, my vendors, unassigned, active, inactive)
- Dashboard widget `active_vendors` (module + `vendors.view`)
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:vendors`) + Spatie permissions — **free Marketplace opt-in**
- Audit + activity logging

## Permissions

`vendors.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Enable Vendors from Marketplace (free). Catalog: slug `vendors`, category `purchasing` (Purchasing), `is_default_included = false`, `is_billable = false`, `sort_order = 10`. Only Leads and Tasks install automatically on new workspaces.

## No contacts relationship

Unlike Companies, Vendors do **not** link to Contacts. Vendors is a standalone supplier directory record.

## Explicitly deferred

- Vendor scorecards / performance tracking
- Vendor portal / self-service
- Vendor import/export
