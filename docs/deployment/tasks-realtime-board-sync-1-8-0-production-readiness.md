# Tasks real-time board sync (1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-04 |
| **Re-audited** | 2026-10-04 (payload/unassign/complete remediations closed) |
| **Status** | **Go for production** |
| **Scope** | Private board channel `tenant.{id}.tasks.board` + `TaskCreated`/`TaskUpdated`/`TaskStatusChanged`/`TaskAssigned`/`TaskDeleted` broadcasts; SPA debounce-invalidate hook; catalog **tasks 1.7.0 → 1.8.0** |
| **Companion** | [Tasks developer guide](/developer-guide/tasks) · [Tasks overview](/user-guide/tasks-overview) · [Leads 1.8.0 readiness](/deployment/leads-realtime-board-sync-1-8-0-production-readiness) · [Opportunities 1.3.0 readiness](/deployment/opportunities-realtime-board-sync-1-3-0-production-readiness) (pattern sources) · [CHANGELOG](/changelog/) |

---

## Executive summary

The Tasks Kanban board now stays in sync across open tabs/users without a manual refresh. Backend fires five `ShouldBroadcastNow` events off the existing `TaskEventSubscriber` domain-event handlers onto a new private Reverb channel; the SPA joins that channel only while the board view is mounted and debounces invalidation of the board + stats queries so a burst of changes collapses into one refetch. The design deliberately mirrors the **Leads 1.8.0 / Opportunities 1.3.0 / Live Chat inbox invalidate pattern** (refetch-on-signal) and explicitly avoids the **Team Chat message-patching pattern** (no per-card payload merging). Board columns are `TaskStatusEnum` values (`status` / `previous_status`), not pipeline stages.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel realtime architecture; reuses `window.Echo`) | **Pass** |
| Channel auth: same tenant + `tasks.view` (mirrors `LeadBoardChannel`) | **Pass** |
| Cross-tenant isolation | **Pass** — different `tenantId` on the channel name is rejected by `TaskBoardChannel::join` |
| Broadcasts fire on create / update / status change / assign / unassign / complete / delete | **Pass** |
| SPA payload contract (`broadcastWith`) | **Pass** — `action`, `task_id`, `status`, `previous_status`, `assigned_to` |
| Title-only update does not emit `TaskStatusChanged` | **Pass** |
| `assigned_to` present on assigned payload (including unassign → `null`) | **Pass** |
| Broadcast failures never break task writes (`SafeRealtimeBroadcast`) | **Pass** |
| Domain events stay separate from broadcast classes | **Pass** — new `App\Events\Task\*Broadcast` namespace; existing `App\Events\Task{Created,Updated,...}` untouched |
| Catalog migrate-only **1.8.0** + CatalogSeeder companion | **Pass** |
| SPA debounced invalidate (~200ms), board-view-only subscription | **Pass** |
| Pest coverage | **Pass** — `TaskRealtimeBoardTest` (8) + `TasksModuleVersion180BumpTest` (2) = **10 passed / 27 assertions** |
| Frontend `tsc -b` | **Pass** |
| Security: cross-tenant isolation | **Pass** |
| Security: assignee-scoped board metadata (tenant-wide channel) | **Accepted** — identical to Leads 1.8.0; payload is id-only and SPA ignores content (API refetch remains assignee-scoped) |

## Findings

### Closed (audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | Medium | Tests asserted event properties only — SPA contract (`broadcastWith` / channel name) was unverified | `TaskRealtimeBoardTest` now asserts `private-tenant.{id}.tasks.board`, `action`, `task_id`, `status`, `previous_status` |
| A2 | Medium | Unassign (`assigned_to: null`) claimed Pass with no coverage | Assign test now posts `assigned_to: null` and asserts payload `assigned_to` is `null` |
| A3 | Low | `POST …/complete` (list/board complete) not asserted for status broadcast | New case: complete → `TaskStatusChangedBroadcast` with `previous_status=open` and payload `status=completed` |
| A4 | Low | Title-only update could emit a spurious status_changed if enum/string compare drifted | Title rename fakes both events and `assertNotDispatched(TaskStatusChangedBroadcast)` |
| A5 | Low | `statusValue()` only handled `TaskStatusEnum` + string | Also unwraps `BackedEnum` string values |

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| R1 | Info | Restore / force-delete do not emit board broadcasts — same as Leads 1.8.0 / Opportunities 1.3.0 |
| R2 | Info | Notes, tags, and restore stay off the board channel (invalidate-on-signal for write paths only) |
| R3 | Ops | No Reverb in CI; live two-session smoke remains a staging checklist item |
| R4 | Info | No Playwright realtime spec — same as Leads / Live Chat |
| R5 | Info | Mobile Tasks board realtime is out of scope (web Kanban only) |
| R6 | Info | Channel join is tenant + `tasks.view` (not per-assignee). Payload is id-only; HTTP refetch stays assignee-scoped |

