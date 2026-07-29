# Contacts Module

Third product module on the frozen platform. Mirrors the [Leads](/user-guide/leads-overview) / [Tasks](/user-guide/tasks-overview) reference architecture — a workspace directory of people and companies, with assignment, notes, and an activity timeline.

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

- Name, email, phone, company, job title, source
- Assignment (`created_by` / `assigned_to`) with assignee scoping via `contacts.assign`
- Notes (comments) + activity timeline
- Table view with search, company filter, and **My Contacts** toggle
- KPIs via `GET /contacts/stats`
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:contacts`) + Spatie permissions — **free / default-included** on every new workspace
- Audit + activity logging

## Permissions

`contacts.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Contacts is installed automatically when a workspace is created (no Marketplace purchase).

## Lead conversion

When both **Leads** and **Contacts** are installed, converting a lead creates (or links) a real Contact and stores `contact_id` on the lead. The Lead detail drawer shows a **View contact** link after conversion. Without Contacts installed, conversion remains the earlier status-only placeholder.

## Explicitly deferred

- Companies (organizations) as a first-class entity
- Deals / opportunities linked to contacts
- Contact import/export
- Follow-ups (see [Leads](/user-guide/leads-overview) for that pattern)
