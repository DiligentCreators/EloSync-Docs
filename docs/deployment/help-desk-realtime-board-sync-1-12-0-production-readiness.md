# Help Desk real-time board sync (1.12.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-05 |
| **Status** | **Go for production** |
| **Scope** | Private board channel `tenant.{id}.help-desk.board` + `HelpDeskTicketCreated`/`HelpDeskTicketUpdated`/`HelpDeskTicketStatusChanged`/`HelpDeskTicketAssigned`/`HelpDeskTicketDeleted` broadcasts; SPA debounce-invalidate hook; catalog **help-desk 1.11.0 → 1.12.0** |
| **Companion** | [Help Desk developer guide](/developer-guide/help-desk) · [Help Desk overview](/user-guide/help-desk-overview) · [Tasks 1.8.0 readiness](/deployment/tasks-realtime-board-sync-1-8-0-production-readiness) (pattern source) · [CHANGELOG](/changelog/) |

---

## Executive summary

The Help Desk status Kanban now stays in sync across open tabs/users without a manual refresh. Backend fires five `ShouldBroadcastNow` events off the existing `HelpDeskEventSubscriber` domain-event handlers onto a new private Reverb channel; the SPA joins that channel only while the board view is mounted and debounces invalidation of the board + stats queries so a burst of changes collapses into one refetch. The design deliberately mirrors the **Tasks 1.8.0 / Leads 1.8.0 / Live Chat inbox invalidate pattern** (refetch-on-signal) and explicitly avoids the **Team Chat message-patching pattern** (no per-card payload merging). Board columns are `HelpDeskStatusEnum` values (`status` / `previous_status`), not pipeline stages. Status broadcasts fire from the existing `HelpDeskTicketStatusChanged` domain event (Help Desk already had a dedicated status event, unlike Tasks which derives status-changed from update diffs).

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel realtime architecture; reuses `window.Echo`) | **Pass** |
| Channel auth: same tenant + `help-desk.view` (mirrors `TaskBoardChannel`) | **Pass** |
| Cross-tenant isolation | **Pass** — different `tenantId` on the channel name is rejected by `HelpDeskBoardChannel::join` |
| Broadcasts fire on create / update / status change / close / assign / unassign / delete | **Pass** |
| SPA payload contract (`broadcastWith`) | **Pass** — `action`, `ticket_id`, `status`, `previous_status`, `assigned_to` |
| Subject-only update does not emit `HelpDeskTicketStatusChanged` | **Pass** |
| `assigned_to` present on assigned payload (including unassign → `null`) | **Pass** |
| Broadcast failures never break ticket writes (`SafeRealtimeBroadcast`) | **Pass** |
| Domain events stay separate from broadcast classes | **Pass** — new `App\Events\HelpDesk\*Broadcast` namespace; existing `App\Events\HelpDeskTicket*` untouched |
| Catalog migrate-only **1.12.0** + CatalogSeeder companion | **Pass** |
| Playwright | **Pass** — `npm run test:e2e:help-desk` (tenant): complaint-dialog + full human workflow (validation, categories, CRUD, status, notes, trash, Board/List) + KB links — **3 passed** (one login session per spec) |
| Pest coverage | **Pass** — `HelpDeskRealtimeBoardTest` (8) + `HelpDeskModuleVersion1120BumpTest` (2) = **10 passed**; companion `AutomationEngineSupportTest` catalog snapshot **1.12.0** |
| Security: cross-tenant isolation | **Pass** |
| Security: assignee-scoped board metadata (tenant-wide channel) | **Accepted** — identical to Tasks 1.8.0; payload is id-only and SPA ignores content (API refetch remains assignee-scoped) |

## Findings

### Closed (audit remediations)

None at first pass — implementation copied the Tasks 1.8.0 remediations (payload contract, unassign `null`, close as status broadcast, subject-only does not emit status_changed, `SafeRealtimeBroadcast`).

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| R1 | Info | Restore / force-delete do not emit a distinct restore event; force-delete still fires `HelpDeskTicketDeleted` (domain `force` flag). Restore stays off the board channel — same as Tasks 1.8.0 |
| R2 | Info | Notes, SLA, and mailbox ingest stay off the board channel except when they already fire ticket create/update/status domain events |
| R3 | Ops | No Reverb in CI; live two-session smoke remains a staging checklist item |
| R4 | Info | No Playwright realtime spec — same as Tasks / Leads / Live Chat. Existing one-session Help Desk Playwright still covers validation, CRUD, status, notes, trash, and Board/List toggle |
| R5 | Info | Mobile Help Desk board realtime is out of scope (web Kanban only) |
| R6 | Info | Channel join is tenant + `help-desk.view` (not per-assignee). Payload is id-only; HTTP refetch stays assignee-scoped |

## What shipped

### Backend

- `app/Broadcasting/HelpDeskBoardChannel.php` — private channel auth, same shape as `TaskBoardChannel` (tenant match + `help-desk.view`).
- `routes/channels.php` — registers `tenant.{tenantId}.help-desk.board`.
- `app/Events/HelpDesk/HelpDeskBoardBroadcastPayload.php` — shared payload builder (`action`, `ticket_id`, `uuid`, `actor_id`, `status`, optional `previous_status` / `assigned_to`).
- `app/Events/HelpDesk/HelpDeskTicket{Created,Updated,StatusChanged,Assigned,Deleted}Broadcast.php` — `ShouldBroadcastNow`, each `broadcastAs()` matching the SPA's `.HelpDeskTicketXxx` listener name.
- `app/Listeners/HelpDeskEventSubscriber.php` — create/update/assign/delete/status handlers fire the matching broadcast via `SafeRealtimeBroadcast::dispatch`.
- Catalog: `database/migrations/2026_10_05_023800_bump_help_desk_module_to_1_12_0.php` (migrate-only, reversible) + `CatalogSeeder` `help-desk` version **1.12.0**.

### Frontend

- `src/hooks/use-help-desk-board-realtime.ts` — subscribes via shared `window.Echo`; listens for all five events; debounces (~200ms) invalidate of `QUERY_KEYS.helpDeskBoard` + `QUERY_KEYS.helpDeskStats`.
- `src/pages/help-desk/help-desk-page.tsx` — calls the hook with `enabled: viewMode === 'board'`.
- `src/types/api.ts` — `HelpDeskBoardRealtimePayload` type.

### Docs

- Help Desk user/developer/API/deployment/upgrade/roadmap guides updated; this readiness doc; CHANGELOG entry.

## Operator checklist

1. `php artisan migrate --force` (catalog bump only — **do not** `db:seed`)
2. Deploy Frontend SPA with the Help Desk board hook
3. Confirm Reverb is running; `php artisan reverb:restart` if already up
4. Staging: two sessions on Help Desk **Board** — create, status drag, assign, delete; second session refetches without reload

## Rollback

`php artisan migrate:rollback` on `2026_10_05_023800_bump_help_desk_module_to_1_12_0` restores catalog **1.11.0**. Redeploy previous SPA to stop joining the channel. Broadcast classes are additive; rolling back the catalog does not drop ticket data.
