# Calendar invitee ACL (1.2.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-27 |
| **Status** | **Go for production** |
| **Scope** | Meeting invitees list/view projected calendar events (read-only); catalog **calendar 1.1.0 → 1.2.0** |
| **Companion** | [Calendar deployment](./calendar) · [Calendar user guide](/user-guide/calendar) · [CHANGELOG](/changelog/) |

---

## Executive summary

Internal meeting invitees (rows on `meeting_attendees` with `user_id`) can see the host’s meeting projection on Calendar list, show, upcoming, and dashboard feeds without `calendar.view_all`. Mutations remain organizer- or `view_all`-only. API responses expose `read_only` so the SPA shows a **View only** badge and disables drag. No new Spatie permissions. Not Google/Outlook sync and not team shared calendars.

**Go / No-Go:** **Go**. Cutover: migrate-only catalog bump, deploy Backend then SPA.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Invitee list + show + upcoming scope via `meeting_attendees` | **Pass** |
| Non-invitee staff still forbidden on foreign events | **Pass** |
| Invitee update / cancel / delete → 403 | **Pass** |
| `read_only` on resource for non-organizer without `view_all` | **Pass** |
| Catalog migrate-only **1.2.0** + CatalogSeeder | **Pass** |
| Pest `MeetingInviteeCalendarAclTest` | **Pass** |
| Playwright calendar invitee view-only | **Pass** (`E2E_VIDEO=off` + Chrome channel) |
| Docs + roadmap (invitee ACL removed from deferred) | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog → **1.2.0** (do **not** `db:seed`).
2. Deploy Backend, then SPA.
3. Smoke: meeting with internal invitee → invitee Agenda shows event → **View only** → no Edit; `PUT` 403.

## Rollback

Roll back bump migration (`down` → **1.1.0**) with matching Backend/Frontend rollback so invitees lose list visibility again.
