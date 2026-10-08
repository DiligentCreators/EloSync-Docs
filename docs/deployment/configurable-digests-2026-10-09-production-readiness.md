# Configurable digests (invoices 1.11.0 / departments 1.2.0 / attendance 1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-09 |
| **Status** | **Go for production** (migrate-only + deploy SPA + restart scheduler/queue) |
| **Scope** | One open-invoice digest (settings-gated); department **report recipients** for attendance + department task digests; catalog **invoices 1.10.0 → 1.11.0**, **departments 1.1.1 → 1.2.0**, **attendance 1.7.0 → 1.8.0** |
| **Companion** | [Invoices](/deployment/invoices) · [Attendance](/deployment/attendance) · [Upgrade](/deployment/upgrade) · [CHANGELOG](/changelog/) |

---

## Executive summary

Workspace owners configure a single open-invoice digest (draft / unpaid / partial, Overdue Yes/No, all rows) via Settings → Notifications. Attendance late/yesterday digests and a new department task summary digest email only **report recipients** on each department (manager not implied; no owner fallback; multi-dept recipients get one combined email). Defaults stay off until configured.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (existing settings + department form; no parallel shell) | **Pass** |
| Invoice digest default off | **Pass** — Pest + SPA default |
| Invoice recipients = `invoices.digest_user_ids` only | **Pass** — Pest |
| Draft amount uses `balance_due` | **Pass** — Pest / service |
| Attendance digests: report recipients only | **Pass** — Pest |
| Manager not auto-included | **Pass** — Pest |
| Multi-department combined email | **Pass** — Pest |
| Department task digest at Daily Reminder Time | **Pass** — Pest |
| Catalog migrate-only + CatalogSeeder companions | **Pass** |
| SPA invoice digest + report recipients UI | **Pass** — Playwright headed |
| Docs + CHANGELOG same delivery | **Pass** |

## Findings and remediations

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| D-01 | High | Prior overdue digest emailed all billing managers and capped rows | Settings-gated recipients; open statuses; no row cap |
| D-02 | High | Attendance digests fell back to owner / implied manager | Report recipients only; empty list → no send |
| D-03 | Medium | Two conceptual invoice digests | Unified open-invoice digest with Overdue column |
| D-04 | Medium | MySQL index name on `customer_invoice_edit_requests` exceeded 64 chars | Short named index `cie_edit_req_tenant_invoice_status_idx` |
| D-05 | Low | Operators must assign recipients after deploy | Documented in changelog / upgrade / this audit |
| D-06 | Medium | Recipient checklists only loaded first page of users | Searchable user lists on invoice digest + department report recipients |
| D-07 | High | `GET /users` excludes `Auth::id()`, so owners could not pick themselves as digest/report recipients | SPA merges current user into invoice digest + department report recipient pickers (search-aware) |

## What shipped

### Backend

- Settings: `invoices.digest_enabled`, `invoices.digest_time`, `invoices.digest_user_ids`
- `CustomerInvoiceOverdueDigestService` open-invoice table + configured recipients
- `department_report_user` pivot + department API `report_recipient_ids`
- `DepartmentReportDigestService` + `DepartmentTaskDigestNotification`
- Attendance commands scoped to report recipients (combined multi-dept)
- Catalog bump migration `2026_10_08_215316_bump_invoices_departments_attendance_for_digest_config`

### Frontend

- Settings → Notifications invoice digest controls
- Department create/edit **Report recipients** multi-select
- Notification registry for `invoice.digest` / department task digest
- Playwright: `tenant-settings.invoice-digest.spec.ts`, departments modules report-recipient coverage

### Docs

- User/developer/deployment guides, upgrade section, changelog, this audit

## Test evidence

```
herd php artisan test --compact \
  tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceExportAndDigestTest.php \
  tests/Feature/Tenant/Department/DepartmentReportRecipientDigestTest.php \
  tests/Feature/Tenant/Attendance/AttendanceDailyReportDigestTest.php \
  tests/Feature/Central/Catalog/DigestConfigModuleBumpTest.php
```

Pest: **25 passed** (105 assertions).

Playwright (headed, one login session, `--workers=1`, system Chrome via `E2E_BROWSER_CHANNEL=chrome`):

- `npm run test:e2e:invoice-digest:headed` — **1 passed**
- `npm run test:e2e:departments:modules:headed` — **4 passed**

`vendor/bin/pint --dirty --format agent` — pass.

## Known limitations / deferred

- No live SMTP assertion in CI (`Notification::fake()`). Staging should confirm one HTML mail after enabling digests and running the Artisan commands.
- Invoice digest with enabled=true and empty recipient list sends nothing (by design).
- Attendance digests remain off until Settings toggles are enabled **and** report recipients are assigned.

## Upgrade & staging smoke

1. `php artisan migrate --force` — `department_report_user` + catalog bumps (do **not** `db:seed`).
2. Confirm catalog: invoices **1.11.0**, departments **1.2.0**, attendance **1.8.0**.
3. Deploy Frontend SPA.
4. `php artisan queue:restart` (and ensure scheduler runs every minute).
5. Settings → Notifications: invalid empty digest time → client validation; enable digest, set time, pick recipients → reload persists.
6. Departments: create/edit with report recipients; confirm attendance/task digests only after recipients are set.
7. Optional: seed open invoices / late attendance, run `invoices:send-overdue-digest` and `attendance:send-daily-reports` past send times.

## Rollback

Roll back catalog + `department_report_user` migrations after rolling back application code. Settings rows are additive; unused keys are harmless. Restore prior digest recipient resolution to return to manager/owner behavior.
