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
| Subscriber | `app/Listeners/HelpDeskEventSubscriber.php` (audit + assignment/status/SLA notifications + board realtime via `SafeRealtimeBroadcast`) |
| Notifications | `HelpDeskAssignedNotification`, `HelpDeskStatusNotification`, `HelpDeskSlaBreachNotification` |
| Automation | Wired triggers `help_desk.ticket_created`, `help_desk.ticket_status_changed`, `help_desk.sla_breached` via `AutomationTriggerRegistry` + `AutomationEventBridge` |
| Commands / jobs | `help-desk:scan-sla-breaches` (every 5 min); `help-desk:sync-mailboxes` (every minute) → `SyncHelpDeskMailboxJob` on queue `help-desk-ingest` |
| Link rules | `LinkableContact`, `LinkableCompany`, `LinkableKnowledgeBaseArticle` — optional, tenant-scoped, module-entitlement-checked |
| Pivot | `help_desk_ticket_knowledge_base_article` — soft M2M (no `module_dependencies` row) |
| Tests | `HelpDeskTicketTest`, `HelpDeskCategoryTest`, `HelpDeskKnowledgeBaseLinkTest`, `HelpDeskSlaTest`, `HelpDeskMailIngestTest`, `HelpDeskRealtimeBoardTest` |
| Migrations | `2026_08_14_*` baseline … `2026_08_30_16000*` SLA (1.3.0) … `2026_08_30_11530*` mailboxes + email source (1.4.0) |

## Notes visibility (`is_internal`)

`help_desk_notes.is_internal` (default `true`):

- **Internal** (`true`) — staff-only; `@mentions`; does not mark SLA first response. AI `add_help_desk_ticket_note` always internal.
- **Public** (`false`) — customer-visible conversation; TipTap HTML + attachments on web; marks SLA first response for staff authors. Portal and email ingest always create public notes.
- Portal show loads `publicHelpDeskNotes` only (ASC). Staff show embeds all notes newest-first with `is_internal` on each row.
- **Customer reply reopen (1.15.0):** `HelpDeskTicketService::reopenFromCustomerReply()` runs after portal/`addEmailNote` public notes when status is `closed` or `resolved` → `open` (system actor). Fires `HelpDeskTicketStatusChanged` + timeline “Reopened by customer reply”. `HelpDeskCustomerReplyNotification` to assignee (fallback creator); in-app always; mail via `email_notifications.help_desk_customer_reply` (default off). Close/reopen mail use `help_desk_closed` / `help_desk_reopened` (no longer `task_status`).

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

