# Help Desk — Developer Guide

Simplified mirror of [Expenses](/developer-guide/expenses) / [Tasks](/developer-guide/tasks) (numbering, status machine, assignee scoping, notes, domain timeline) — **no** hard module dependencies. `contact_id` and `company_id` are both nullable soft links, validated only when the corresponding module is entitled.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/HelpDeskTicket.php`, `HelpDeskCategory`, `HelpDeskNote`, `HelpDeskActivity` |
| Enums | `HelpDeskStatusEnum`, `HelpDeskPriorityEnum`, `HelpDeskActivityTypeEnum` |
| Service | `app/Services/Tenant/HelpDeskTicketService.php` (+ `ScopesToAssignee`, `RetriesOnDuplicateNumber`), `HelpDeskCategoryService`, `HelpDeskCategorySeederService` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/HelpDeskTicketController.php`, `HelpDeskCategoryController` |
| Requests | `app/Http/Requests/Tenant/Api/V1/HelpDesk/*`, `HelpDeskCategory/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/HelpDesk/*` |
| Policy | `app/Policies/HelpDeskTicketPolicy.php`, `HelpDeskCategoryPolicy` (maps to `help-desk.*`) |
| Events | `app/Events/HelpDeskTicket*.php` |
| Subscriber | `app/Listeners/HelpDeskEventSubscriber.php` (audit + assignment/status notifications) |
| Notifications | `app/Notifications/Tenant/HelpDesk/HelpDeskAssignedNotification.php`, `HelpDeskStatusNotification` |
| Link rules | `app/Rules/LinkableContact.php`, `app/Rules/LinkableCompany.php` — both optional, tenant-scoped, module-entitlement-checked |
| Assignee rule | `app/Rules/EligibleHelpDeskAssignee.php` |
| Factories | `HelpDeskTicketFactory`, `HelpDeskCategoryFactory`, `HelpDeskNoteFactory`, `HelpDeskActivityFactory` |
| Tests | `tests/Feature/Tenant/HelpDesk/HelpDeskTicketTest.php`, `HelpDeskCategoryTest.php` |
| Migrations | `database/migrations/2026_08_14_100000_create_help_desk_categories_table.php` … `100005_add_help_desk_permissions.php` |

## Domain notes

- **No hard module dependency**: Help Desk has no `module_dependencies` row — installable standalone. `contact_id` / `company_id` are nullable columns.
- **Tenant categories**: `help_desk_categories` lookup (name, slug, `sort_order`, `is_active`, soft deletes). `help_desk_tickets.category_id` is a nullable FK. Category CRUD reuses `help-desk.view|create|update|delete|restore|force.delete` — no `help-desk-categories.*` family. `HelpDeskCategorySeederService::ensureDefaults()` lazily inserts General / Technical / Billing / Account / Other (slugs `general|technical|billing|account|other`) on first list/create; lazy seed does not write activity. Starter slugs are immutable on update. **Other** cannot be soft- or force-deleted (422). Listing does not restore deleted starters except a missing/trashed **Other**. Delete/forceDelete blocked while any tickets (including trashed, for force) still reference the category. Spatie log name `help-desk-categories`.
- Status machine on `HelpDeskStatusEnum::allowedTransitions()` / `canTransitionTo()`: `open → in_progress|waiting|resolved|closed`, `in_progress → waiting|resolved|closed`, `waiting → in_progress|resolved|closed`, `resolved → closed|open`, `closed → open`. `HelpDeskTicketService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions.
- Content updates (`PUT`) blocked when `status === closed` via `HelpDeskTicket::isEditable()`. Assignment after submit uses `POST …/assign`.
- `close()` / `reopen()` are assignee-scoped in `HelpDeskTicketPolicy` (same as `view` / `update`) unless the actor has `help-desk.assign` or is superadmin.
- `contact_id` / `company_id` validated via `LinkableContact` / `LinkableCompany` — null always passes; non-null requires module entitlement, tenant scope, and assignee rules when applicable.
- `help-desk.force.delete` is not granted to any default role — owner/superadmin only.
- Auto-numbering: `HelpDeskTicketService::nextNumber()` reads `help_desk_number_prefix` tenant setting (default `HD-`), zero-pads running count to 5 digits. Exposed via `PUT /settings` (`UpdateTenantSettingsRequest`). `unique(tenant_id, number)` DB index; `create()` retries up to 3 times via `RetriesOnDuplicateNumber`.
- Overdue scope: open statuses (`open`, `in_progress`, `waiting`) with `due_at < UtcInstant::now()` — aligns with workspace timezone KPI fixes elsewhere.
- Dashboard widget: `DashboardWidgetService` registers `help_desk_my_open` gated by `module:help-desk` + `help-desk.view`.

## Permissions

```
help-desk.view | create | update | delete | restore | force.delete | assign | close | reopen
```

Routes use `module:help-desk` then `can:help-desk.*` / policies.

Catalog: slug `help-desk`, category `operations`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`, version **1.0.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only) — **no** `module_dependencies` row.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-help-desk.md](/api/tenant-v1-help-desk).

