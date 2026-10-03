# Pulse slow-path hardening — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-03 |
| **Status** | **Go for production** |
| **Scope** | Platform performance remediations from Laravel Pulse slow requests/queries/jobs: attendance list/stats/today, email logs list, email IMAP sync storms, public bootstrap / dashboard / notification unread caching, CRM + Live Chat safe realtime dispatch, mail transport fail-fast |
| **Companion** | [Laravel Forge](./laravel-forge) · [Email deploy](./email) · [Attendance deploy](./attendance) · [Notifications](./notifications) · [Attendance 1.6.0 readiness](./attendance-department-scoped-1-6-0-production-readiness) · [Uncached follow-up](./pulse-uncached-slow-paths-production-readiness) · [CHANGELOG](/changelog/) |

---

## Executive summary

Pulse surfaced expensive list/stats queries (attendance, email logs), IMAP sync retry storms, and broadcast/mail noise that flooded Pulse when Reverb or SMTP was misconfigured. This ship hardens those paths with indexes, selective column lists, date-range predicates (no `whereDate` wrappers), bounded unique sync jobs, short-TTL caches with correct invalidation, and a shared `SafeRealtimeBroadcast` guard. Attendance GET paths keep **department-manager visibility** from attendance **1.6.0** (`visibleEmployeeIds`).

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Branch rebased onto `main` (attendance 1.6.0 + ai 1.20.0) | **Pass** |
| Attendance read service uses `constrainQueryToVisibleEmployees` (not Spatie-manager org-wide) | **Pass** |
| Email log list omits `body_*` longtext; `has_body` via SQL expression | **Pass** (tenant + central) |
| List/prune indexes on `tenant_email_logs` / `email_logs` / `attendance_records` | **Pass** (migrate-only) |
| `SyncEmailAccountJob` unique + tries=1 + error backoff on `updated_at` | **Pass** |
| IMAP fetch loads bodies on one connection; ≤25 messages/folder/run | **Pass** |
| Public bootstrap cache invalidates on tenant epoch **and** central fingerprint | **Pass** |
| `SafeRealtimeBroadcast` skips unconfigured drivers (requires key **and** secret); throttles failure reports; tests always invoke callback | **Pass** |
| Lead / Live Chat board events observable under `Event::fake` without incomplete Reverb config | **Pass** |
| Mail config errors fail jobs without retry storms | **Pass** |
| Docs + CHANGELOG | **Pass** |

## Audit findings (initial → remediated)

| ID | Severity | Finding | Remediation |
|----|----------|---------|-------------|
| A1 | **P0** | Branch was behind `main`; `AttendanceRecordReadService` copied pre-1.6.0 scoping (`canManageOthers` / Spatie `manager` = org-wide) | Fast-forward merge `origin/main`; read service calls `constrainQueryToVisibleEmployees` / `visibleEmployeeIds` |
| A2 | **P0** | `SafeRealtimeBroadcast` no-ops when `BROADCAST_CONNECTION=null` — would fail Lead board dispatch assertions and skip intentional throw-path coverage | `LeadRealtimeBoardTest` + Live Chat broadcast tests set Reverb key; production still requires configured Reverb for board sync |
| A3 | **P1** | Central email log list still selected `*` / `whereDate` while resource expected `list_has_body` | Mirror tenant list select + range filters on `Central\EmailLogController` |
| A4 | **P1** | Public bootstrap cache key ignored central settings changes (maintenance, registration, password policy) | Include `xxh3` fingerprint of central `publicBootstrap()` in cache key |
| A5 | **P2** | Unread notification badge cache (15s) only forgotten on mark-read | Accepted — short TTL; new notifications appear within 15s |
| A6 | **P2** | Dashboard widget cache 30s with no write invalidation | Accepted — aggregates tolerate brief staleness |
| A7 | **P2** | Docs / CHANGELOG missing for platform performance ship | This page + changelog entry |

## What shipped

### Backend

- **Attendance:** `AttendanceRecordReadService` for GET list/stats/today — date range predicates, grouped stats SQL, indexes (`date`+`status`, `date`+`employee_id`, open check-in). Visibility matches write service (Owner/Admin org-wide; department managers managed team; else self).
- **Email logs:** Tenant + central list omit body columns; `has_body` from `list_has_body`; `created_at` range filters; indexes for list + prune.
- **Email sync:** `ShouldBeUnique` per tenant/account; `tries = 1`; timeout 180s; error accounts back off from `updated_at`; ≤25 messages/folder; IMAP body on same connection; secret redaction in logs/errors.
- **Mail:** Permanent SMTP 5xx / Dsn `TypeError` / relay-denied classified as config errors; `EmailManager::clearRuntimeSecrets` resets `mail.default` to `log`; SMTP host required before Dsn build.
- **Realtime:** `App\Support\Realtime\SafeRealtimeBroadcast` used by Leads board + Live Chat presence/conversation paths.
- **Caching:** Tenant public bootstrap + admin settings epoch; notification unread count 15s; dashboard widgets 30s. Uncached-path follow-up (hydration / entitlement reuse): [Pulse uncached slow-path follow-up](./pulse-uncached-slow-paths-production-readiness).
- **CRM notifications:** Broadcast channel delayed 3s; PK `exists` check before broadcast payload.
- **Tests:** Pest coverage for the above; `phpunit.xml` stable `APP_KEY` for encrypted casts.

### Docs

- This readiness page; CHANGELOG; deployment index + VitePress nav; Email / Attendance deploy cross-links where relevant.

## Test evidence

```
herd php artisan test --compact ^
  tests/Feature/Tenant/Attendance/AttendanceRecordReadServiceTest.php ^
  tests/Feature/Tenant/Attendance/AttendanceTest.php ^
  tests/Feature/Email/TenantEmailLogIndexQueryTest.php ^
  tests/Feature/Tenant/Email/SyncEmailAccountJobTest.php ^
  tests/Feature/Tenant/LiveChat/SafeRealtimeBroadcastTest.php ^
  tests/Feature/Tenant/Lead/LeadRealtimeBoardTest.php ^
  tests/Feature/Tenant/Settings/PublicBootstrapCacheTest.php ^
  tests/Feature/Tenant/Notification/BroadcastsCrmNotificationDelayTest.php ^
  tests/Unit/Mail/MailTransportFailureTest.php
```

`vendor/bin/pint --dirty --format agent` on Backend PHP changes.

## Upgrade & staging smoke

1. `php artisan migrate --force` — indexes only (no catalog bump). Do **not** `db:seed`.
2. Confirm Horizon `supervisor-email-sync` still covers `email-sync` (job timeout 180s &lt; worker 300s).
3. Pulse: after deploy, email-log list and attendance list/stats should drop out of slow-query top offenders under normal load.
4. Lead board + Live Chat: with Reverb configured, create a lead / send a chat message — realtime still works; with Reverb down, writes succeed and Pulse is not flooded with repeated broadcast exceptions.
5. Department manager: attendance list/stats show only managed team (regression from 1.6.0).

## Rollback

Roll back application code + reverse the two index migrations (`down()`). No catalog version change. Caches expire naturally (≤5 minutes for bootstrap).

## Residual risk

- Unread badge / dashboard widget staleness (15–30s) by design.
- Email sync pulls at most 25 messages per folder per run — large backlogs catch up over successive scheduler windows (intentional bound).
- Live Reverb/IMAP smoke remains manual on staging (same as prior realtime/email ships).
