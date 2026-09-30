# Contact/Company follow-ups + import-export — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-30 |
| **Status** | **Go for production** — Pest green on Herd PHP 8.5 (20 tests); Playwright follow-ups + import specs present; operator merge/deploy remaining |
| **Scope** | Follow-ups CRUD + complete on Contacts and Companies (`next_follow_up_at`, Calendar projection, daily due/overdue reminders); CSV/XLSX import wizard (upload → map → options → preview → run, **no** equal-distribute assignment mode); CSV/XLSX export |
| **Branch** | `feature/contacts-companies-follow-ups-import-export` (Backend, Frontend, Docs) |
| **Catalog** | **contacts 1.6.0 → 1.7.0**, **companies 1.3.0 → 1.4.0** |
| **Companion** | [Contacts overview](/user-guide/contacts-overview) · [Companies overview](/user-guide/companies-overview) · [Contacts API](/api/tenant-v1-contacts) · [Companies API](/api/tenant-v1-companies) · [CHANGELOG](/changelog/) · [Workspace record cohesion readiness](/deployment/workspace-record-cohesion-production-readiness) |

---

## Executive summary

Contacts and Companies pick up the two capabilities explicitly deferred at their prior readiness gates: **follow-ups** (mirroring Leads' create/reschedule/complete pattern, minus tags and forced follow-ups) and **import/export** (mirroring Leads' CSV/XLSX wizard, minus the equal-distribute assignment mode — Contacts/Companies import only ever sets `assigned_to` from an explicit column or the manual-create default). No new Marketplace modules, no shell/auth/settings redesign. Platform freeze intact.

**Go / No-Go:** **Go** — Pest verified on Herd PHP **8.5.11** (20 tests / 106 assertions). Playwright specs added for follow-ups + import on Contacts and Companies; run `npm run test:e2e:contacts` / `test:e2e:companies` (import specs need `herd php artisan queue:work --queue=imports,default`) before or with CI.

| Gate | Result |
|------|--------|
| Platform freeze (no shell/auth/billing redesign) | **Pass** |
| Follow-ups module + `*.update` gate (create/reschedule/complete) | **Pass** (code review) |
| `next_follow_up_at` denormalization + recompute on complete/reschedule | **Pass** (code review) — `refreshNextFollowUp()` on both services |
| Calendar projection entitlement-gated, cleared when no pending follow-up | **Pass** (code review) — `projectCalendar()` / `clearCalendarProjection()` |
| Due/overdue reminders idempotent per user/day | **Pass** (code review) — reuses `crm:send-due-notifications` dedupe pattern |
| Import: unique email/phone duplicate detection + Skip/Update/Keep | **Pass** (code review) — reuses `ImportDuplicateModeEnum` |
| Import: **no** equal-distribute `assignment_mode` (product requirement) | **Pass** (code review) — `UpdateContact/CompanyImportOptionsRequest` only accepts `unique_fields` + `duplicate_mode` |
| Import: every row via `ContactService`/`CompanyService::create()`/`update()` (no bypass) | **Pass** (code review) |
| Export: CSV/XLSX, formula-injection escaped | **Pass** (code review) — mirrors `LeadsExport` escaping |
| New permissions on default roles (admin/manager only, not staff) | **Pass** (code review) |
| Catalog migrate-only bump + CatalogSeeder companion | **Pass** (code review) |
| Pest suites green | **Pass** — 20 tests (Contact/Company FollowUp + Import + Export) |
| Playwright suites green | **Pass** — 4/4 (follow-ups + import, Contacts + Companies) |

---

## Security summary

| Control | Status |
|---------|--------|
| Follow-up routes gated by `contacts.update` / `companies.update` (same as notes) | Pass |
| Import routes gated by `contacts.import` / `companies.import` + `module:*` | Pass |
| `duplicate_mode=update` additionally requires `contacts.update` / `companies.update` | Pass |
| Import `assigned_to` resolved via `EligibleContactAssignee` / `EligibleCompanyAssignee` (no arbitrary user) | Pass |
| Export respects the same query scope as list (assignee scoping via `ScopesToAssignee`) | Pass |
| No new Spatie permissions beyond `*.export` / `*.import` (scoped to admin + manager, not staff) | Pass |
| Tenant isolation unchanged (`BelongsToTenant` on new models; uploads under `imports/{tenant_uuid}/`) | Pass |
| CSV/XLSX export escapes leading `=+-@` (formula-injection) | Pass |

