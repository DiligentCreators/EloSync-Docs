# Companies — Developer Guide

Mirror of the [Contacts developer guide](/developer-guide/contacts) / [Leads developer guide](/developer-guide/leads). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Company.php`, `CompanyNote`, `CompanyActivity`, `CompanyFollowUp`, `CompanyImport` |
| Enum | `app/Enums/Tenant/CompanyActivityTypeEnum`, `FollowUpStatusEnum` (shared with Contacts), `CompanyImportStatusEnum` |
| Service | `app/Services/Tenant/CompanyService.php` (+ `ScopesToAssignee`) |
| Export | `app/Exports/CompaniesExport.php` |
| Import framework | `app/Import/*` (shared with Leads/Contacts) |
| Company import handler | `app/Import/Company/CompanyImportHandler.php`, `CompanyImportValidator`, `CompanyImportMapper`, `app/Import/CompanyImportHistory.php`, `app/Import/CompanyImportManager.php` |
| Import job | `app/Jobs/ProcessCompanyImportJob.php` → queue `imports` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/CompanyController.php`, `CompanyImportController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Company/*` (incl. `Store/UpdateCompanyFollowUpRequest`, `Upload/UpdateCompanyImport*Request`) |
| Resources | `app/Http/Resources/Tenant/Api/V1/Company/*` (incl. `CompanyFollowUpResource`, `CompanyImportResource`) |
| Policy | `app/Policies/CompanyPolicy.php` |
| Events | `app/Events/Company*.php` (incl. `CompanyFollowUpCreated`, `CompanyFollowUpCompleted`) |
| Subscriber | `app/Listeners/CompanyEventSubscriber.php` (audit + assignment/follow-up notification) |
| Notifications | `app/Notifications/Tenant/Company/CompanyAssignedNotification.php`, `CompanyFollowUpCreatedNotification.php`, `CompanyFollowUpDueNotification.php` |
| Placeholders | `app/Services/Tenant/CommunicationTemplates/Providers/CompanyPlaceholderProvider.php` |
| Due reminders | `app/Console/Commands/SendCrmDueNotificationsCommand.php::notifyCompanyFollowUps()` (`crm:send-due-notifications`, daily; entitlement-gated) |
| Factories | `database/factories/CompanyFollowUpFactory.php`, `CompanyImportFactory.php` |
| Tests | `tests/Feature/Tenant/Company/CompanyTest.php`, `CompanyFollowUpTest.php`, `CompanyImportTest.php`, `CompanyExportTest.php`; `tests/Helpers/CompanyImport.php` |

## Domain notes

- Assignee scoping via `ScopesToAssignee` with `companies.assign`; without it, users only see companies assigned to them (view/update/list/stats).
- `companies.force.delete` is not granted to any default role — owner/superadmin only, matching Leads/Tasks/Contacts.
- Contact → Company linkage: `contacts.company_id` (nullable FK). `ContactService` resolves writes so that when `company_id` is set, the legacy `company` string is synced to the linked Company name. List/detail resources expose `linked_company` (`id`, `uuid`, `name`) when loaded.
- Assignee eligibility mirrors Leads/Contacts (`EligibleCompanyAssignee` / `User::isEligibleLeadAssignee`).
- Soft delete only — no stage/status workflow.
- **Party billing hub:** same pattern as Contacts (`CustomerPartyBillingPanel` with `partyKind: 'company'`). Backend reuses customer statement services scoped by `company_id`. List deep links `?company=` on invoices, payments, quotations, credit notes. Statement includes `opening_balance` + `balance_due`; PDF available.
- **Related records hub (1.3.0):** `CustomerPartyRelatedHub` with `partyKind: 'company'` — opportunities / help-desk / projects / documents + `?company=` list deep links.
- **Follow-ups (1.4.0):** `company_follow_ups` (`company_id`, `assigned_to` nullable FK → users, `title`, `notes`, `due_at`, `completed_at`, `status`). Shared `FollowUpStatusEnum` (`pending` | `completed` | `cancelled`) — same simple lifecycle as Contacts; no tag-driven auto/force-follow-up. `CompanyService::createFollowUp()` / `updateFollowUp()` / `completeFollowUp()` default `assigned_to` to the company's assignee, denormalize `companies.next_follow_up_at` (earliest **pending** `due_at`), and fire `CompanyFollowUpCreated` / `CompanyFollowUpCompleted` (audit + assignee notification on create, audit-only on complete).
- **Calendar projection:** `CompanyService::projectCalendar()` upserts a `CalendarEvent` (`source_type='company'`, `source_id`, `CalendarEventSourceEnum::Company`) titled after the company, 1 hour starting at `next_follow_up_at`, organizer = assignee (falls back to actor). Entitlement-gated on `calendar`; clears the projection when `next_follow_up_at` is null / no organizer, and on company delete.
- **Due/overdue reminders:** `SendCrmDueNotificationsCommand::notifyCompanyFollowUps()` (per-tenant, gated by `EntitlementService::hasModule('companies')`) mirrors the Contact reminder path; notifies via `CompanyFollowUpDueNotification`, idempotent per user/day (`due|overdue:company_follow_up:{id}:{date}`).
- **Import (1.4.0):** `CompanyImportHandler` fields: `name` (required), `email`, `phone`, `website`, `industry`, `source`, `assigned_to` (resolved by email, validated via `EligibleCompanyAssignee`). Duplicate detection matches `email` **or** `phone` from `unique_fields`; modes `skip` | `update` | `keep` (`ImportDuplicateModeEnum`). Every row goes through `CompanyService::create()` / `update()`. **No `assignment_mode`** — same as Contacts, no equal-distribute; only an explicit `assigned_to` column sets the assignee. Single table `company_imports`; async via `ProcessCompanyImportJob::dispatch(...)->onQueue('imports')`. Platform audit: `company_import_completed` / `company_import_failed`.
- **Export (1.4.0):** `CompaniesExport` streams CSV or a minimal hand-rolled XLSX of the current filtered/scoped query — id, name, email, phone, website, industry, source, assignee, creator, contacts count, `next_follow_up_at`, created_at.

## Permissions

`config/tenant-permissions.php`:

```
companies.view | create | update | delete | restore | force.delete | assign | export | import
```

Routes use `module:companies` then `can:companies.*` / policies.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-companies.md](/api/tenant-v1-companies).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/companies` | view |
| GET | `/companies/stats` | view |
| GET | `/companies/{company}` | view |
| GET | `/companies/{company}/timeline` | view |
| POST | `/companies` | create |
| PUT | `/companies/{company}` | update |
| DELETE | `/companies/{company}` | delete |
| POST | `/companies/{company}/restore` | restore |
| DELETE | `/companies/{company}/force` | force.delete |
| POST | `/companies/{company}/assign` | assign |
| POST | `/companies/{company}/notes` | update |
| GET | `/companies/{company}/billing-summary` | view |
| GET | `/companies/{company}/statement` | view |
| GET | `/companies/{company}/statement.pdf` | view |
| POST | `/companies/{company}/follow-ups` | update |
| PUT | `/companies/{company}/follow-ups/{followUp}` | update |
| POST | `/companies/{company}/follow-ups/{followUp}/complete` | update |
| GET | `/companies/export` | export |
| GET | `/companies/import/template` | import |
| GET/POST | `/companies/imports` | import |
| GET/PUT | `/companies/imports/{import}` | import |
| PUT | `/companies/imports/{import}/options` | import |
| POST | `/companies/imports/{import}/preview` | import |
| POST | `/companies/imports/{import}/run` | import |
| GET | `/companies/imports/{import}/file` | import |
| GET | `/companies/imports/{import}/failed-records` | import |
| GET | `/companies/imports/{import}/error-report` | import |

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/companies/companies-page.tsx` (table + filters + KPIs) |
| Form | `company-form-dialog.tsx` |
| Detail | `company-view-page.tsx` (details, notes, activity, follow-ups; billing hub; related hub) |
| List sheet | `company-record-sheet.tsx` + shared `ModuleRecordSheet` (peek overview incl. next follow-up) |
| Statement | `src/pages/crm/party-statement-page.tsx` (`CompanyStatementPage`) |
| Import wizard | `company-import-dialog.tsx` (5-step: upload → map → options → preview → run) |
| Import history | `company-import-history-dialog.tsx` |
| Service | `companyService` in `src/api/services.ts` (`billingSummary`, `statement`, `downloadStatementPdf`, `export`, `importTemplate`, `listImports`, `uploadImport`, `getImport`, `updateImportMapping`, `updateImportOptions`, `createFollowUp`, `updateFollowUp`, `completeFollowUp`) |
| Notification registry | `src/notifications/modules/companies.ts` (follow-up created/due) |
| Nav | `permission: companies.view`, `module: 'companies'` (between Leads and Contacts) |
| Dashboard | `RecentCompaniesWidget` (`recent_companies` widget) + `create_company` quick action in `tenant-dashboard-widgets.tsx` / `tenant-dashboard-page.tsx` |
| Contact link | `contact-form-dialog.tsx` company picker when `module:companies` + `companies.view`; list/detail show `linked_company?.name \|\| company` |
| Party billing | Hub + deep links + statement; shared Pest PartyBilling suite; Playwright company case in `contacts.party-billing.spec.ts` |
| Catalog | **1.4.0** (follow-ups + import/export) |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Company/CompanyTest.php
php artisan test --compact tests/Feature/Tenant/Company/CompanyFollowUpTest.php
php artisan test --compact tests/Feature/Tenant/Company/CompanyImportTest.php
php artisan test --compact tests/Feature/Tenant/Company/CompanyExportTest.php
php artisan test --compact tests/Feature/Tenant/PartyBilling/PartyBillingSummaryAndStatementTest.php

# Worker (import jobs)
php artisan queue:work --queue=imports,default

# Frontend
npm run typecheck && npm run lint && npm run build
npm run test:e2e:companies
```

| Suite | Location |
|-------|----------|
| Pest | `tests/Feature/Tenant/Company/CompanyTest.php`, `CompanyFollowUpTest.php`, `CompanyImportTest.php`, `CompanyExportTest.php`; PartyBilling suite |
| E2E | `e2e/tests/companies/`, including `companies.follow-ups.spec.ts`, `companies.import.spec.ts`; company hub smoke in `contacts.party-billing.spec.ts` |

## Logging

- Spatie `LogsActivity` on `Company` (log name `companies`)
- Domain `company_activities` timeline
- `PlatformAuditService` via `CompanyEventSubscriber`

## Intentional differences from Leads / Tasks

| Leads / Tasks | Companies |
|-------|--------|
| Stages / status workflow | No workflow — directory record |
| Follow-ups: tag-driven auto/force-follow-up, `LeadFollowUpStatusEnum` | Follow-ups (**1.4.0**) are plain create/reschedule/complete on shared `FollowUpStatusEnum`; no tags, no forced follow-up |
| Import `assignment_mode` (`none` \| `equal` department distribute) | Import (**1.4.0**) has **no `assignment_mode`** — `assigned_to` column or manual-create default only |
| Board view | List/table only |
| `convert` / `complete` | None |

## Deferred

- Legacy contact `company` string → Company backfill job
- Meta invent Companies