## Frontend

SPA mirrors **Expenses** (table + form dialog, detail sheet) under AppLayout.

| Piece | Path |
|-------|------|
| Page | `src/pages/help-desk/` (`help-desk-page.tsx`, `help-desk-form-dialog.tsx`, `help-desk-detail-sheet.tsx`, `help-desk-categories-dialog.tsx`) |
| Detail sheet | Overview (category, priority, status, due date, assignee, related contact/company), notes, timeline — actions: assign, add note, status transitions, close, reopen, edit (non-closed), delete |
| Form dialog | Subject, description, category picker, priority, due date, and **conditional** contact / company pickers when `hasModule('contacts')` / `hasModule('companies')` |
| Service | `helpDeskService` + `helpDeskCategoryService` in `src/api/services.ts` |
| Types | `HelpDesk*` in `src/types/api.ts` |
| Query keys | `QUERY_KEYS.helpDesk` / `helpDeskTicket(id)` / `helpDeskTimeline(id)` / `helpDeskStats` / `helpDeskCategories` |
| Permissions | `PERMISSIONS.helpDesk.*` |
| Nav | **Operations** sidebar group — `permission: PERMISSIONS.helpDesk.view`, `module: 'help-desk'` |
| Route | `tenantRoutes.helpDesk = '/help-desk'`, lazy-loaded in `App.tsx` behind `RequireAccess module="help-desk"` |
| Dashboard | `tenant-dashboard-widgets.tsx` — `help_desk_my_open` widget |
| Notifications | `src/notifications/modules/help-desk.ts` — `help_desk.assigned`, `help_desk.closed`, `help_desk.reopened` |
| Playwright | `e2e/pages/help-desk.page.ts`, `e2e/tests/help-desk/`, `npm run test:e2e:help-desk` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/HelpDesk/HelpDeskTicketTest.php
php artisan test --compact tests/Feature/Tenant/HelpDesk/HelpDeskCategoryTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:help-desk
```

## Logging

- Spatie `LogsActivity` on `HelpDeskTicket` (log name `help-desk`)
- Domain `help_desk_activities` timeline
- `PlatformAuditService` via `HelpDeskEventSubscriber`

## Distinct from Central Feedback

| Central Feedback | Help Desk |
|------------------|-----------|
| Platform concern — no `module:*` gate | Licensed `module:help-desk` |
| Tenant submit → Central triage | Tenant-scoped internal queue |
| `feedback.*` permissions (Central) | `help-desk.*` permissions (Tenant) |
| Product bug/feature intake | Workspace support / ops tickets |

See [Central Feedback System](/developer-guide/central-feedback-system).

## Deferred

- SLAs, email ingest, customer portal, Knowledge Base, attachments, `@mentions`, Automation triggers, Communication Template context, Kanban
