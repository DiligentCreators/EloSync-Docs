# Contacts — Developer Guide

Mirror of the [Leads developer guide](/developer-guide/leads) / [Tasks developer guide](/developer-guide/tasks). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Contact.php`, `ContactNote`, `ContactActivity` |
| Enum | `app/Enums/Tenant/ContactActivityTypeEnum` |
| Service | `app/Services/Tenant/ContactService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ContactController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Contact/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Contact/*` |
| Policy | `app/Policies/ContactPolicy.php` |
| Events | `app/Events/Contact*.php` |
| Subscriber | `app/Listeners/ContactEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Contact/ContactAssignedNotification.php` |
| Placeholders | `app/Services/Tenant/CommunicationTemplates/Providers/ContactPlaceholderProvider.php` |
| Tests | `tests/Feature/Tenant/Contact/ContactTest.php` |

## Domain notes

- Assignee scoping via `ScopesToAssignee` with `contacts.assign`; without it, users only see contacts assigned to them (view/update/list/stats).
- `contacts.force.delete` is not granted to any default role — owner/superadmin only, matching Leads/Tasks.
- Lead → Contact linkage: `leads.contact_id` (nullable FK). `LeadService::convert()` creates (or reuses) a Contact when the `contacts` module is entitled (requires `contacts.create`, preserves lead assignee, transactional); stub converts without `contact_id` can be completed after Contacts is installed. Otherwise conversion remains the earlier status-only placeholder (`conversion_meta.stub = true`).
- Contact → Company linkage: `contacts.company_id` (nullable FK) when [Companies](/developer-guide/companies) is entitled. Writes sync the legacy `company` string from the linked Company name. Resources expose `linked_company` when loaded.
- Assignee eligibility mirrors Leads (`EligibleContactAssignee` / `User::isEligibleLeadAssignee`).

## Permissions

`config/tenant-permissions.php`:

```
contacts.view | create | update | delete | restore | force.delete | assign
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

Auth login/`me` include `modules: string[]` for SPA gating.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/contacts/contacts-page.tsx` (table + filters + KPIs) |
| Form | `contact-form-dialog.tsx` |
| Detail | `contact-detail-sheet.tsx` (Overview, Notes, Activity tabs) |
| Service | `contactService` in `src/api/services.ts` |
| Nav | `permission: contacts.view`, `module: 'contacts'` (between Leads and Tasks) |
| Dashboard | `RecentContactsWidget` (`recent_contacts` widget) + `create_contact` quick action in `tenant-dashboard-widgets.tsx` / `tenant-dashboard-page.tsx` |
| Lead link | `lead-detail-sheet.tsx` shows a **View contact** link (`?contact={id}`) when a converted lead has `contact_id` |
| Company link | `contact-form-dialog.tsx` company picker when `module:companies` + `companies.view`; list/detail prefer `linked_company?.name` over legacy `company` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Contact/ContactTest.php

# Frontend
npm run typecheck && npm run lint && npm run build
npm run test:e2e:contacts
```

| Suite | Location |
|-------|----------|
| Pest | `tests/Feature/Tenant/Contact/ContactTest.php` (+ Lead convert cases) |
| E2E | `e2e/tests/contacts/`, `npm run test:e2e:contacts` |

## Logging

- Spatie `LogsActivity` on `Contact` (log name `contacts`)
- Domain `contact_activities` timeline
- `PlatformAuditService` via `ContactEventSubscriber`

## Intentional differences from Leads / Tasks

| Leads / Tasks | Contacts |
|-------|--------|
| Stages / status workflow | No workflow — directory record |
| Follow-ups | None |
| Board view | List/table only |
| `export` / `convert` / `complete` | None (Contacts is the conversion *target*, not source) |
