# Leads inactivity manager digest (1.9.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-05 |
| **Status** | **Go for production** (migrate catalog + deploy SPA + restart `emails` queue) |
| **Scope** | Replace per-lead inactivity bursts with one assignee digest and one manager table email; keep assignment; Settings → Leads knobs; catalog **leads 1.8.0 → 1.9.0** |
| **Companion** | [Leads developer guide](/developer-guide/leads) · [Tenant settings](/user-guide/tenant-settings) · [Upgrade](/deployment/upgrade) · [CHANGELOG](/changelog/) |

---

## Executive summary

Idle assigned leads no longer fire one in-app/push notification per record. The existing daily `leads:notify-inactive` job groups idle leads per assignee and per manager (department manager, else workspace owner). Assignees get one bell/push digest. Managers get the same plus one branded HTML email with clickable lead name, phone, and email. **Leads stay assigned.** Won/Lost stages remain excluded. New workspace settings control Active-only, skip future follow-ups, manager email, assignee notify, and reminder cadence.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (existing settings + notification stack; no parallel shell) | **Pass** |
| Assignment unchanged | **Pass** — command never writes `assigned_to` |
| Won/Lost still skipped | **Pass** — Pest |
| Active-only skips Closed | **Pass** — Pest |
| Future pending follow-up skipped | **Pass** — Pest (`UtcInstant` vs `due_at`) |
| One digest per recipient (not per lead) | **Pass** — Pest two-lead case |
| Manager mail gated by `leads.inactivity_manager_email` | **Pass** — Pest |
| Threshold `0` disables job | **Pass** — Pest |
| Reminder period dedupe (default 7 working days) | **Pass** — Pest |
| Settings GET/PUT for new keys | **Pass** — Pest |
| Catalog migrate-only **1.9.0** + CatalogSeeder companion | **Pass** |
| Queued manager mail CTA baked while tenancy is initialized | **Pass** — `listUrl` + per-lead URLs built in the command |

## Findings and remediations

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| L-01 | High | Per-lead alerts on a backlog (100s of push/in-app) | Digests per recipient; default reminder period 7 working days |
| L-02 | High | First-crossing modulo would skip already-idle backlog | Include all `idleDays >= threshold` when reminder > 0; period key on recipient dedupe |
| L-03 | Medium | Queued `toMail()` calling `FrontendUrl::spa` after `tenancy()->end()` | Bake `listUrl` and row URLs in the command while tenancy is live |
| L-04 | Low | Optional `email_notifications` defaults off would hide manager mail | Gated by `leads.inactivity_manager_email` (default **on**) |
| L-05 | Info | Legacy `LeadInactiveNotification` / `LeadInactiveOwnerNotification` unused by the job | Kept for already-queued jobs and historical database rows |

## What shipped

### Backend

- Settings: `leads.inactivity_active_only`, `leads.inactivity_skip_pending_follow_up`, `leads.inactivity_manager_email`, `leads.inactivity_assignee_notify`, `leads.inactivity_reminder_working_days`
- `LeadInactivityService` eligibility + digest rows + period dedupe keys
- `NotifyInactiveLeadsCommand` grouped sends
- `LeadInactiveDigestNotification` (`lead.inactive.digest`)
- `LeadInactiveManagerDigestNotification` (`lead.inactive_escalation.digest` + branded table mail)
- Catalog migration `2026_10_04_193718_bump_leads_module_to_1_9_0`

### Frontend

- Settings → Leads controls (underscore RHF keys)
- Notification registry for digest types (list href `/leads`)
- Playwright: `e2e/tests/settings/tenant-settings.leads-inactivity.spec.ts` (one demo login session)

### Docs

- User/developer tenant-settings, Leads guides, upgrade, roadmap, changelog, this audit

## Test evidence

```
herd php artisan test --compact tests/Feature/Tenant/Notification/LeadInactiveNotificationTest.php
Tests: 12 passed (37 assertions)
```

`vendor/bin/pint --dirty --format agent` — pass.

Playwright `npm run test:e2e:leads-inactivity` (`--project=tenant`): **1 passed** — one-session validate (91 / −1), save 5 / 14 + Active-only off, reload persists, restore 3 / 7 + Active-only on.

## Known limitations / deferred

- Manager table cap is 25 rows plus “and X more”; full set is still in the in-app digest count.
- Reminder `0` only includes leads on the exact threshold-crossing working day (missed scheduler day is not backfilled).
- No live SMTP assertion in CI (`Notification::fake()`). Staging should confirm one manager HTML mail after `leads:notify-inactive`.
- Historical in-app rows of type `lead.inactive` remain in the registry for old notifications.

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `leads` → **1.9.0** (do **not** `db:seed`).
2. `php artisan queue:restart`.
3. Settings → Leads: set invalid 91 days → client validation; save 5 / 14 → reload persists; restore 3 / 7.
4. Create two Active assigned leads older than the threshold, run `php artisan leads:notify-inactive`. Assignee: **one** digest. Manager: **one** email with two clickable rows. Confirm `assigned_to` unchanged.
5. Move a lead to Won: it must not appear in the next digest.

## Rollback

Roll back the catalog migration (`down()` → **1.8.0**) after rolling back application code. Settings rows are additive; unused keys are harmless. Restore the previous command/notification classes to return to per-lead alerts.