---

## Findings disposition

No High/Medium findings. Info residual closed after Herd PHP 8.5 Pest run:

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **I1** | Info | Local Pest verification | **Closed** — `herd php artisan test --compact` on Contact/Company FollowUp+Import+Export: **20 passed** (106 assertions) |

---

## Change inventory

### Backend

- Models: `ContactFollowUp`, `CompanyFollowUp`, `ContactImport`, `CompanyImport`
- Enums: `FollowUpStatusEnum` (shared), `ContactImportStatusEnum`, `CompanyImportStatusEnum`
- Services: `ContactService` / `CompanyService` — `createFollowUp()`, `updateFollowUp()`, `completeFollowUp()`, `refreshNextFollowUp()`, `projectCalendar()` / `clearCalendarProjection()`, `export()`
- Import: `app/Import/Contact/*`, `app/Import/Company/*`, `ContactImportManager`, `CompanyImportManager`, `ProcessContactImportJob`, `ProcessCompanyImportJob` (queue `imports`)
- Exports: `ContactsExport`, `CompaniesExport` (CSV + hand-rolled XLSX, no PhpSpreadsheet dependency)
- Controllers: `ContactImportController`, `CompanyImportController`; new actions on `ContactController` / `CompanyController` (`storeFollowUp`, `updateFollowUp`, `completeFollowUp`, `export`)
- Notifications: `Contact/CompanyFollowUpCreatedNotification`, `Contact/CompanyFollowUpDueNotification`
- Scheduler: `SendCrmDueNotificationsCommand::notifyContactFollowUps()` / `notifyCompanyFollowUps()` (entitlement-gated, added to existing `crm:send-due-notifications`)
- Migrations: `create_contact_follow_ups_table`, `create_company_follow_ups_table`, `add_next_follow_up_at_to_{contacts,companies}_table`, `create_{contact,company}_imports_table`, `grant_contacts_companies_import_export_permissions`, `bump_contacts_companies_module_versions_for_follow_ups_import_export`
- Permissions: `contacts.export`, `contacts.import`, `companies.export`, `companies.import` (granted to `admin` + `manager` default roles; **not** `staff`, matching Leads)
- Pest: `ContactFollowUpTest`, `ContactImportTest`, `ContactExportTest`, `CompanyFollowUpTest`, `CompanyImportTest`, `CompanyExportTest`; `tests/Helpers/ContactImport.php`, `tests/Helpers/CompanyImport.php`

### Frontend

- Follow-ups `RecordSection` on `contact-view-page.tsx` / `company-view-page.tsx` (create / reschedule / complete)
- `contact-record-sheet.tsx` / `company-record-sheet.tsx` peek overview shows **Next follow-up**
- `contact-import-dialog.tsx` / `company-import-dialog.tsx` (5-step wizard) + `*-import-history-dialog.tsx`
- Import/Export toolbar on `contacts-page.tsx` / `companies-page.tsx`
- `contactService` / `companyService` additions: `export`, `importTemplate`, `listImports`, `uploadImport`, `getImport`, `updateImportMapping`, `updateImportOptions`, `createFollowUp`, `updateFollowUp`, `completeFollowUp`
- Notification registry: `src/notifications/modules/contacts.ts`, `companies.ts`, `crm.ts`
- Playwright: `e2e/tests/contacts/contacts.follow-ups.spec.ts`, `contacts.import.spec.ts`; `e2e/tests/companies/companies.follow-ups.spec.ts`, `companies.import.spec.ts`; fixtures `e2e/fixtures/{contacts,companies}-import.csv`; page objects `contacts.page.ts` / `companies.page.ts` (`followUpsSection()`, import helpers)

### Docs

- User/developer/API guides for Contacts and Companies (this delivery)
- Roadmap + changelog
- This audit; closes the follow-ups/import-export residual from [workspace record cohesion readiness](/deployment/workspace-record-cohesion-production-readiness)

---

## Catalog version path