Catalog: slug `help-desk`, category `operations`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`, version **1.15.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only) — **no** `module_dependencies` row.

## Communication Templates (soft)

`HelpDeskPlaceholderProvider` registers context `help-desk` on `PlaceholderRegistry` (see [Communication Templates](/developer-guide/communication-templates)). Ticket placeholders include `number`, `subject`, `status`, `priority`, `category_name`, `name` / `email` / `phone` (from linked contact), `company_name`, `assignee_name`, plus shared agent/workspace/system tokens. WhatsApp `phone` resolves from the soft-linked contact — tickets without a contact phone cannot render WhatsApp extras.

SPA: ticket view soft-gates the shared `WhatsAppTemplatePickerDialog` when `module:communication-templates` + `communication-templates.use` and the linked contact has a phone. **No** `module_dependencies` row between Help Desk and Communication Templates.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-help-desk.md](/api/tenant-v1-help-desk).

## Frontend

SPA mirrors **Expenses** (dedicated create/view/edit pages, no create/edit page or record page) under AppLayout.

| Piece | Path |
|-------|------|
| Page | `src/pages/help-desk/` (`help-desk-page.tsx`, `help-desk-form.tsx`, `help-desk-form-page.tsx`, `help-desk-view-page.tsx`, `help-desk-categories-dialog.tsx`, `help-desk-sla-policies-dialog.tsx`, `help-desk-mailboxes-dialog.tsx`) |
| Shared board | `src/components/crm/kanban-board.tsx` (status Kanban; per-column vertical scroll + contained horizontal scroll; titles stay fixed) |
| View page | Details (category, priority, status, due date, SLA clocks, source, assignee, related contact/company + soft-gated WhatsApp template picker, related KB articles), **Conversation** (public TipTap replies) + **Internal notes** (`@mentions`), timeline — actions: assign, reply/add note, status transitions, close, reopen, edit (non-closed), delete |
| Form page | Subject, description, category picker, priority, due date, conditional contact/company pickers, and **Knowledge base articles** multi-select when `hasModule('knowledge-base')` + `knowledge-base.view` |
| Service | `helpDeskService` + `helpDeskCategoryService` + `helpDeskSlaPolicyService` + `helpDeskMailboxService` in `src/api/services.ts` |
| Types | `HelpDesk*` in `src/types/api.ts` |
| Query keys | `QUERY_KEYS.helpDeskTickets` / `helpDeskTicket(id)` / `helpDeskTicketTimeline(id)` / `helpDeskStats` / `helpDeskBoard` / `helpDeskCategories` / `helpDeskSlaPolicies` / `helpDeskMailboxes` |
| Realtime hook | `src/hooks/use-help-desk-board-realtime.ts` — board-view-only, debounce-invalidate `helpDeskBoard` + `helpDeskStats` |
| Permissions | `PERMISSIONS.helpDesk.*` |
| Nav | **Operations** sidebar group — `permission: PERMISSIONS.helpDesk.view`, `module: 'help-desk'` |
| Route | `tenantRoutes.helpDesk = '/help-desk'`, lazy-loaded in `App.tsx` behind `RequireAccess module="help-desk"` |
| Dashboard | `tenant-dashboard-widgets.tsx` — `help_desk_my_open` widget |
| Notifications | `src/notifications/modules/help-desk.ts` — assigned/closed/reopened/customer_reply/due/overdue/SLA breach types (deep link `/help-desk/:id`) |
| Playwright | `e2e/pages/help-desk.page.ts`, `e2e/tests/help-desk/`, `npm run test:e2e:help-desk` |

## Real-time board sync

Mirrors the Tasks 1.8.0 / Leads 1.8.0 / Live Chat inbox invalidate pattern — **not** the Team Chat message-patching pattern. The board refetches on change instead of patching individual cards. Columns are `HelpDeskStatusEnum` values, not pipeline stages.

- **Channel:** private `tenant.{tenantId}.help-desk.board`, registered in `routes/channels.php`. Auth (`HelpDeskBoardChannel::join`): same tenant **and** `help-desk.view`.
- **Broadcast events** (`App\Events\HelpDesk\*Broadcast`, all `ShouldBroadcastNow`, kept separate from the existing domain events `App\Events\HelpDeskTicketCreated` etc.):
  - `HelpDeskTicketCreatedBroadcast` → `broadcastAs('HelpDeskTicketCreated')`
  - `HelpDeskTicketUpdatedBroadcast` → `broadcastAs('HelpDeskTicketUpdated')`
  - `HelpDeskTicketStatusChangedBroadcast` → `broadcastAs('HelpDeskTicketStatusChanged')` (includes `previous_status`; fired from `handleHelpDeskTicketStatusChanged` on the existing domain event)
  - `HelpDeskTicketAssignedBroadcast` → `broadcastAs('HelpDeskTicketAssigned')` (includes `assigned_to`)
  - `HelpDeskTicketDeletedBroadcast` → `broadcastAs('HelpDeskTicketDeleted')`
- **Payload shape** (`HelpDeskBoardBroadcastPayload`): `action`, `ticket_id`, `uuid`, `actor_id`, `status`, plus `previous_status` (status-changed only) / `assigned_to` (assigned only).
- **Dispatch:** `HelpDeskEventSubscriber` fires the matching broadcast from create/update/assign/delete/status handlers via `SafeRealtimeBroadcast::dispatch` so a Reverb outage never breaks the write path.
- **Frontend:** `src/hooks/use-help-desk-board-realtime.ts` joins the channel via shared `window.Echo` while `help-desk-page.tsx` has `viewMode === 'board'`. Listens for `.HelpDeskTicketCreated` / `.HelpDeskTicketUpdated` / `.HelpDeskTicketStatusChanged` / `.HelpDeskTicketAssigned` / `.HelpDeskTicketDeleted` and debounces (~200ms) an invalidate of `QUERY_KEYS.helpDeskBoard` + `QUERY_KEYS.helpDeskStats`.
- Catalog **help-desk 1.11.0 → 1.12.0** (migrate-only + `CatalogSeeder` companion).
- Production readiness: [Help Desk real-time board sync 1.12.0](/deployment/help-desk-realtime-board-sync-1-12-0-production-readiness).

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
| Give Feedback shell dialog | File a complaint shell dialog (`ComplaintDialog`) → `POST /help-desk` |

Tenant SPA mounts both dialogs from the app shell. **File a complaint** is gated by `module:help-desk` + `help-desk.create` and reuses existing ticket create APIs — no parallel complaint tables.

See [Central Feedback System](/developer-guide/central-feedback-system).

## AI tools

Ask EloSync Help Desk tools (`get_help_desk_ticket`, confirmed status/assign/note writes) are registered in `AIToolRegistry` and confirmed via `PendingAiActionService`. See [AI tools](/developer-guide/ai-tools) and [AI Help Desk triage production readiness](/deployment/ai-help-desk-triage-production-readiness).

## Deferred

- Social network DMs / auto-ticket on WhatsApp inbound / bidirectional sync (Portal + Live Chat escalate + WhatsApp escalate ship — see [customer-portal](/developer-guide/customer-portal), Live Chat escalate, WhatsApp Cloud **1.5.0** `POST …/whatsapp/conversations/{id}/escalate`)
