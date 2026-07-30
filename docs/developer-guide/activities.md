# Activities — Developer Guide

Mirror of the [Companies developer guide](/developer-guide/companies) / [Contacts developer guide](/developer-guide/contacts). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Activity.php`, `ActivityNote`, `ActivityActivity` |
| Enums | `ActivityTypeEnum`, `ActivityActivityTypeEnum` |
| Service | `app/Services/Tenant/ActivityService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ActivityController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Activity/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Activity/*` |
| Policy | `app/Policies/ActivityPolicy.php` |
| Events | `app/Events/Activity*.php` |
| Subscriber | `app/Listeners/ActivityEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Activity/ActivityAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableLead`, `LinkableCompanyForActivity`, `EligibleActivityAssignee` |
| Tests | `tests/Feature/Tenant/Activity/ActivityTest.php` |

`App\Models\Activity` is the CRM engagement record. It is distinct from Spatie `activity_log` and from per-module timeline models (`ContactActivity`, `LeadActivity`, etc.).

## Domain notes

- Assignee scoping via `ScopesToAssignee` with `activities.assign`.
- `activities.force.delete` is not granted to any default role — owner/superadmin only.
- At least one of `contact_id` / `company_id` / `lead_id` is required; each FK is validated for module entitlement + assignee scope on the related record.
- On create/complete (and when related FKs change on update), mirrors `crm_activity_logged` / `crm_activity_completed` onto related Contact/Company/Lead timelines when those modules are entitled.
- Soft delete; completion via `POST .../complete` (`can:activities.complete`). Completion is not writable through generic update.

## Permissions

```
activities.view | create | update | delete | restore | force.delete | assign | complete
```

Staff defaults include `activities.view` + `activities.complete` (same pattern as Tasks).

Routes use `module:activities` then `can:activities.*` / policies.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-activities.md](/api/tenant-v1-activities).

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/activities/activities-page.tsx` |
| Form | `activity-form-dialog.tsx` |
| Detail | `activity-detail-sheet.tsx` |
| Service | `activityService` in `src/api/services.ts` |
| Nav | `permission: activities.view`, `module: 'activities'` (after Meetings) |
| Dashboard | `RecentCrmActivitiesWidget` (`recent_activities`) + `create_activity` quick action |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Activity/ActivityTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:activities
```

## Logging

- Spatie `LogsActivity` on `Activity` (log name `activities`)
- Domain `activity_activities` timeline
- `PlatformAuditService` via `ActivityEventSubscriber`
