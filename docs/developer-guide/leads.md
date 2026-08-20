# Leads — Developer Guide

Reference implementation. Copy this layout for Tasks and later modules.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Lead.php`, `LeadStage`, `LeadTag`, `LeadNote`, `LeadNoteMention`, `LeadFollowUp`, `LeadActivity`, `LeadAssignmentHistory` |
| Enums | `app/Enums/Tenant/LeadStatusEnum`, `LeadPriorityEnum`, `LeadTypeEnum`, `LeadFollowUpStatusEnum`, `LeadActivityTypeEnum`, `LeadTagBehaviorEnum` |
| Service | `app/Services/Tenant/LeadService.php` (+ `ScopesToAssignee`), `LeadTagService.php` |
| Export | `app/Exports/LeadsExport.php` |
| Import framework | `app/Import/*` (`ImportManager`, `ImportFile`, `ImportColumnMapper`, `ImportErrorWriter`, `ImportTemplateGenerator`, `ImportHistory`, `ImportJob`) |
| Lead import handler | `app/Import/Lead/LeadImportHandler.php`, `LeadImportValidator`, `LeadImportMapper` |
| Import model | `app/Models/LeadImport.php` (`lead_imports` table) |
| Import job | `app/Jobs/ProcessLeadImportJob.php` → queue `imports` |
| Controllers | `LeadController.php`, `LeadImportController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Lead/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Lead/*` |
| Policy | `app/Policies/LeadPolicy.php` |
| Events | `app/Events/Lead*.php` |
| Subscriber | `app/Listeners/LeadEventSubscriber.php` (audit + notifications) |
| Notifications | `app/Notifications/Tenant/Lead/*` (assign: database+broadcast+webpush; follow-ups/mentions: database + optional mail; mentions also broadcast+webpush; inactivity: database+broadcast+webpush) |
| Inactivity job | `app/Services/Tenant/LeadInactivityService.php`, `app/Console/Commands/NotifyInactiveLeadsCommand.php` (`leads:notify-inactive`, daily) |
| Mentions | `App\Support\NoteMentions`, `NoteMentionService`; wired from `LeadNoteAdded` in `LeadEventSubscriber` |
| Seeder | `database/seeders/Tenant/LeadStageSeeder.php`, `LeadTagSeeder.php` |
| Tests | `tests/Feature/Tenant/Lead/LeadTest.php`, `LeadTagTest.php`, `LeadTypeTest.php`, `LeadValidationTest.php`, `LeadImportTest.php`, `LeadSameDayDuplicateTest.php`, `tests/Feature/Tenant/Notification/NoteMentionNotificationTest.php`, `tests/Unit/NoteMentionsTest.php` |

## Domain notes

- Disposition **tags** are many-to-many (`lead_lead_tag`), independent of stage/status. Catalog CRUD + reorder under `LeadTagController`. New leads receive `is_default` tags. Sync via `PUT /leads/{id}/tags` (and optional `tag_ids` on create). `auto_follow_up` creates a pending follow-up keyed by `lead_follow_ups.lead_tag_id`; `force_follow_up` requires a nested `follow_up` payload. System tag `duplicate` is seeded (protected from delete) and applied when email/phone matches another lead created the same workspace calendar day — manual create, import (Keep/Skip; Update only when a distinct same-day match remains after excluding the row being updated), and inbound ingest still notify assignee/creator/actor via `lead.duplicate_detected`.
- **Lead type** (`direct` | `company`) is stored on `leads.lead_type` (required on create; `sometimes|required` on update so partial PUTs may omit it; nullable for legacy rows). System tags `direct-lead` / `company-lead` are seeded in `LeadTagSeeder` and kept mutually exclusive via `LeadTagService::mergeExclusiveTypeTags()` on create, update, and manual tag sync.
- Note bodies may include `@[Display Name](user:ID)` mention tokens (composer UI shows `@Name` chips). On `LeadNoteAdded`, `NoteMentionService` persists `lead_note_mentions` and sends `lead.mentioned` (skip self; idempotent via `dedupe_key`). Mail is optional via `email_notifications.lead_mentioned` (default off).
- Follow-up `due_at` follows the [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes): SPA edit/display in Settings → General timezone (`isoToAppLocalInput` / `appLocalInputToIso`); store as UTC via `UtcDateTime` / `UtcIso`; overdue / due-today stats and widgets compare with `UtcInstant`; due/overdue notifications use workspace-local “today”.
- `lead_value` replaced `estimated_value` (migration rename). Store/update requests still accept `estimated_value` as a write alias.
- Status is independent of stage flags (`is_won` / `is_lost`). Stage change does not sync status.
- Convert: `converted_at`, `conversion_meta`, status `closed`, activity type converted. When [Contacts](/developer-guide/contacts) is entitled, creates/links a real `Contact` (`contact_id`, `conversion_meta.stub = false`, lifecycle `on_boarded`) and requires `contacts.create`; preserves the lead assignee; runs in a DB transaction. When [Companies](/developer-guide/companies) is entitled and the lead has a non-empty `company` string, creates or reuses a Company by case-insensitive name (`conversion_meta.company_id`, Contact `company_id`) and requires `companies.create` only when creating. Company create is serialized with a per-tenant+name cache lock to reduce duplicates; a residual race without a unique DB name constraint remains (known limitation). Stale `conversion_meta.company_id` values are cleared when the company cannot be resolved. When [Opportunities](/developer-guide/opportunities) is entitled and the request sets `create_opportunity: true` with `opportunity.name`, creates an Opportunity linked to the lead / contact / company (`conversion_meta.opportunity_id`) and requires `opportunities.create`. Stub converts (no `contact_id`) can be completed by calling convert again after Contacts is installed (company/opportunity already in `conversion_meta` are reused and linked; linking an existing opportunity requires `opportunities.update`). Without Contacts, conversion remains status-only for the contact (`conversion_meta.stub = true`) but may still create company/opportunity. `LeadPolicy::convert` uses the same assignee scope as update. Catalog version **1.1.1**.

### Known limitations

- **Company name uniqueness on convert:** Convert reuses companies by case-insensitive name and takes a short cache lock around create, but company names are not unique in the schema. Two concurrent converts of different leads with the same brand-new company name can still insert duplicates if the lock backend cannot coordinate (or races past the lock window). Operators should merge duplicates manually if that occurs; a future unique index would fully close this.- Assignee scoping via `ScopesToAssignee` with `leads.assign` (superadmin always org-wide).
- Lead assignee eligibility (`User::eligibleLeadAssignees` / `EligibleLeadAssignee` rule): excludes suspended users, workspace owners (`superadmin`), and users with `exclude_from_lead_auto_assign`. Used by assign / create / update / bulk-assign / import column mapping, and by `LeadBulkAssignmentService::eligibleAssignees` for equal distribute.
- Website webhook auto-assign uses `eligibleLeadAssignees ∩ receive_website_leads` when the endpoint flag `assign_to_website_recipients` is enabled. Meta Lead Ads does not use this pool.
- Import equal distribute (`assignment_mode=equal`): requires `leads.assign` and that the importer is `manager_id` on ≥1 active department. Pool = eligible assignees ∩ members of those departments (`assignEquallyForImport`). Non-managers receive a validation error. Bulk equal distribute remains org-wide eligible assignees.
- **Commission rate:** `users.lead_commission_rate` (nullable decimal 0–100) is the user’s default. `LeadService::create` (when `assigned_to` is set) and `LeadService::update` / `assign` copy the assignee’s rate to `leads.commission_rate` on assign/reassign and clear it on unassign. Snapshot is reporting-only (export, list, detail) — no payout engine. Bulk assign and import equal distribute use `assign()` so snapshots apply there too.
- **Inactivity alerts:** Workspace setting `leads.inactivity_working_days` (integer, default `3`; `0` disables). Scheduled command `leads:notify-inactive` runs daily per tenant. Counts Mon–Sat working days in the workspace timezone (Sundays excluded). Idle = assigned lead in an open stage (not Won/Lost) with no meaningful `lead_activities` since the last assignment baseline. Meaningful types: `note_added`, `follow_up_created`, `follow_up_completed`, `stage_changed`, `status_changed`, `crm_activity_logged`, `crm_activity_completed`, `tags_changed`. Excluded from resetting idle: `assigned`, `reassigned`, `imported`, `created`. Notifies assignee (`lead.inactive`) plus department managers of the assignee (`lead.inactive_escalation`), else workspace owners. Idempotent via `NotificationIdempotency` (daily dedupe per lead/recipient).

## Permissions

`config/tenant-permissions.php`:

```
leads.view | create | update | delete | assign | export | import | convert
```

Routes use `module:leads` then `can:leads.*` / policies.

### Import architecture

- Reusable package: Maatwebsite Laravel Excel for CSV/XLSX read + templates
- Entity-agnostic `app/Import` framework; Lead is the first handler (future modules add their own handlers)
- `LeadImportMapper` casts spreadsheet string fields (`phone`, `name`, `email`, `note`, etc.) to strings — Excel often returns phone as int/float
- Every imported lead row uses `LeadService::create()` / `update()` — never bypasses business rules
- Optional mapped **Note** column calls `LeadService::addNote()` after create (and after update when the cell is non-empty; empty cells are skipped)
- All runs are async: `ProcessLeadImportJob::dispatch(...)->onQueue('imports')`
- Uploads stored on the configured uploads disk under `imports/{tenant_uuid}/`
- Single table `lead_imports` holds file metadata, mapping, options, status, stats, and report paths
- Platform audit: `lead_import_completed` / `lead_import_failed`

Inbound ingestion (shipped): Custom Webhook + Meta Lead Ads use the [Lead Source Driver Architecture](/developer-guide/lead-source-driver-architecture). See [Custom Lead Webhook](/developer-guide/custom-lead-webhook), [Meta App Setup](/developer-guide/meta-app-setup), and [Meta Lead Ads](/developer-guide/meta-lead-ads-integration). Drivers normalize only; `LeadDuplicateService` + `LeadService` remain the sole write path.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-leads.md](/api/tenant-v1-leads).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/lead-stages` | view |
| GET | `/leads` | view |
| GET | `/leads/stats` | view |
| GET | `/leads/board` | view |
| GET | `/leads/export` | export |
| GET | `/leads/import/template` | import |
| GET/POST | `/leads/imports` | import |
| GET/PUT | `/leads/imports/{import}` | import |
| PUT | `/leads/imports/{import}/options` | import |
| POST | `/leads/imports/{import}/preview` | import |
| POST | `/leads/imports/{import}/run` | import |
| GET | `/leads/imports/{import}/file` | import |
| GET | `/leads/imports/{import}/failed-records` | import |
| GET | `/leads/imports/{import}/error-report` | import |
| POST | `/leads` | create |
| GET | `/leads/{lead}` | view |
| PUT | `/leads/{lead}` | update |
| DELETE | `/leads/{lead}` | delete |
| POST | `/leads/{lead}/assign` | assign |
| POST | `/leads/{lead}/convert` | convert |
| POST | `/leads/{lead}/stage` | update |
| POST | `/leads/{lead}/notes` | update |
| POST | `/leads/{lead}/follow-ups` | update |
| PUT | `/leads/{lead}/follow-ups/{followUp}` | update |
| POST | `/leads/{lead}/follow-ups/{followUp}/complete` | update |
| GET | `/leads/{lead}/timeline` | view |
| GET | `/leads/{lead}/assignment-history` | view |

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/leads/leads-page.tsx` (board default + table) |
| Form | `lead-form.tsx` + `lead-form-page.tsx` (`/leads/new`, `/leads/:id/edit`) |
| Detail | `lead-view-page.tsx` (`/leads/:id`) — stacked cards (Details / Comments / Activity); board DnD auto-saves stage on the list page |
| Import wizard | `lead-import-dialog.tsx` (5-step) |
| Import history | `lead-import-history-dialog.tsx` |
| Shared board | `src/components/crm/kanban-board.tsx` |
| Mentions UI | `src/components/crm/mention-composer.tsx` (shows `@Name` chips; emits `@[Name](user:id)`; keep typing after pick; Backspace/Delete removes chips), `src/lib/note-mentions.ts` (`formatNoteMentionsForDisplay` in record pages + `latest-note-follow-up.tsx` list/board previews) |
| Notification registry | `src/notifications/modules/crm.ts` (`lead.mentioned`, `lead.duplicate_detected`, `lead.inactive`, `lead.inactive_escalation`) |
| Service | `leadService` in `src/api/services.ts` |
| Nav | `permission: leads.view`, `module: 'leads'` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Lead
php artisan test --compact tests/Feature/Tenant/Lead/LeadImportTest.php

# Worker (import jobs)
php artisan queue:work --queue=imports,default

# Frontend E2E
npm run test:e2e:leads
```

## Logging

- Spatie `LogsActivity` on `Lead` (log name `leads`)
- Domain `lead_activities` timeline
- `lead_assignment_histories` for assignee changes
- `users.lead_commission_rate`, `leads.commission_rate` — snapshot on assign via `LeadService::assign`
- `PlatformAuditService` via `LeadEventSubscriber` (+ `lead_import_completed` / `lead_import_failed`)
