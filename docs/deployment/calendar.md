# Calendar — Deployment

## Migrate-only

```bash
php artisan migrate
```

Creates `calendar_events`, registers the `calendar` catalog module (free CRM opt-in), and grants missing default-role permissions (`calendar.view|create|update|delete|view_all`).

Do **not** rely on `db:seed` in production for catalog/RBAC.

## Catalog

- **1.1.0** — Task/Lead/Project overlays
- **1.2.0** — Meeting invitee list/view ACL (`read_only` on resource)

Bump: migrate-only `2026_09_27_190000_bump_calendar_module_version_to_1_2_0` (do **not** `db:seed`).

## Smoke

1. Confirm marketplace module `calendar` exists and is installed on a test workspace.
2. Owner: `GET /api/tenant/v1/calendar/events` → 200.
3. Create event → appears on Week (default), Day, Month, and Agenda.
4. On Week/Day, drag an event to a new slot → persists after refresh (`PUT` succeeds; toast “Event rescheduled”).
5. Staff without `view_all` cannot list another user’s **manual** events.
6. Meeting invitee (staff) lists/views the projected meeting event with `read_only: true`; `PUT`/`cancel`/`DELETE` → 403.
7. Dashboard includes `calendar` upcoming widget when entitled (invitee scope included).

Go-live: [Calendar invitee ACL 1.2.0 production readiness](/deployment/calendar-invitee-acl-1-2-0-production-readiness).

## Rollback note

Catalog/permission data migrations are intentionally irreversible; use a forward migration to retire the module if required. Roll the **1.2.0** bump `down` → **1.1.0** only with matching code rollback.
