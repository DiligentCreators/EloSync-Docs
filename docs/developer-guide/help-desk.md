# Help Desk — Developer Guide

Simplified mirror of [Expenses](/developer-guide/expenses) / [Tasks](/developer-guide/tasks) (numbering, status machine, assignee scoping, notes, domain timeline) — **no** hard module dependencies. `contact_id` and `company_id` are both nullable soft links, validated only when the corresponding module is entitled.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/HelpDeskTicket.php`, `HelpDeskCategory`, `HelpDeskSlaPolicy`, `HelpDeskMailbox`, `HelpDeskNote`, `HelpDeskActivity`, `HelpDeskTicketAttachment` |
| Enums | `HelpDeskStatusEnum`, `HelpDeskPriorityEnum`, `HelpDeskActivityTypeEnum` (includes `sla_applied`, `sla_response_met`, `sla_breached`) |
| Service | `HelpDeskTicketService` (+ `ScopesToAssignee`, `RetriesOnDuplicateNumber`), `HelpDeskSlaClockService`, `HelpDeskSlaPolicyService`, `HelpDeskMailboxService`, `HelpDeskMailIngestService`, `HelpDeskCategoryService`, `HelpDeskCategorySeederService` |
| Controller | `HelpDeskTicketController`, `HelpDeskCategoryController`, `HelpDeskSlaPolicyController`, `HelpDeskMailboxController` |
| Requests | `app/Http/Requests/Tenant/Api/V1/HelpDesk/*`, `HelpDeskCategory/*`, `HelpDeskSlaPolicy/*`, `HelpDeskMailbox/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/HelpDesk/*`, `HelpDeskSlaPolicy/*`, `HelpDeskMailbox/*` |
| Policy | `HelpDeskTicketPolicy`, `HelpDeskCategoryPolicy`, `HelpDeskSlaPolicyPolicy`, `HelpDeskMailboxPolicy` (maps to `help-desk.*`) |
| Events | `app/Events/HelpDeskTicket*.php`, `HelpDeskSlaBreached` |
| Subscriber | `app/Listeners/HelpDeskEventSubscriber.php` (audit + assignment/status/SLA notifications) |
| Notifications | `HelpDeskAssignedNotification`, `HelpDeskStatusNotification`, `HelpDeskSlaBreachNotification` |
| Automation | Wired triggers `help_desk.ticket_created`, `help_desk.ticket_status_changed`, `help_desk.sla_breached` via `AutomationTriggerRegistry` + `AutomationEventBridge` |
| Commands / jobs | `help-desk:scan-sla-breaches` (every 5 min); `help-desk:sync-mailboxes` (every minute) → `SyncHelpDeskMailboxJob` on queue `help-desk-ingest` |
| Link rules | `LinkableContact`, `LinkableCompany`, `LinkableKnowledgeBaseArticle` — optional, tenant-scoped, module-entitlement-checked |
| Pivot | `help_desk_ticket_knowledge_base_article` — soft M2M (no `module_dependencies` row) |
| Tests | `HelpDeskTicketTest`, `HelpDeskCategoryTest`, `HelpDeskKnowledgeBaseLinkTest`, `HelpDeskSlaTest`, `HelpDeskMailIngestTest` |
| Migrations | `2026_08_14_*` baseline … `2026_08_30_16000*` SLA (1.3.0) … `2026_08_30_11530*` mailboxes + email source (1.4.0) |

## Domain notes

- **No hard module dependency**: Help Desk has no `module_dependencies` row — installable standalone. `contact_id` / `company_id` are nullable columns.
- **Tenant categories**: `help_desk_categories` lookup (name, slug, `sort_order`, `is_active`, soft deletes). `help_desk_tickets.category_id` is a nullable FK. Category CRUD reuses `help-desk.view|create|update|delete|restore|force.delete` — no `help-desk-categories.*` family. `HelpDeskCategorySeederService::ensureDefaults()` lazily inserts General / Technical / Billing / Account / Other (slugs `general|technical|billing|account|other`) on first list/create; lazy seed does not write activity. Starter slugs are immutable on update. **Other** cannot be soft- or force-deleted (422). Listing does not restore deleted starters except a missing/trashed **Other**. Delete/forceDelete blocked while any tickets (including trashed, for force) still reference the category. Spatie log name `help-desk-categories`.
- Status machine on `HelpDeskStatusEnum::allowedTransitions()` / `canTransitionTo()`: `open → in_progress|waiting|resolved|closed`, `in_progress → waiting|resolved|closed`, `waiting → in_progress|resolved|closed`, `resolved → closed|open`, `closed → open`. `HelpDeskTicketService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions.
- Content updates (`PUT`) blocked when `status === closed` via `HelpDeskTicket::isEditable()`. Assignment after submit uses `POST …/assign`.
- `close()` / `reopen()` are assignee-scoped in `HelpDeskTicketPolicy` (same as `view` / `update`) unless the actor has `help-desk.assign` or is superadmin.
- `contact_id` / `company_id` validated via `LinkableContact` / `LinkableCompany` — null always passes; non-null requires module entitlement, tenant scope, and assignee rules when applicable.
- `knowledge_base_article_ids` on create/update and `PUT …/articles` sync via `HelpDeskTicketService::syncKnowledgeBaseArticles()` — requires `module:knowledge-base`; `LinkableKnowledgeBaseArticle` allows published for view-only actors or any visible article when actor has `knowledge-base.update`. Records `articles_synced` on the domain timeline when the set changes.
- `help-desk.force.delete` is not granted to any default role — owner/superadmin only.
- Auto-numbering: `HelpDeskTicketService::nextNumber()` reads `help_desk_number_prefix` tenant setting (default `HD-`), zero-pads running count to 5 digits. Exposed via `PUT /settings` (`UpdateTenantSettingsRequest`). `unique(tenant_id, number)` DB index; `create()` retries up to 3 times via `RetriesOnDuplicateNumber`.
- Overdue scope: open statuses (`open`, `in_progress`, `waiting`) with `due_at < UtcInstant::now()` — aligns with workspace timezone KPI fixes elsewhere.
- **SLA clocks** (`HelpDeskSlaClockService`): most-specific active policy (category+priority > priority > category > default); `UtcDateTime` columns; first response on first staff note or leave-`open` transition; `help-desk:scan-sla-breaches` marks response/resolve breaches via `UtcInstant`.
- **Email intake**: tenant-scoped `help_desk_mailboxes` (encrypted IMAP password); ingest reuses `MailboxClient` / `MailboxConnection` (not personal `EmailAccount`); replies matched by ticket number prefix; idempotent `source_message_id`.
- Dashboard widget: `DashboardWidgetService` registers `help_desk_my_open` gated by `module:help-desk` + `help-desk.view`.

## Permissions

```
help-desk.view | create | update | delete | restore | force.delete | assign | close | reopen
```

Routes use `module:help-desk` then `can:help-desk.*` / policies. SLA policy and mailbox CRUD reuse the same permissions (categories pattern).

Catalog: slug `help-desk`, category `operations`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`, version **1.4.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only) — **no** `module_dependencies` row.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-help-desk.md](/api/tenant-v1-help-desk).

## Frontend

SPA mirrors **Expenses** (dedicated create/view/edit pages, no create/edit page or record page) under AppLayout.

| Piece | Path |
|-------|------|
| Page | `src/pages/help-desk/` (`help-desk-page.tsx`, `help-desk-form.tsx`, `help-desk-form-page.tsx`, `help-desk-view-page.tsx`, `help-desk-categories-dialog.tsx`, `help-desk-sla-policies-dialog.tsx`, `help-desk-mailboxes-dialog.tsx`) |
| View page | Details (category, priority, status, due date, SLA clocks, source, assignee, related contact/company, related KB articles), notes, timeline — actions: assign, add note, status transitions, close, reopen, edit (non-closed), delete |
| Form page | Subject, description, category picker, priority, due date, conditional contact/company pickers, and **Knowledge base articles** multi-select when `hasModule('knowledge-base')` + `knowledge-base.view` |
| Service | `helpDeskService` + `helpDeskCategoryService` + `helpDeskSlaPolicyService` + `helpDeskMailboxService` in `src/api/services.ts` |
| Types | `HelpDesk*` in `src/types/api.ts` |
| Query keys | `QUERY_KEYS.helpDeskTickets` / `helpDeskTicket(id)` / `helpDeskTicketTimeline(id)` / `helpDeskStats` / `helpDeskCategories` / `helpDeskSlaPolicies` / `helpDeskMailboxes` |
| Permissions | `PERMISSIONS.helpDesk.*` |
| Nav | **Operations** sidebar group — `permission: PERMISSIONS.helpDesk.view`, `module: 'help-desk'` |
| Route | `tenantRoutes.helpDesk = '/help-desk'`, lazy-loaded in `App.tsx` behind `RequireAccess module="help-desk"` |
| Dashboard | `tenant-dashboard-widgets.tsx` — `help_desk_my_open` widget |
| Notifications | `src/notifications/modules/help-desk.ts` — assigned/closed/reopened/due/overdue/SLA breach types (deep link `/help-desk/:id`) |
| Playwright | `e2e/pages/help-desk.page.ts`, `e2e/tests/help-desk/`, `npm run test:e2e:help-desk` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/HelpDesk/
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

- Customer portal, chat/social intake, `@mentions`, Communication Template reply context, Kanban
