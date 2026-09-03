# Companies Module

CRM organizations module on the frozen platform. Mirrors the [Contacts](/user-guide/contacts-overview) / [Leads](/user-guide/leads-overview) reference architecture — a workspace directory of companies (organizations), with assignment, notes, and an activity timeline. Contacts can link to a Company via `company_id`.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [companies.md](/user-guide/companies) |
| Engineers | [companies-developer.md](/developer-guide/companies) |
| Production / ops | [companies-production.md](/deployment/companies) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [contacts.md](/user-guide/contacts-overview) · [leads.md](/user-guide/leads-overview) |
| Tenant API | [../api/tenant-v1-companies.md](/api/tenant-v1-companies) |

## Capabilities

- Name, email, phone, website, industry, address, source
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `companies.assign`
- Notes (comments) + activity timeline
- Table view with search, industry filter, and **My Companies** toggle
- Linked contacts shown on the company record page
- KPIs via `GET /companies/stats`
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:companies`) + Spatie permissions — **free Marketplace opt-in**
- Audit + activity logging

## Permissions

`companies.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Enable Companies from Marketplace (free). Catalog: slug `companies`, `is_default_included = false`, `is_billable = false`, `sort_order = 12`. Only Leads and Tasks install automatically on new workspaces.

## Contact linkage

When **Companies** is installed, Contact create/edit can pick a linked Company (`contacts.company_id`), or create one inline with **New**. The legacy free-text `company` string remains for display and search; when a Company is linked, that string is synced from the Company name. See [Contacts](/user-guide/contacts-overview).

## Explicitly deferred

- Lead convert-to-Company
- Backfill job for legacy contact `company` strings → Company records
- Meta invent Companies (inbound lead ads creating organizations)
- Deals / opportunities linked to companies
- Company import/export
- Follow-ups (see [Leads](/user-guide/leads-overview) for that pattern)
