# Contacts — Developer Guide

Mirror of the [Leads developer guide](/developer-guide/leads) / [Tasks developer guide](/developer-guide/tasks). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Contact.php`, `ContactNote`, `ContactActivity`, `ContactFollowUp`, `ContactImport` |
| Enum | `app/Enums/Tenant/ContactActivityTypeEnum`, `ContactLifecycleStatusEnum`, `FollowUpStatusEnum` (shared with Companies), `ContactImportStatusEnum` |
| Service | `app/Services/Tenant/ContactService.php` (+ `ScopesToAssignee`) |
| Export | `app/Exports/ContactsExport.php` |
| Import framework | `app/Import/*` (shared with Leads: `ImportFile`, `ImportColumnMapper`, `ImportErrorWriter`, `ImportTemplateGenerator`) |
| Contact import handler | `app/Import/Contact/ContactImportHandler.php`, `ContactImportValidator`, `ContactImportMapper`, `app/Import/ContactImportHistory.php`, `app/Import/ContactImportManager.php` |
| Import job | `app/Jobs/ProcessContactImportJob.php` → queue `imports` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ContactController.php`, `ContactImportController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Contact/*` (incl. `Store/UpdateContactFollowUpRequest`, `Upload/UpdateContactImport*Request`) |
| Resources | `app/Http/Resources/Tenant/Api/V1/Contact/*` (incl. `ContactFollowUpResource`, `ContactImportResource`) |
| Policy | `app/Policies/ContactPolicy.php` |
| Events | `app/Events/Contact*.php` (incl. `ContactFollowUpCreated`, `ContactFollowUpCompleted`) |
| Subscriber | `app/Listeners/ContactEventSubscriber.php` (audit + assignment/follow-up notification) |
| Notifications | `app/Notifications/Tenant/Contact/ContactAssignedNotification.php`, `ContactFollowUpCreatedNotification.php`, `ContactFollowUpDueNotification.php` |
| Placeholders | `app/Services/Tenant/CommunicationTemplates/Providers/ContactPlaceholderProvider.php` |
| Due reminders | `app/Console/Commands/SendCrmDueNotificationsCommand.php::notifyContactFollowUps()` (`crm:send-due-notifications`, daily; entitlement-gated) |
| Factories | `database/factories/ContactFollowUpFactory.php`, `ContactImportFactory.php` |
| Tests | `tests/Feature/Tenant/Contact/ContactTest.php`, `ContactFollowUpTest.php`, `ContactImportTest.php`, `ContactExportTest.php`; `tests/Helpers/ContactImport.php` |

## Domain notes

- `lifecycle_status` (`on_boarded` | `off_boarded`) is independent of soft-delete (`deleted_at` / `trashed` filters). SPA labels use **On Boarded Clients** / **Off Boarded Clients**.
- Assignee scoping via `ScopesToAssignee` with `contacts.assign`; without it, users only see contacts assigned to them (view/update/list/stats).
- `contacts.force.delete` is not granted to any default role — owner/superadmin only, matching Leads/Tasks.
- Lead → Contact linkage: `leads.contact_id` (nullable FK). `LeadService::convert()` creates (or reuses) a Contact when the `contacts` module is entitled (requires `contacts.create`, preserves lead assignee, sets lifecycle `on_boarded`, transactional). When Companies is entitled and the lead has a company name, also creates/links a Company onto the Contact. Optional Opportunity creation uses the same convert endpoint (`create_opportunity`). Stub converts without `contact_id` can be completed after Contacts is installed. Otherwise conversion remains the earlier status-only placeholder for contacts (`conversion_meta.stub = true`).
- Contact → Company linkage: `contacts.company_id` (nullable FK) when [Companies](/developer-guide/companies) is entitled. Writes sync the legacy `company` string from the linked Company name. Resources expose `linked_company` when loaded.
- SPA: Contact create/edit can open `create-company-dialog.tsx` (`companies.create`) and auto-select the new `company_id` without navigating to Companies.
- Sales prefill: Quotation / invoice / payment create forms accept `?contact=` / `?company=` on create only (`src/lib/related-record-query.ts`).
- **Party billing hub:** `CustomerPartyBillingPanel` on contact view — summary strip + recent invoices/payments/credit notes + statement route. Backend: `CustomerPartyBillingSummaryService`, `CustomerAccountStatementService` (+ PDF). List deep links `?contact=` / `?company=` on invoices, payments, quotations, credit notes.
- **Related records hub (1.6.0):** `CustomerPartyRelatedHub` — recent opportunities / help-desk tickets / projects / documents (module + permission gated). Documents filtered via `GET /documents?linkable_type=contact&linkable_id=`. Opportunity / Help Desk / Project / Documents lists accept `?contact=` / `?company=` party chips (`usePartyListFilter`).
- Statement JSON includes `opening_balance` (pre-`from`) and `balance_due` (as of `to`). Credits on statements are **applied** only.
- Assignee eligibility mirrors Leads (`EligibleContactAssignee` / `User::isEligibleLeadAssignee`).
- **Follow-ups (1.7.0):** `contact_follow_ups` (`contact_id`, `assigned_to` nullable FK → users, `title`, `notes`, `due_at`, `completed_at`, `status`). Shared `FollowUpStatusEnum` (`pending` | `completed` | `cancelled`) — simpler than `LeadFollowUpStatusEnum`; no tag-driven auto/force-follow-up here. `ContactService::createFollowUp()` / `updateFollowUp()` / `completeFollowUp()` default `assigned_to` to the contact's assignee, denormalize `contacts.next_follow_up_at` (earliest **pending** `due_at`, recomputed via `refreshNextFollowUp()` on complete/reschedule/due-change), and fire `ContactFollowUpCreated` / `ContactFollowUpCompleted` (audit + assignee notification on create, audit-only on complete). `ContactEventSubscriber` skips the created-notification when the actor is the assignee.
- **Calendar projection:** `ContactService::projectCalendar()` upserts a `CalendarEvent` (`source_type='contact'`, `source_id`, `CalendarEventSourceEnum::Contact`) titled after the contact, 1 hour starting at `next_follow_up_at`, organizer = assignee (falls back to actor). Runs only when the `calendar` module is entitled; clears the projection when `next_follow_up_at` is null or there is no organizer, and on contact delete (`clearCalendarProjection()`).
- **Due/overdue reminders:** `SendCrmDueNotificationsCommand::notifyContactFollowUps()` (per-tenant, gated by `EntitlementService::hasModule('contacts')`) queries pending follow-ups due today or overdue (`UtcInstant::dayBounds()` / `< startOfDay()`), notifies `assigned_to` (or the contact's assignee) via `ContactFollowUpDueNotification`, idempotent per user/day via the `dedupe_key` pattern (`due|overdue:contact_follow_up:{id}:{date}`).
- **Import (1.7.0):** `ContactImportHandler` fields: `name` (required), `email`, `phone`, `company`, `job_title`, `source`, `lifecycle_status`, `assigned_to` (resolved by email, validated via `EligibleContactAssignee`). Duplicate detection matches `email` **or** `phone` from `unique_fields`; modes `skip` | `update` | `keep` (`ImportDuplicateModeEnum`, shared with Leads). Every row goes through `ContactService::create()` / `update()` — same business rules as manual create. **No `assignment_mode`** — Contacts/Companies import intentionally omits Lead's equal-distribute mode; only an explicit `assigned_to` column (or manual-create-style default) sets the assignee. Single table `contact_imports` (status, mapping, options, stats, report paths); async via `ProcessContactImportJob::dispatch(...)->onQueue('imports')`. Platform audit: `contact_import_completed` / `contact_import_failed`.
- **Export (1.7.0):** `ContactsExport` streams CSV or a minimal hand-rolled XLSX (no PhpSpreadsheet) of the current filtered/scoped query — id, name, email, phone, company, job title, source, lifecycle status, assignee, creator, `next_follow_up_at`, created_at. CSV/formula-injection is escaped on leading `=+-@`.

## Permissions

`config/tenant-permissions.php`:

```
contacts.view | create | update | delete | restore | force.delete | assign | export | import
```

Routes use `module:contacts` then `can:contacts.*` / policies.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-contacts.md](/api/tenant-v1-contacts).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/contacts` | view |
| GET | `/contacts/stats` | view |
| GET | `/contacts/{contact}` | view |
| GET | `/contacts/{contact}/timeline` | view |
| POST | `/contacts` | create |
| PUT | `/contacts/{contact}` | update |
| DELETE | `/contacts/{contact}` | delete |
| POST | `/contacts/{contact}/restore` | restore |
| DELETE | `/contacts/{contact}/force` | force.delete |
| POST | `/contacts/{contact}/assign` | assign |
| POST | `/contacts/{contact}/notes` | update |
| GET | `/contacts/{contact}/billing-summary` | view |
| GET | `/contacts/{contact}/statement` | view |
| GET | `/contacts/{contact}/statement.pdf` | view |

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/contacts/contacts-page.tsx` (table + filters + KPIs) |
| Form | `contact-form.tsx` (+ `create-company-dialog.tsx` for inline company create) |
| Detail | `contact-view-page.tsx` (details, notes, activity, follow-ups; billing hub; related hub; related sales create actions) |
| List sheet | `contact-record-sheet.tsx` + shared `ModuleRecordSheet` (peek overview incl. next follow-up) |
| Statement | `src/pages/crm/party-statement-page.tsx` (`ContactStatementPage`) |
| Import wizard | `contact-import-dialog.tsx` (5-step: upload → map → options → preview → run) |
| Import history | `contact-import-history-dialog.tsx` |
| Service | `contactService` in `src/api/services.ts` (`billingSummary`, `statement`, `downloadStatementPdf`, `export`, `importTemplate`, `listImports`, `uploadImport`, `getImport`, `updateImportMapping`, `updateImportOptions`, `createFollowUp`, `updateFollowUp`, `completeFollowUp`) |
| Notification registry | `src/notifications/modules/contacts.ts` (follow-up created/due) |
| Nav | `permission: contacts.view`, `module: 'contacts'` (between Leads and Tasks) |
| Dashboard | `RecentContactsWidget` (`recent_contacts` widget) + `create_contact` quick action in `tenant-dashboard-widgets.tsx` / `tenant-dashboard-page.tsx` |
| Lead link | Lead record shows a **View contact** link when a converted lead has `contact_id` |
| Company link | Contact form company picker when `module:companies` + `companies.view`; **New** when `companies.create`; list/detail prefer `linked_company?.name` over legacy `company` |
| Sales prefill | Quotation / invoice / payment create forms accept `?contact=` / `?company=` |
| Party billing | Hub + deep links + statement; Pest `tests/Feature/Tenant/PartyBilling/`; Playwright `e2e/tests/contacts/contacts.party-billing.spec.ts` |
| Related hub | Opportunities / Help Desk / Projects / Documents panels; Playwright `e2e/tests/contacts/contacts.related-hub.spec.ts` |
| Catalog | **1.7.0** (follow-ups + import/export) |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Contact/ContactTest.php
php artisan test --compact tests/Feature/Tenant/Contact/ContactFollowUpTest.php
php artisan test --compact tests/Feature/Tenant/Contact/ContactImportTest.php
php artisan test --compact tests/Feature/Tenant/Contact/ContactExportTest.php
php artisan test --compact tests/Feature/Tenant/PartyBilling/PartyBillingSummaryAndStatementTest.php

# Worker (import jobs)
php artisan queue:work --queue=imports,default

# Frontend
npm run typecheck && npm run lint && npm run build
npm run test:e2e:contacts
```

| Suite | Location |
|-------|----------|
| Pest | `tests/Feature/Tenant/Contact/ContactTest.php` (+ Lead convert cases), `ContactFollowUpTest.php`, `ContactImportTest.php`, `ContactExportTest.php`; PartyBilling suite |
| E2E | `e2e/tests/contacts/`, including `contacts.follow-ups.spec.ts`, `contacts.import.spec.ts`, `contacts.party-billing.spec.ts` |

## Logging

- Spatie `LogsActivity` on `Contact` (log name `contacts`)
- Domain `contact_activities` timeline
- `PlatformAuditService` via `ContactEventSubscriber`

## Intentional differences from Leads / Tasks

| Leads / Tasks | Contacts |
|-------|--------|
| Stages / status workflow | No workflow — directory record |
| Follow-ups: tag-driven auto/force-follow-up, `LeadFollowUpStatusEnum` | Follow-ups (**1.7.0**) are plain create/reschedule/complete on shared `FollowUpStatusEnum`; no tags, no forced follow-up |
| Import `assignment_mode` (`none` \| `equal` department distribute) | Import (**1.7.0**) has **no `assignment_mode`** — `assigned_to` column or manual-create default only |
| Board view | List/table only |
| `convert` / `complete` | None (Contacts is the conversion *target*, not source) |
