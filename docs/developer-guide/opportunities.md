# Opportunities — Developer Guide

Mirror of the [Leads developer guide](/developer-guide/leads) (pipeline board) and [Activities developer guide](/developer-guide/activities) (soft related FKs, notes, assignee scope). Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Opportunity.php`, `OpportunityStage`, `OpportunityTag`, `OpportunityNote`, `OpportunityActivity` |
| Enums | `OpportunityActivityTypeEnum` |
| Service | `app/Services/Tenant/OpportunityService.php` (+ `ScopesToAssignee`), `OpportunityTagService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/OpportunityController.php`, `OpportunityTagController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Opportunity/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Opportunity/*` |
| Policy | `app/Policies/OpportunityPolicy.php`, `OpportunityTagPolicy.php` |
| Events | `app/Events/Opportunity*.php` (includes `OpportunityTagCreated`, `OpportunityTagsSynced`) |
| Realtime board channel | `app/Broadcasting/OpportunityBoardChannel.php` (registered in `routes/channels.php`) |
| Realtime board broadcasts | `app/Events/Opportunity/Opportunity{Created,Updated,StageChanged,Assigned,Deleted}Broadcast.php` + `OpportunityBoardBroadcastPayload.php` |
| Subscriber | `app/Listeners/OpportunityEventSubscriber.php` (audit + assignment notification + realtime board broadcasts) |
| Notifications | `app/Notifications/Tenant/Opportunity/OpportunityAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableLead`, `LinkableCompanyForOpportunity`, `EligibleOpportunityAssignee` |
| Stage seeder | `database/seeders/Tenant/OpportunityStageSeeder.php` |
| Tests | `tests/Feature/Tenant/Opportunity/OpportunityTest.php`, `OpportunityTagTest.php`, `OpportunityRealtimeBoardTest.php` |

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

Catalog: slug `opportunities`, category `sales`, `is_default_included = false`, `is_billable = false`, `sort_order = 40`, version **1.3.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only).

## Real-time board sync

Mirrors the Leads 1.8.0 / Live Chat inbox invalidate pattern — **not** the Team Chat message-patching pattern. The board refetches on change instead of patching individual cards.

- **Channel:** private `tenant.{tenantId}.opportunities.board`, registered in `routes/channels.php`. Auth (`OpportunityBoardChannel::join`): same tenant **and** `opportunities.view`.
- **Broadcast events** (`App\Events\Opportunity\*Broadcast`, all `ShouldBroadcastNow`, kept separate from the existing domain events):
  - `OpportunityCreatedBroadcast` → `broadcastAs('OpportunityCreated')`
  - `OpportunityUpdatedBroadcast` → `broadcastAs('OpportunityUpdated')`
  - `OpportunityStageChangedBroadcast` → `broadcastAs('OpportunityStageChanged')` (includes `previous_stage_id`)
  - `OpportunityAssignedBroadcast` → `broadcastAs('OpportunityAssigned')` (includes `assigned_to`)
  - `OpportunityDeletedBroadcast` → `broadcastAs('OpportunityDeleted')`
- **Payload shape** (`OpportunityBoardBroadcastPayload`): `action`, `opportunity_id`, `uuid`, `actor_id`, `stage_id`, plus `previous_stage_id` (stage-changed only) / `assigned_to` (assigned only).
- **Dispatch:** `OpportunityEventSubscriber` fires the matching broadcast from create/update/stage/assign/delete handlers via `SafeRealtimeBroadcast::dispatch` so a Reverb outage never breaks the write path.
- **Frontend:** `src/hooks/use-opportunities-board-realtime.ts` joins the channel via shared `window.Echo` while `opportunities-page.tsx` has `viewMode === 'board'`. Listens for `.OpportunityCreated` / `.OpportunityUpdated` / `.OpportunityStageChanged` / `.OpportunityAssigned` / `.OpportunityDeleted` and debounces (~200ms) an invalidate of `QUERY_KEYS.opportunityBoard` + `QUERY_KEYS.opportunityStats`.
- Catalog **opportunities 1.2.0 → 1.3.0** (migrate-only + `CatalogSeeder` companion).
- Production readiness: [Opportunities real-time board sync 1.3.0](/deployment/opportunities-realtime-board-sync-1-3-0-production-readiness).

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-opportunities.md](/api/tenant-v1-opportunities).

Colored tags are **create-only** for MVP (`GET/POST /opportunity-tags`, assign via `tag_ids` / `PUT …/tags`, filter `tag_id`). No rename/delete/reorder tag routes.

## Frontend

SPA should mirror **Leads** (board default + table, create/edit page, record page) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path (expected) |
|-------|-----------------|
| Page | `src/pages/opportunities/` |
| Shared board | `src/components/crm/kanban-board.tsx` (per-column vertical scroll + contained horizontal scroll; titles stay fixed) |
| Form / detail | create/edit page + record page (Overview, Notes, Activity); board DnD auto-saves stage on the list page |
| Service | `opportunityService` in `src/api/services.ts` |
| Realtime board hook | `src/hooks/use-opportunities-board-realtime.ts` — joins `tenant.{id}.opportunities.board`, debounce-invalidates board + stats |
| Nav | `permission: opportunities.view`, `module: 'opportunities'` (Sales) |
| Playwright | `e2e/pages/opportunities.page.ts`, `e2e/tests/opportunities/`, `npm run test:e2e:opportunities` |
| Catalog | **1.3.0** (real-time board sync) |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Opportunity/OpportunityTest.php
php artisan test --compact tests/Feature/Tenant/Opportunity/OpportunityTagTest.php
php artisan test --compact tests/Feature/Tenant/Opportunity/OpportunityRealtimeBoardTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:opportunities
```

## Logging

- Spatie `LogsActivity` on `Opportunity` (log name `opportunities`)
- Domain `opportunity_activities` timeline
- `PlatformAuditService` via `OpportunityEventSubscriber` (includes `opportunity_tag_created`, `opportunity_tags_synced`)

## Ask EloSync

Ask EloSync Opportunity tools (`get_opportunity`, `get_opportunity_stages`, confirmed stage/assign/note writes, plus existing `search_opportunities` / `get_pipeline_summary`) are registered in `AIToolRegistry` and confirmed via `PendingAiActionService`. Search rows include `stage_id` and assignee id. HTTP `POST …/stage` validates `stage_id` in the current tenant. See [AI tools](/developer-guide/ai-tools) and [AI Opportunity triage production readiness](/deployment/ai-opportunity-triage-production-readiness).
