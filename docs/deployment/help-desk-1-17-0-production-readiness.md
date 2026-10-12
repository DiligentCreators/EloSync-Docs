# Help Desk status timing (1.17.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-13 |
| **Status** | **Go for production** |
| **Re-verified** | 2026-10-13 — Pest `HelpDeskStatusTimingTest` **4/4**; headed Playwright Help Desk workflow **2/2** (`E2E_BROWSER_CHANNEL=chrome`) |
| **Scope** | Per-status timing on Help Desk tickets (`started_at` / `resolved_at`, `status_changed` durations, detail `timing` summary as `DD:HH:MM`) |
| **Companion** | [Help Desk deployment](./help-desk) · Tasks status timing **1.10.0** · [CHANGELOG](/changelog/) |

---

## Executive summary

Mirrors Tasks **1.10.0** status timing for Help Desk. Tickets record time spent in each status; first enter to **In Progress** sets `started_at`; first **Resolved** or **Closed** sets `resolved_at`. Reopen to **Open** clears both and starts a new timing cycle. SPA Timeline (full page + list peek Activity) shows the summary and per-transition durations.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| No new permissions | **Pass** |
| Migrate-only catalog **1.17.0** | **Pass** |
| Pest `HelpDeskStatusTimingTest` | **Pass** |
| Headed Playwright Help Desk workflow timing assert | **Pass** (`Created → Resolved` on Timeline) |
| WhatsApp auto-ticket / bidirectional sync | **Deferred** (next PR) |

## Upgrade & staging smoke

1. `php artisan migrate --force` — columns + catalog bump (do **not** `db:seed`).
2. Confirm catalog: `help-desk` **1.17.0**.
3. Create a ticket → In Progress → Resolved/Closed → Timeline shows **Created → Resolved** and status segment durations.
4. Reopen → timing cycle clears; work again and confirm a new cycle.

## Rollback

Catalog `down` → help-desk **1.16.0** with matching code. Drop `started_at` / `resolved_at` if rolling back schema.
