# Announcements — Developer Guide

Marketplace Communication module. Flat namespaces (no `Modules/` package). **Authz exception:** consumer read paths intentionally omit `announcements.view`.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Announcement.php`, `AnnouncementRead.php` |
| Enum | `app/Enums/Tenant/AnnouncementStatusEnum` |
| Service | `app/Services/Tenant/AnnouncementService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/AnnouncementController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Announcement/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Announcement/*` |
| Policy | `app/Policies/AnnouncementPolicy.php` |
| Events | `AnnouncementCreated`, `Updated`, `Deleted`, `Published` |
| Subscriber | `app/Listeners/AnnouncementEventSubscriber.php` |
| Publish fan-out job | `app/Jobs/Tenant/NotifyAnnouncementPublishedJob.php` (chunks users; skips suspended) |
| Notification | `app/Notifications/Tenant/Announcement/AnnouncementPublishedNotification.php` (`type: announcement`) |
| Tests | `tests/Feature/Tenant/Announcement/AnnouncementTest.php` |

## Authz

- Routes: `module:announcements` for all endpoints
- Consumer (`unread`, `inbox`, `index` published, `show` published, `read`): **no** `can:` middleware; `AnnouncementPolicy::viewAny` / `view` allow any authenticated user for published non-expired rows
- Mutations: `can:announcements.create|update|delete|restore|force.delete`
- Readers: `can:announcements.view_reads`

Do **not** add `announcements.view` without a product decision — reading is intentionally open once installed.

## Read receipts

`announcement_reads`: unique `(announcement_id, user_id)`, `first_read_at` / `last_read_at`, `first_read_ip` / `last_read_ip`. First mark-read sets first_* ; later marks bump last_* only. `markRead` uses `firstOrCreate` with unique-constraint retry so concurrent double-submit is safe.

## Date and time

Absolute columns use `UtcDateTime`. Audience visibility SQL compares `expires_at` to `now('UTC')` (never workspace `app.timezone`). SPA `expires_at` edit/display uses `isoToAppLocalInput` / `appLocalInputToIso`.

## Dashboard

`DashboardWidgetService` emits `announcements_inbox` when `EntitlementService::hasModule(..., 'announcements')` (permission field may be null). SPA dashboard card fetches **unread** only and renders only when that list is non-empty (hidden after the user has read everything).

## Frontend

- Pages: `src/pages/announcements/`
- Post-login dialog: `src/components/announcements/announcement-inbox-dialog.tsx` in `AppLayout`
- Dashboard section: `src/components/dashboard/announcements-dashboard-section.tsx`
- Nav: module-only (no permission field)
- Playwright: `npm run test:e2e:announcements`

## Permissions config

```
announcements.create | update | delete | restore | force.delete | view_reads
```

## Catalog registration

Data migration `register_announcements_module` (`is_default_included: false`, `is_billable: false`) — **no** `installForWorkspacesMissingModule`. Permissions sync migration grants defaults additively.

## Related

- [API](/api/tenant-v1-announcements)
- [Deployment](/deployment/announcements)
- [User guide](/user-guide/announcements)
- [Module development](/developer-guide/module-development)
