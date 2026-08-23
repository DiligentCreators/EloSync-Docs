# Knowledge Base Module

Free Operations Marketplace module for **internal** team help articles, categories, and searchable FAQs. Catalog version **1.0.0**. There is no public or customer portal in v1.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [knowledge-base.md](/user-guide/knowledge-base) |
| Engineers | [knowledge-base.md](/developer-guide/knowledge-base) |
| Production / ops | [knowledge-base.md](/deployment/knowledge-base) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Tenant API | [tenant-v1-knowledge-base.md](/api/tenant-v1-knowledge-base) |

## Capabilities

- Articles: title, slug, excerpt, TipTap HTML body, optional category, status (`draft` / `published` / `archived`), `published_at`
- Flat categories (delete blocked while articles still use them)
- Search across title, excerpt, and body; status and trash filters for editors
- Soft **Help Desk** backlinks on article show when `help-desk` is entitled (`help_desk_tickets` on `GET /knowledge-base/{id}`)
- Notes + domain timeline; Spatie `LogsActivity` + platform audit events
- Module licensing (`module:knowledge-base`) for install; Spatie permissions for all access
- Internal workspace only — no public URLs or customer portal

## Permissions

`knowledge-base.view` · `create` · `update` · `delete` · `restore` · `force.delete`

Default roles: **admin** = all except `force.delete`; **manager** = view / create / update; **staff** = view.

View-only users see **published** articles only. Users with `knowledge-base.update` can open drafts, archived, and trash.

## Catalog

- Slug: `knowledge-base`
- Category: Operations (`operations`, sort `40`), module sort `60`, icon `book-open`
- `is_default_included=false`, `is_billable=false`, prices `$0`
- Install from Marketplace (not auto-installed for new workspaces)
- No hard module dependencies

## Explicitly deferred

- Public / customer-facing URLs
- Attachments / image upload
- Nested categories
- Dashboard widget
- Automation triggers
- Publish notification fan-out