## What shipped

### Backend

- `app/Broadcasting/TaskBoardChannel.php` — private channel auth, same shape as `LeadBoardChannel` (tenant match + `tasks.view`).
- `routes/channels.php` — registers `tenant.{tenantId}.tasks.board`.
- `app/Events/Task/TaskBoardBroadcastPayload.php` — shared payload builder (`action`, `task_id`, `uuid`, `actor_id`, `status`, optional `previous_status` / `assigned_to`).
- `app/Events/Task/Task{Created,Updated,StatusChanged,Assigned,Deleted}Broadcast.php` — `ShouldBroadcastNow`, each `broadcastAs()` matching the SPA's `.TaskXxx` listener name.
- `app/Listeners/TaskEventSubscriber.php` — create/update/assign/delete handlers fire the matching broadcast via `SafeRealtimeBroadcast::dispatch`; `TaskStatusChangedBroadcast` fires from `handleTaskUpdated` when status actually changed (no new domain event).
- Catalog: `database/migrations/2026_10_04_193500_bump_tasks_module_to_1_8_0.php` (migrate-only, reversible) + `CatalogSeeder` `tasks` version **1.8.0**.

### Frontend

- `src/hooks/use-tasks-board-realtime.ts` — subscribes via shared `window.Echo`; listens for all five events; debounces (~200ms) invalidate of `QUERY_KEYS.taskBoard` + `QUERY_KEYS.taskStats`.
- `src/pages/tasks/tasks-page.tsx` — calls the hook with `enabled: viewMode === 'board'`.
- `src/types/api.ts` — `TaskBoardRealtimePayload` type.

### Docs

- Tasks user/developer guides updated; product roadmap; this readiness doc; CHANGELOG entry.

## Test evidence

```
herd php artisan test --compact tests/Feature/Tenant/Task/TaskRealtimeBoardTest.php tests/Feature/Central/Catalog/TasksModuleVersion180BumpTest.php
Tests: 10 passed (27 assertions)
```

`TaskRealtimeBoardTest` covers: channel auth (owner / `tasks.view` staff / no-permission / cross-tenant); create payload + private channel name; title update without status_changed; PUT status + `previous_status` payload; POST complete; assign + unassign `assigned_to`; delete; broadcast-failure write resilience. `TasksModuleVersion180BumpTest` covers `bumpVersion` + CatalogSeeder companion **1.8.0**.

`vendor/bin/pint --dirty --format agent` — pass.

Frontend `npm run typecheck` (`tsc -b`) — pass.

## Known limitations / deferred

- No Reverb broadcaster runs in CI; broadcast dispatch is verified via `Event::fake([...])` + `Event::assertDispatched(...)` rather than an end-to-end socket round-trip. A live Reverb smoke test on staging is recommended before/at go-live.
- No dedicated Playwright realtime spec — same as Leads 1.8.0 / Live Chat.
- Board cards still fully refetch on any board-relevant event (invalidate, not patch) — intentional.
- Mobile Tasks board realtime is out of scope (web Kanban only).
- Notes, tags, restore, and force-delete do not emit board broadcasts (same as Leads / Opportunities).
- **Assignee-scoped channel metadata (accepted):** Channel join is tenant + `tasks.view` (same as Leads `leads.view`). Staff without `tasks.assign` can receive tenant-wide board event metadata (`task_id`, `uuid`, `status`, `assigned_to`, `actor_id`) even though HTTP board/list remain assignee-scoped. Payload excludes titles/notes; the SPA only invalidates queries and refetches through the scoped API.

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `tasks` → **1.8.0** (do **not** `db:seed`).
2. Open the Tasks board in two browser sessions (same tenant, both with `tasks.view`). In session A, create a task, drag a card between status columns, complete it, assign it, unassign it, then delete it. Confirm session B's board + KPI strip update within ~1s without a manual refresh.
3. Confirm a user without `tasks.view` cannot subscribe to `tenant.{id}.tasks.board` (channel auth rejects).

## Rollback

Roll back the catalog migration (`down()` → **1.7.0**) after rolling back application code. The new broadcast classes and channel are additive — no schema changes, so rollback is code-only plus the catalog version bump.