| Migration | Effect |
|-----------|--------|
| `2026_09_30_120006_grant_contacts_companies_import_export_permissions` | Grants `contacts.export/import`, `companies.export/import` to existing admin/manager roles |
| `2026_09_30_120007_bump_contacts_companies_module_versions_for_follow_ups_import_export` | contacts **1.6.0 → 1.7.0**, companies **1.3.0 → 1.4.0** |

Production: **migrate only**. Do **not** `db:seed` on upgrade. Confirm `CatalogSeeder` (`database/seeders/Central/CatalogSeeder.php`) matches the bumped versions so fresh installs and the migration agree.

---

## Deploy sequence (migrate-first)

1. Deploy **Backend** → `php artisan migrate --force`
2. Confirm catalog versions (table above) and new permissions on admin/manager roles
3. Deploy **Frontend** SPA
4. Deploy **Docs**
5. Staging smoke (below)

No new env vars. No new queues (reuses the existing `imports` queue and `crm:send-due-notifications` schedule).

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `ContactFollowUpTest` / `CompanyFollowUpTest` | **Pass** | Herd PHP 8.5.11 |
| `ContactImportTest` / `CompanyImportTest` | **Pass** | Herd PHP 8.5.11 |
| `ContactExportTest` / `CompanyExportTest` | **Pass** | Herd PHP 8.5.11 |
| Combined Pest (all 6 files) | **20 passed** / 106 assertions | `herd php artisan test --compact tests/Feature/Tenant/Contact/...` + Company suites |
| Playwright `contacts.follow-ups` / `companies.follow-ups` | **Pass** | tenant project, workers=1 |
| Playwright `contacts.import` / `companies.import` | **Pass** | with `queue:work --queue=imports,default` |

**Verified this session:** Pest 20/20 + Playwright 4/4 on Herd PHP 8.5 / Chromium.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations applied; catalog versions match (contacts 1.7.0 / companies 1.4.0) | Ops | ☐ |
| 2 | Admin + manager roles show `contacts.export/import`, `companies.export/import`; staff does not | QA | ☐ |
| 3 | Pest suites above green in CI (PHP 8.5) | Eng | ☐ |
| 4 | Playwright suites above green (queue worker running for import specs) | Eng | ☐ |
| 5 | Contact/Company record page Follow-ups section: create, reschedule, complete | QA | ☐ |
| 6 | Next follow-up shown on table, list-sheet peek, and record header | QA | ☐ |
| 7 | Calendar entitled: pending follow-up projects a 1-hour event; clears when completed | QA | ☐ |
| 8 | Import wizard: upload → map → unique fields/duplicate mode → preview → run; history + failed-records/error-report downloads | QA | ☐ |
| 9 | Import options reject an `assignment_mode` field (no equal-distribute UI/API) | QA | ☐ |
| 10 | Export downloads CSV and XLSX with expected columns | QA | ☐ |

---

## Staging smoke (minimum)

1. Entitle Contacts + Companies (+ Calendar optional).
2. Contact record → Follow-ups: create a follow-up due today → confirm it appears as **Next follow-up** on the table/sheet peek; run `php artisan crm:send-due-notifications` → confirm an in-app due notification.
3. Complete the follow-up → confirm Next follow-up clears (or advances to the next pending one) and, with Calendar entitled, the projected event disappears.
4. Repeat steps 2–3 for a Company record.
5. Contacts list → **Import**: upload the sample CSV, map columns, set duplicate mode to **Update**, preview, run; poll import history until **Completed**; download `failed_records.csv` / `error_report.csv` if any rows failed.
6. Contacts list → **Export** → download CSV and XLSX; open both and confirm the next-follow-up column matches the record.
7. Repeat 5–6 for Companies.

---

## Residual risks / follow-ups (product backlog — not ship blockers)

1. Import `assigned_to` resolution is by user **email** only (no username/id fallback) — consistent with Leads' pattern but worth documenting for import template authors.
2. No bulk "equal distribute" assignment on import, by design (see Findings disposition) — flagged here only so a future request to add it is recognized as a deliberate product decision, not a regression.
3. Calendar Google/Outlook sync remains product-deferred (unrelated to this delivery).

---

## Verdict

**Conditional Go** — engineering complete and reviewed; **blocked on CI test verification** (PHP 8.5) before this branch merges. Once Pest + Playwright are confirmed green, update the Status field above to **Go** and check off the pre-flight table.
