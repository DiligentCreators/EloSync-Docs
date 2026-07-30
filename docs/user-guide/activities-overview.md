# Activities Module

CRM engagements module on the frozen platform. Mirrors the [Contacts](/user-guide/contacts-overview) / [Companies](/user-guide/companies-overview) reference architecture — loggable calls, emails, notes, follow-ups, and other interactions linked to Contacts, Companies, and/or Leads.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [activities.md](/user-guide/activities) |
| Engineers | [activities-developer.md](/developer-guide/activities) |
| Production / ops | [activities-production.md](/deployment/activities) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [companies.md](/user-guide/companies-overview) · [contacts.md](/user-guide/contacts-overview) |
| Tenant API | [../api/tenant-v1-activities.md](/api/tenant-v1-activities) |

## Capabilities

- Types: `call`, `email`, `note`, `follow_up`, `other`
- Subject, optional body, optional due date, completion (`completed_at`)
- Related links: at least one of Contact / Company / Lead (soft entitlement — FK rejected when that module is not installed)
- Assignment with assignee scoping via `activities.assign`
- Notes + domain activity timeline
- Table view with search, type/status filters, and **My Activities** toggle
- KPIs via `GET /activities/stats`
- Completing an activity mirrors onto related Contact/Company/Lead timelines
- Trash filtering plus **Restore** and **Delete permanently**
- Module licensing (`module:activities`) + Spatie permissions — **free / default-included**
- Audit + activity logging

## Permissions

`activities.view` · `create` · `update` · `delete` · `restore` · `force.delete` · `assign`

Activities is installed automatically when a workspace is created (no Marketplace purchase). Catalog: slug `activities`, `is_default_included = true`, `is_billable = false`, `sort_order = 28`.

## Related modules (optional)

No hard `module_dependencies` row. Linking a Contact, Company, or Lead requires that module to be entitled; otherwise validation rejects the FK.

## Explicitly deferred

- Calendar projection / Meetings types
- Aggregating system `*_activities` timelines into this list
- Communication template placeholders
