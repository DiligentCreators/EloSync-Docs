# Calendar — Deployment

## Migrate-only

```bash
php artisan migrate
```

Creates `calendar_events`, registers the `calendar` catalog module (free CRM opt-in), and grants missing default-role permissions (`calendar.view|create|update|delete|view_all|manage_integrations`).

Do **not** rely on `db:seed` in production for catalog/RBAC.

## Catalog

- **1.1.0** — Task/Lead/Project overlays
- **1.2.0** — Meeting invitee list/view ACL (`read_only` on resource)
- **1.3.0** — Manual event shares (`calendar_event_shares`, viewer/editor)
- **1.4.0** — Google/Outlook sync Phase 1 (`calendar_provider_connections`; `external_provider`/`external_event_id` on `calendar_events`; `calendar.manage_integrations` permission)
- **1.5.0** — Push Meeting / Task / Lead overlays to connected Google/Outlook (same job + soft-fail); Project/Contact/Company still deferred

Bump: migrate-only through `2026_10_05_153000_bump_calendar_module_version_to_1_5_0` (do **not** `db:seed`).

## Environment (Calendar sync — 1.4.0+)

Google/Microsoft OAuth apps are **platform-wide** (unlike Meetings, which is per-workspace). Set in platform `.env`:

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CALENDAR_CLIENT_ID` / `GOOGLE_CALENDAR_CLIENT_SECRET` | Google Calendar API OAuth app; leave unset to disable Google Connect (SPA shows "not configured") |
| `MICROSOFT_CALENDAR_CLIENT_ID` / `MICROSOFT_CALENDAR_CLIENT_SECRET` / `MICROSOFT_CALENDAR_TENANT` | Microsoft Graph OAuth app (`MICROSOFT_CALENDAR_TENANT` defaults to `common`); leave unset to disable Outlook Connect |
| `APP_URL` | Builds the fixed OAuth callback: `/api/oauth/calendar-sync/{provider}/callback` (must be HTTPS in production for Google/Microsoft) |
| `FRONTEND_URL` | SPA return URL after OAuth (`/#/calendar?integrations=…`) |
| `CALENDAR_SYNC_PROVIDERS_FAKE` | Optional local/CI only; **ignored / forced off in production** |

Register the platform callback URL once on each OAuth app (Google Cloud Console / Azure AD app registration) — not per tenant.

## Smoke

1. Confirm marketplace module `calendar` exists and is installed on a test workspace.
2. Owner: `GET /api/tenant/v1/calendar/events` → 200.
3. Create event → appears on Week (default), Day, Month, and Agenda.
4. On Week/Day, drag an event to a new slot → persists after refresh (`PUT` succeeds; toast “Event rescheduled”).
5. Staff without `view_all` cannot list another user’s **manual** events unless shared.
6. Meeting invitee (staff) lists/views the projected meeting event with `read_only: true`; `PUT`/`cancel`/`DELETE` → 403.
7. Share a manual event as viewer → sharee lists with `read_only: true`; as editor → can mutate.
8. Dashboard includes `calendar` upcoming widget when entitled (invitee/share scope included).

Go-live: [Calendar invitee ACL 1.2.0 production readiness](/deployment/calendar-invitee-acl-1-2-0-production-readiness) · [Calendar event shares 1.3.0 production readiness](/deployment/calendar-event-shares-1-3-0-production-readiness) · [Calendar Google/Outlook sync 1.4.0 production readiness](/deployment/calendar-google-outlook-sync-1-4-0-production-readiness) · [Calendar overlay provider push 1.5.0 production readiness](/deployment/calendar-overlay-provider-push-1-5-0-production-readiness).

### Smoke (Calendar sync — 1.4.0 / overlay push 1.5.0)

9. Admin with `calendar.manage_integrations`: Calendar → **Sync** lists Google + Microsoft; Connect disabled when platform OAuth env is unset; copy mentions Meeting/Task/Lead overlays.
10. After Connect (staging OAuth app): create manual event → appears in provider calendar; update/cancel in EloSync propagates (async — confirm Horizon **`calendar-sync`** worker).
11. With Connect active: create a Task with `due_at`, a Lead follow-up, and a Meeting → each projected overlay appears on the provider calendar; clear due / cancel meeting → provider event cancelled.
12. Organizer disconnects provider → new manual/overlay events no longer push (existing provider copies remain).

## Rollback note

Catalog/permission data migrations are intentionally irreversible; use a forward migration to retire the module if required. Roll the **1.5.0** bump `down` → **1.4.0** only with matching code rollback.