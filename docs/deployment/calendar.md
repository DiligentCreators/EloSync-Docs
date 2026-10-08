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
- **1.5.0** — Push Meeting / Task / Lead overlays to connected Google/Outlook (same job + soft-fail)
- **1.6.0** — Inbound pull (provider → EloSync) as read-only External events; Sync now + hourly schedule
- **1.7.0** — Push Project / Contact / Company overlays
- **1.8.0** — Webhook-driven near-real-time inbound (watches + public webhooks; hourly pull as backstop)
- **1.9.0** — Named team/department calendars (`calendars` table, `calendar_id`, `calendar.manage_calendars`)

Bump: migrate-only through `2026_10_08_170000_bump_calendar_module_to_1_9_0` (do **not** `db:seed`).

## Environment (Calendar sync — 1.4.0+)

Google/Microsoft OAuth apps are **platform-wide** (unlike Meetings, which is per-workspace). Set in platform `.env`:

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CALENDAR_CLIENT_ID` / `GOOGLE_CALENDAR_CLIENT_SECRET` | Google Calendar API OAuth app; leave unset to disable Google Connect (SPA shows "not configured") |
| `MICROSOFT_CALENDAR_CLIENT_ID` / `MICROSOFT_CALENDAR_CLIENT_SECRET` / `MICROSOFT_CALENDAR_TENANT` | Microsoft Graph OAuth app (`MICROSOFT_CALENDAR_TENANT` defaults to `common`); leave unset to disable Outlook Connect |
| `APP_URL` | Builds the fixed OAuth callback and webhook base: `/api/oauth/calendar-sync/{provider}/callback`, `/webhooks/calendar-sync/{provider}` (HTTPS in production) |
| `FRONTEND_URL` | SPA return URL after OAuth (`/#/calendar?integrations=…`) |
| `CALENDAR_SYNC_PROVIDERS_FAKE` | Optional local/CI only; **ignored / forced off in production** |

Register the platform callback URL once on each OAuth app (Google Cloud Console / Azure AD app registration) — not per tenant. For **1.8.0**, also register the public webhook notification URL with each provider.

## Smoke

1. Confirm marketplace module `calendar` exists and is installed on a test workspace.
2. Owner: `GET /api/tenant/v1/calendar/events` → 200.
3. Create event → appears on Week (default), Day, Month, and Agenda.
4. On Week/Day, drag an event to a new slot → persists after refresh (`PUT` succeeds; toast “Event rescheduled”).
5. Staff without `view_all` cannot list another user’s **manual** events unless shared.
6. Meeting invitee (staff) lists/views the projected meeting event with `read_only: true`; `PUT`/`cancel`/`DELETE` → 403.
7. Share a manual event as viewer → sharee lists with `read_only: true`; as editor → can mutate.
8. Dashboard includes `calendar` upcoming widget when entitled (invitee/share scope included).

Go-live: [Invitee ACL 1.2.0](/deployment/calendar-invitee-acl-1-2-0-production-readiness) · [Shares 1.3.0](/deployment/calendar-event-shares-1-3-0-production-readiness) · [Sync 1.4.0](/deployment/calendar-google-outlook-sync-1-4-0-production-readiness) · [Overlay push 1.5.0](/deployment/calendar-overlay-provider-push-1-5-0-production-readiness) · [Inbound 1.6.0](/deployment/calendar-two-way-inbound-1-6-0-production-readiness) · [P/C/C push 1.7.0](/deployment/calendar-overlay-provider-push-1-7-0-production-readiness) · [Webhooks 1.8.0](/deployment/calendar-webhook-inbound-1-8-0-production-readiness) · [Named calendars 1.9.0](/deployment/calendar-named-calendars-1-9-0-production-readiness).

### Smoke (Calendar sync — 1.4.0–1.8.0)

9. Admin with `calendar.manage_integrations`: Calendar → **Sync** lists Google + Microsoft; Connect disabled when platform OAuth env is unset; copy mentions Meeting/Task/Lead/Project/Contact/Company overlays and near-real-time inbound.
10. After Connect (staging OAuth app): create manual event → appears in provider calendar; update/cancel in EloSync propagates (async — confirm Horizon **`calendar-sync`** worker).
11. With Connect active: create a Task with `due_at`, a Lead follow-up, a Meeting, and a Project/Contact/Company overlay → each appears on the provider calendar; clear due / cancel → provider event cancelled.
12. Sync now / provider-side create → External event; “Near real-time” badge when watch is active; scheduler runs hourly pull + daily watch renewal.
13. Organizer disconnects provider → new events no longer push/pull (existing provider copies remain).

### Smoke (Named calendars — 1.9.0)

14. Admin/manager: **Manage calendars** → create named calendar (optional department when Departments installed).
15. Create event on that calendar → filter chip shows it; department member sees it; outsider without `view_all` does not.

## Rollback note

Catalog/permission data migrations are intentionally irreversible; use a forward migration to retire the module if required. Roll catalog bumps only with matching code rollback.