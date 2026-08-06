# Announcements Module

Free Communication Marketplace module for workspace-wide announcements with read tracking.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [announcements.md](/user-guide/announcements) |
| Engineers | [announcements.md](/developer-guide/announcements) |
| Production / ops | [announcements.md](/deployment/announcements) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Tenant API | [tenant-v1-announcements.md](/api/tenant-v1-announcements) |

## Capabilities

- Title + body, status (`draft` / `published` / `archived`), optional expiry
- **After login:** unread published announcements open in a dialog (Mark as read)
- **Dashboard:** announcement list after the welcome greeting when the module is installed
- **History:** `/announcements` for every signed-in user (no `view` permission)
- **Read receipts:** first/last read time + IP; admins with `view_reads` see who read each announcement
- Publish fans out an in-app notification (`type: announcement`)
- Module licensing (`module:announcements`) for install; mutations use Spatie permissions

## Authz (important)

There is **no** `announcements.view` permission. If the user can log in and the module is installed, they can inbox / unread / show published / mark read.

Mutations require:

`announcements.create` · `update` · `delete` · `restore` · `force.delete` · `view_reads`

## Catalog

- Slug: `announcements`
- Category: Communication
- `is_default_included=false`, `is_billable=false`, prices `$0`
- Install from Marketplace (not auto-installed for new workspaces)

## Explicitly deferred

- Role / user targeting
- Attachments / rich HTML editor
- Scheduled publish beyond draft → publish
- Central (platform-wide) announcements
