# Opportunities real-time board sync (1.3.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-04 |
| **Status** | **Go for production** (merge/deploy remaining; live Reverb smoke deferred to staging) |
| **Scope** | Private board channel `tenant.{id}.opportunities.board` + `OpportunityCreated`/`OpportunityUpdated`/`OpportunityStageChanged`/`OpportunityAssigned`/`OpportunityDeleted` broadcasts; SPA debounce-invalidate hook; catalog **opportunities 1.2.0 → 1.3.0** |
| **Companion** | [Opportunities developer guide](/developer-guide/opportunities) · [Opportunities overview](/user-guide/opportunities-overview) · [Leads 1.8.0 readiness](/deployment/leads-realtime-board-sync-1-8-0-production-readiness) (pattern source) · [CHANGELOG](/changelog/) |

---

## Executive summary

The Opportunities Kanban board now stays in sync across open tabs/users without a manual refresh. Backend fires five `ShouldBroadcastNow` events off the existing `OpportunityEventSubscriber` domain-event handlers onto a new private Reverb channel; the SPA joins that channel only while the board view is mounted and debounces invalidation of the board + stats queries so a burst of changes collapses into one refetch. The design deliberately mirrors the **Leads 1.8.0 / Live Chat inbox invalidate pattern** (refetch-on-signal) and explicitly avoids the **Team Chat message-patching pattern** (no per-card payload merging).

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (no parallel realtime architecture; reuses `window.Echo`) | **Pass** |
| Channel auth: same tenant + `opportunities.view` (mirrors `LeadBoardChannel`) | **Pass** |
| Cross-tenant isolation | **Pass** — different `tenantId` on the channel name is rejected by `OpportunityBoardChannel::join` |
| Broadcasts fire on create / update / stage change / assign / delete | **Pass** |
| `previous_stage_id` present on stage-changed payload | **Pass** |
| `assigned_to` present on assigned payload (including unassign → `null`) | **Pass** |
| Broadcast failures never break opportunity writes (`SafeRealtimeBroadcast`) | **Pass** |
| Domain events stay separate from broadcast classes | **Pass** — new `App\Events\Opportunity\*Broadcast` namespace; existing `App\Events\Opportunity{Created,Updated,...}` untouched |
| Catalog migrate-only **1.3.0** + CatalogSeeder companion | **Pass** |
| SPA debounced invalidate (~200ms), board-view-only subscription | **Pass** |
| Pest coverage | **Pass** — `OpportunityRealtimeBoardTest` (7 / 17 assertions) + `OpportunitiesModuleVersion130BumpTest` (bump + CatalogSeeder companion) |
| Security: cross-tenant isolation | **Pass** |
| Security: assignee-scoped board metadata (tenant-wide channel) | **Accepted** — identical to Leads 1.8.0; payload is id-only and SPA ignores content (API refetch remains assignee-scoped) |

## What shipped

### Backend

- `app/Broadcasting/OpportunityBoardChannel.php` — private channel auth, same shape as `LeadBoardChannel` (tenant match + `opportunities.view`).
- `routes/channels.php` — registers `tenant.{tenantId}.opportunities.board`.
- `app/Events/Opportunity/OpportunityBoardBroadcastPayload.php` — shared payload builder (`action`, `opportunity_id`, `uuid`, `actor_id`, `stage_id`, optional `previous_stage_id` / `assigned_to`).
- `app/Events/Opportunity/Opportunity{Created,Updated,StageChanged,Assigned,Deleted}Broadcast.php` — `ShouldBroadcastNow`, each `broadcastAs()` matching the SPA's `.OpportunityXxx` listener name.
- `app/Listeners/OpportunityEventSubscriber.php` — each existing domain-event handler for create/update/stage/assign/delete now also fires the matching broadcast via `SafeRealtimeBroadcast::dispatch`.
- Catalog: `database/migrations/2026_10_04_024500_bump_opportunities_module_to_1_3_0.php` (migrate-only, reversible) + `CatalogSeeder` `opportunities` version **1.3.0**.

### Frontend

- `src/hooks/use-opportunities-board-realtime.ts` — subscribes via shared `window.Echo`; listens for all five events; debounces (~200ms) invalidate of `QUERY_KEYS.opportunityBoard` + `QUERY_KEYS.opportunityStats`.
- `src/pages/opportunities/opportunities-page.tsx` — calls the hook with `enabled: viewMode === 'board'`.
- `src/types/api.ts` — `OpportunityBoardRealtimePayload` type.

### Docs

- Opportunities user/developer guides updated; product roadmap; this readiness doc; CHANGELOG entry.

## Test evidence

```
herd php artisan test --compact tests/Feature/Tenant/Opportunity/OpportunityRealtimeBoardTest.php
Tests: 7 passed (17 assertions)
```

Covers: channel auth (owner / `opportunities.view` staff / no-permission staff / cross-tenant), `OpportunityCreatedBroadcast` on create, `OpportunityUpdatedBroadcast` on update, `OpportunityStageChangedBroadcast` with correct `previous_stage_id`, `OpportunityAssignedBroadcast` with the new assignee id, `OpportunityDeletedBroadcast` on delete, and that a thrown broadcast listener does not prevent the opportunity write from succeeding.

`vendor/bin/pint --dirty --format agent` — pass.

## Known limitations / deferred

- No Reverb broadcaster runs in CI; broadcast dispatch is verified via `Event::fake([...])` + `Event::assertDispatched(...)` rather than an end-to-end socket round-trip. A live Reverb smoke test on staging is recommended before/at go-live.
- No dedicated Playwright realtime spec — same as Leads 1.8.0 / Live Chat.
- Board cards still fully refetch on any board-relevant event (invalidate, not patch) — intentional.
- Mobile Opportunities board realtime is out of scope (web Kanban only).
- **Assignee-scoped channel metadata (accepted):** Channel join is tenant + `opportunities.view` (same as Leads `leads.view`). Staff without `opportunities.assign` can receive tenant-wide board event metadata (`opportunity_id`, `uuid`, `stage_id`, `assigned_to`, `actor_id`) even though HTTP board/list remain assignee-scoped. Payload excludes names/amounts/notes; the SPA only invalidates queries and refetches through the scoped API. Closing this would require per-user channels or org-wide-only join — deferred unless product wants to diverge from Leads.

## Upgrade & staging smoke

1. `php artisan migrate --force` — catalog `opportunities` → **1.3.0** (do **not** `db:seed`).
2. Open the Opportunities board in two browser sessions (same tenant, both with `opportunities.view`). In session A, create a deal, move a card between stages, assign it, then delete it. Confirm session B's board + KPI strip update within ~1s without a manual refresh.
3. Confirm a user without `opportunities.view` cannot subscribe to `tenant.{id}.opportunities.board` (channel auth rejects).

## Rollback

Roll back the catalog migration (`down()` → **1.2.0**) after rolling back application code. The new broadcast classes and channel are additive — no schema changes, so rollback is code-only plus the catalog version bump.
