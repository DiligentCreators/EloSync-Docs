# Opportunities — Developer Guide

Mirror of the [Leads developer guide](/developer-guide/leads) (pipeline board) and [Activities developer guide](/developer-guide/activities) (soft related FKs, notes, assignee scope). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Opportunity.php`, `OpportunityStage`, `OpportunityNote`, `OpportunityActivity` |
| Enums | `OpportunityActivityTypeEnum` |
| Service | `app/Services/Tenant/OpportunityService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/OpportunityController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Opportunity/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Opportunity/*` |
| Policy | `app/Policies/OpportunityPolicy.php` |
| Events | `app/Events/Opportunity*.php` |
| Subscriber | `app/Listeners/OpportunityEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Opportunity/OpportunityAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableLead`, `LinkableCompanyForOpportunity`, `EligibleOpportunityAssignee` |
| Stage seeder | `database/seeders/Tenant/OpportunityStageSeeder.php` |
| Tests | `tests/Feature/Tenant/Opportunity/OpportunityTest.php` |

## Domain notes

- **Sales Pipeline** is not a separate module — `opportunity_stages` + board endpoints live inside Opportunities.
- Assignee scoping via `ScopesToAssignee` with `opportunities.assign`.
- `opportunities.force.delete` is not granted to any default role — owner/superadmin only.
- Related FKs (`contact_id` / `company_id` / `lead_id`) are **optional**; each is validated for module entitlement + assignee scope on the related record when set.
- Default stages are ensured idempotently (`OpportunityStageSeeder` / `ensureDefaultStages()`): Prospecting → Qualification → Proposal → Negotiation → Won / Lost.
- Soft delete; stage changes via `POST .../stage` (`can:opportunities.update`).
- No hard `module_dependencies` rows for Contacts/Companies/Leads. **Quotations** and **Contracts** declare Opportunities as a required hard dependency.

## Permissions

```
opportunities.view | create | update | delete | restore | force.delete | assign
```

Routes use `module:opportunities` then `can:opportunities.*` / policies.

Catalog: slug `opportunities`, category `sales`, `is_default_included = false`, `is_billable = false`, `sort_order = 40`. Registered via `DefaultModuleRegistrar` migration (migrate-only).

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-opportunities.md](/api/tenant-v1-opportunities).

## Frontend

SPA should mirror **Leads** (board default + table, form dialog, detail sheet) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path (expected) |
|-------|-----------------|
| Page | `src/pages/opportunities/` |
| Form / detail | form dialog + detail sheet (Overview, Notes, Activity) |
| Service | `opportunityService` in `src/api/services.ts` |
| Nav | `permission: opportunities.view`, `module: 'opportunities'` (Sales) |
| Playwright | `e2e/pages/opportunities.page.ts`, `e2e/tests/opportunities/`, `npm run test:e2e:opportunities` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Opportunity/OpportunityTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:opportunities
```

## Logging

- Spatie `LogsActivity` on `Opportunity` (log name `opportunities`)
- Domain `opportunity_activities` timeline
- `PlatformAuditService` via `OpportunityEventSubscriber`
