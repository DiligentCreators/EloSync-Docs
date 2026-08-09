# Daily CRM summary — Production Report

| Field | Value |
|-------|--------|
| **Branch** | `feature/daily-crm-summary` |
| **Date** | 2026-07-23 |
| **Status** | **Ready for GA** after migrate + emails worker smoke (Critical/High audit items addressed) |
| **Repos** | SaaS-Backend, SaaS-Frontend, SaaS-Docs |

---

## Summary

At workspace **Daily Reminder Time** (`task_reminder_time`, default `09:00` local), `crm:send-due-notifications` sends mail-only CRM snapshots in addition to the existing task due digest:

| Recipient | Email |
|-----------|--------|
| Workspace **Owner** (`superadmin`), or any user with `receive_all_users_daily_summary` | User-wise **team** summary only (not both); roster includes only users with activity |
| Everyone else | **Personal** summary only (skipped when no visible open CRM work) |

Counts:

- **Leads** — open stages only (exclude `is_won` / `is_lost`). Personal digests omit the Leads block when the recipient has **Exclude from lead assignment** (`exclude_from_lead_auto_assign`); those users are emailed only when they have open tasks or scheduled meetings.
- **Tasks** — open / in_progress / waiting (exclude completed / cancelled)
- **Meetings** — scheduled only; distinct host **or** attendee (creator-only not counted)

Team digests still show per-user Leads for full owner visibility.

Mail chrome: Branded module entitled → tenant logo/name; otherwise platform (central EloSync) logo/name via `BrandedMail`. Digests use table-based HTML templates (`resources/views/emails/crm/`) with a navy header label (`DAILY SUMMARY`), tinted metric cards, and per-user CRM cards — shared with the task due digest (`TASK DIGEST`) and department performance digest (`DEPT DIGEST`).

Aggregations run **once per tenant** per command tick. Meeting counts use SQL `COUNT(DISTINCT meeting_id)`.

---

## Deploy checklist

1. Deploy Backend + Frontend + Docs from `feature/daily-crm-summary`.
2. Migrate:
   ```bash
   php artisan migrate --force
   ```
   - `users.receive_all_users_daily_summary` (default `false`)
   - `daily_summary_deliveries` (unique `tenant_id, user_id, digest_date, kind`)
3. Confirm scheduler: `crm:send-due-notifications` every 5 minutes (`withoutOverlapping`, `onOneServer`).
4. Confirm `php artisan queue:work --queue=emails` (and `queue:restart` after deploy).
5. Shared cache driver required for `onOneServer` locks.
6. Configure **Settings → Daily Reminder Time**. Owners receive the team digest automatically; optionally flag non-owner managers with **Receive all-users daily summary**.
7. Confirm **Central → Branding** has a platform `logo_path` uploaded so non-Branded tenant mail shows the EloSync logo (otherwise the header falls back to text app name).
8. Smoke:
   - Past reminder time → personal mail to unflagged non-owner with open CRM work
   - Team mail to Owner without the flag (only users with activity)
   - Team mail to flagged non-owner
   - Excluded-from-lead-assignment user with only leads → no personal mail; with tasks → personal mail without Leads block
   - Without Branded: mail header uses platform logo; with Branded + tenant logo: tenant logo
   - HTML body shows navy header label (`DAILY SUMMARY`) and metric/user cards (not plain Markdown lines)
   - Second cron tick → no duplicate
   - Ledger `queued` → `sent`; stale `queued` (>45m) reclaimable (max 5 attempts)
   - Watch `emails` queue depth on the first morning after deploy (Owners now get team mail whenever any member has activity)
9. Keep scheduler + emails workers healthy through the local reminder window (no midnight catch-up).

---

## Monitoring

| Signal | What to watch |
|--------|----------------|
| `daily_summary_deliveries.status = queued` older than ~45 minutes | Worker down (auto-reclaim after stale window) |
| `attempts >= 5` still `failed` | Cap reached; investigate SMTP/queue |
| `crm:send-due-notifications` duration | Should stay flat vs user count after aggregate-once fix |
| Emails queue depth | Backlog after reminder time |

---

## Audit remediation (2026-07-23)

| Item | Status |
|------|--------|
| Personal N× full-tenant scans | Fixed — `summarizeUsers()` once per tenant |
| Meeting PHP hydration | Fixed — SQL `COUNT(DISTINCT)` union |
| Stale queued / max attempts | Fixed — 45m reclaim, max 5 |
| Team zero-activity noise | Fixed — `summarizeActiveUsers()` |
| Deploy / database / Users API docs | Fixed |
| Pest gaps | Fixed — markSent, suspended, empty, TZ, dedupe, stale reclaim |
| Playwright flag toggle | Added `users.daily-summary-flag.spec.ts` |
| RBAC duplicate Edit rows + privacy note | Fixed |

---

## Related docs

- [Tenant settings (user)](/user-guide/tenant-settings)
- [Tasks (user)](/user-guide/tasks)
- [Tenant RBAC (user)](/user-guide/tenant-rbac)
- [Tenant Users API](/api/tenant-v1-users)
- [Tenant notifications API](/api/tenant-v1-notifications)
- [Database architecture](/developer-guide/database)
- [Tasks production](/deployment/tasks)
- [Changelog](/changelog/)
