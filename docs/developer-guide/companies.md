# Companies — Developer Guide

Mirror of the [Contacts developer guide](/developer-guide/contacts) / [Leads developer guide](/developer-guide/leads). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Company.php`, `CompanyNote`, `CompanyActivity` |
| Enum | `app/Enums/Tenant/CompanyActivityTypeEnum` |
| Service | `app/Services/Tenant/CompanyService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/CompanyController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Company/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Company/*` |
| Policy | `app/Policies/CompanyPolicy.php` |
| Events | `app/Events/Company*.php` |
| Subscriber | `app/Listeners/CompanyEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Company/CompanyAssignedNotification.php` |
| Placeholders | `app/Services/Tenant/CommunicationTemplates/Providers/CompanyPlaceholderProvider.php` |
| Tests | `tests/Feature/Tenant/Company/CompanyTest.php` |

## Domain notes

- Assignee scoping via `ScopesToAssignee` with `companies.assign`; without it, users only see companies assigned to them (view/update/list/stats).
- `companies.force.delete` is not granted to any default role — owner/superadmin only, matching Leads/Tasks/Contacts.
- Contact → Company linkage: `contacts.company_id` (nullable FK). `ContactService` resolves writes so that when `company_id` is set, the legacy `company` string is synced to the linked Company name. List/detail resources expose `linked_company` (`id`, `uuid`, `name`) when loaded.
- Assignee eligibility mirrors Leads/Contacts (`EligibleCompanyAssignee` / `User::isEligibleLeadAssignee`).
- Soft delete only — no stage/status workflow.

## Permissions

`config/tenant-permissions.php`:

```
companies.view | create | update | delete | restore | force.delete | assign
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

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/companies/companies-page.tsx` (table + filters + KPIs) |
| Form | `company-form-dialog.tsx` |
| Detail | `company-detail-sheet.tsx` (Overview, Notes, Activity tabs; linked contacts) |
| Service | `companyService` in `src/api/services.ts` |
| Nav | `permission: companies.view`, `module: 'companies'` (between Leads and Contacts) |
| Dashboard | `RecentCompaniesWidget` (`recent_companies` widget) + `create_company` quick action in `tenant-dashboard-widgets.tsx` / `tenant-dashboard-page.tsx` |
| Contact link | `contact-form-dialog.tsx` company picker when `module:companies` + `companies.view`; list/detail show `linked_company?.name \|\| company` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Company/CompanyTest.php

# Frontend
npm run typecheck && npm run lint && npm run build
npm run test:e2e:companies
```

| Suite | Location |
|-------|----------|
| Pest | `tests/Feature/Tenant/Company/CompanyTest.php` |
| E2E | `e2e/tests/companies/`, `npm run test:e2e:companies` |

## Logging

- Spatie `LogsActivity` on `Company` (log name `companies`)
- Domain `company_activities` timeline
- `PlatformAuditService` via `CompanyEventSubscriber`

## Intentional differences from Leads / Tasks

| Leads / Tasks | Companies |
|-------|--------|
| Stages / status workflow | No workflow — directory record |
| Follow-ups | None |
| Board view | List/table only |
| `export` / `convert` / `complete` | None |

## Deferred

- Lead convert-to-Company
- Legacy contact `company` string → Company backfill job
- Meta invent Companies
