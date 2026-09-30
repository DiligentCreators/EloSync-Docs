# Leads real-time board sync (1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-30 |
| **Status** | **Go for production** (merge/deploy remaining; live Reverb smoke deferred to staging) |
| **Scope** | Private board channel `tenant.{id}.leads.board` + `LeadCreated`/`LeadUpdated`/`LeadStageChanged`/`LeadAssigned`/`LeadDeleted` broadcasts; SPA debounce-invalidate hook; catalog **leads 1.7.0 → 1.8.0** |
| **Companion** | [Leads developer guide](/developer-guide/leads) · [Leads overview](/user-guide/leads-overview) · [Live Chat developer guide](/developer-guide/live-chat) (pattern source) · [CHANGELOG](/changelog/) |

---

## Executive summary

The Leads Kanban board now stays in sync across open tabs/users without a manual refresh. Backend fires five `ShouldBroadcastNow` events off the existing `LeadEventSubscriber` domain-event handlers onto a new private Reverb channel; the SPA joins that channel only while the board view is mounted and debounces invalidation of the board + stats queries so a burst of changes (bulk stage move, import) collapses into one refetch. The design deliberately mirrors the **Live Chat inbox invalidate pattern** (refetch-on-signal) and explicitly avoids the **Team Chat message-patching pattern** (no per-card payload merging) to keep the board's existing filter/sort/pagination logic as the single source of truth for what renders.

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel realtime architecture; reuses `window.Echo`) | **Pass** |
| Channel auth: same tenant + `leads.view` (mirrors `LiveChatInboxChannel`) | **Pass** |
| Cross-tenant isolation | **Pass** — different `tenantId` on the channel name is rejected by `LeadBoardChannel::join` |
| Broadcasts fire on create / update / stage change / assign / delete | **Pass** |
| `previous_stage_id` present on stage-changed payload | **Pass** |
| `assigned_to` present on assigned payload (including unassign → `null`) | **Pass** |
| Broadcast failures never break lead writes (`safeBroadcast` try/catch + `report()`) | **Pass** |
| Domain events stay separate from broadcast classes | **Pass** — new `App\Events\Lead\*Broadcast` namespace; existing `App\Events\Lead{Created,Updated,...}` untouched |
| Catalog migrate-only **1.8.0** + CatalogSeeder companion | **Pass** |
| SPA debounced invalidate (~200ms), board-view-only subscription | **Pass** |
| Pest coverage | **Pass** — `LeadRealtimeBoardTest` (7 tests / 17 assertions) |

## What shipped

### Backend

- `app/Broadcasting/LeadBoardChannel.php` — private channel auth, same shape as `LiveChatInboxChannel` (tenant match + `leads.view`).
- `routes/channels.php` — registers `tenant.{tenantId}.leads.board`.
- `app/Events/Lead/LeadBoardBroadcastPayload.php` — shared payload builder (`action`, `lead_id`, `uuid`, `actor_id`, `stage_id`, optional `previous_stage_id` / `assigned_to`).
- `app/Events/Lead/Lead{Created,Updated,StageChanged,Assigned,Deleted}Broadcast.php` — `ShouldBroadcastNow`, each `broadcastAs()` matching the SPA's `.LeadXxx` listener name.
- `app/Listeners/LeadEventSubscriber.php` — each existing domain-event handler now also fires the matching broadcast, wrapped in a `safeBroadcast()` try/catch/`report()` guard so a Reverb outage cannot fail a lead create/update/stage-change/assign/delete request.
- Catalog: `database/migrations/2026_09_30_120000_bump_leads_module_to_1_8_0.php` (migrate-only, reversible) + `CatalogSeeder` `leads` version `1.7.0 → 1.8.0`.

### Frontend

- `src/hooks/use-leads-board-realtime.ts` — subscribes to the board channel via the existing shared `window.Echo` instance (never opens/closes the socket itself); listens for all five events; debounces (~200ms) a single invalidate of `QUERY_KEYS.leadBoard` + `QUERY_KEYS.leadStats`.
- `src/pages/leads/leads-page.tsx` — calls the hook with `enabled: viewMode === 'board'`, so the table view does not hold an idle channel subscription.
- `src/types/api.ts` — `LeadBoardRealtimePayload` type for the five events' shared shape.

### Docs

- Leads user/developer guides updated (capability + channel/event reference); product roadmap entry closes the previously deferred "Leads: real-time board sync" item; this readiness doc; CHANGELOG entry.

## Test evidence

```
herd php artisan test --compact tests/Feature/Tenant/Lead/LeadRealtimeBoardTest.php
Tests: 7 passed (17 assertions)
```

Covers: channel auth (owner / `leads.view` staff / no-permission staff / cross-tenant), `LeadCreatedBroadcast` on create, `LeadUpdatedBroadcast` on update, `LeadStageChangedBroadcast` with correct `previous_stage_id`, `LeadAssignedBroadcast` with the new assignee id, `LeadDeletedBroadcast` on delete, and that a thrown broadcast listener does not prevent the lead write from succeeding.

`vendor/bin/pint --dirty --format agent` — pass (no style changes needed beyond formatting).

Frontend `npm run typecheck` (`tsc -b`) — pass.

## Known limitations / deferred

- No Reverb broadcaster runs in CI; broadcast dispatch is verified via `Event::fake([...])` + `Event::assertDispatched(...)` (same approach as `LiveChatModuleTest`) rather than an end-to-end socket round-trip. A live Reverb smoke test on staging is recommended before/at go-live, mirroring how Live Chat was verified.
- No dedicated Playwright realtime spec — two independent browser contexts driving a live Reverb connection is expensive to run in CI and Live Chat itself does not have one either. The Pest dispatch-assertion + manual staging smoke substitutes for now, per the design brief.
- Board cards still fully refetch on any board-relevant event (invalidate, not patch) — intentional, matching the Live Chat inbox pattern; keeps existing filter/sort logic authoritative.

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `leads` → **1.8.0** (do **not** `db:seed`).
2. Open the Leads board in two browser sessions (same tenant, both with `leads.view`). In session A, create a lead, move a card between stages, assign it, then delete it. Confirm session B's board + KPI strip update within ~1s without a manual refresh.
3. Confirm a user without `leads.view` cannot subscribe to `tenant.{id}.leads.board` (channel auth rejects).

## Rollback

Roll back the catalog migration (`down()` → **1.7.0**) after rolling back application code. The new broadcast classes and channel are additive — no schema changes, so rollback is code-only plus the catalog version bump.
