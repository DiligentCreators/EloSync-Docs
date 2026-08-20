# Contacts Module

Third product module on the frozen platform. Mirrors the [Leads](/user-guide/leads-overview) / [Tasks](/user-guide/tasks-overview) reference architecture — a workspace directory of people, with assignment, notes, and an activity timeline. Organizations are first-class in [Companies](/user-guide/companies-overview); contacts may link via `company_id`.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [contacts.md](/user-guide/contacts) |
| Engineers | [contacts-developer.md](/developer-guide/contacts) |
| Production / ops | [contacts-production.md](/deployment/contacts) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [leads.md](/user-guide/leads-overview) |
| Tenant API | [../api/tenant-v1-contacts.md](/api/tenant-v1-contacts) |

## Capabilities

- Name, email, phone, company (legacy string), job title, source
- **Lifecycle** — `on_boarded` / `off_boarded`, shown as **On Boarded Clients** / **Off Boarded Clients** (not soft-delete)
- Optional link to a [Company](/user-guide/companies-overview) via `company_id` (form company picker when Companies is installed)
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `contacts.assign`
- Notes (comments) + activity timeline
- Table view with search, company filter, lifecycle filter, and **My Contacts** toggle
- KPIs via `GET /contacts/stats` (includes on boarded / off boarded counts)
- Trash filtering plus **Restore** and **Delete permanently** (trash **Active only** is unrelated to lifecycle)
- Module licensing (`module:contacts`) + Spatie permissions — **free Marketplace opt-in**
- Audit + activity logging

## Permissions

`contacts.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Enable Contacts from Marketplace (free). Only Leads and Tasks install automatically on new workspaces.

## Lead conversion

When both **Leads** and **Contacts** are installed, converting a lead creates (or links) a real Contact (default lifecycle **On Boarded Clients**) and stores `contact_id` on the lead. The Lead record page shows a **View contact** link after conversion. Without Contacts installed, conversion remains the earlier status-only placeholder.

## Company link

When **Companies** is installed, Contact create/edit can pick a linked organization (`company_id`). The free-text `company` field remains as a **legacy** display/search string and is synced from the linked Company name when a link is set. List/detail UIs prefer `linked_company.name`, falling back to the legacy string.

## Explicitly deferred

- Deals / opportunities linked to contacts
- Contact import/export
- Follow-ups (see [Leads](/user-guide/leads-overview) for that pattern)
- Legacy company-string → Company backfill job (see [Companies](/user-guide/companies-overview))
