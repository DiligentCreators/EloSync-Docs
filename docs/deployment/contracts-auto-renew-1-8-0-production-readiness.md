# Contracts auto-renew (1.8.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-27 |
| **Status** | **Go for production** |
| **Scope** | Per-contract `auto_renew` boolean; daily `contracts:process-auto-renewals`; catalog **contracts 1.7.0 → 1.8.0** |
| **Companion** | [Contracts deployment](./contracts) · [Contracts user guide](/user-guide/contracts) · [CHANGELOG](/changelog/) |

---

## Executive summary

Operators can mark a contract for auto-renew (requires `end_date`). While **Active**, when the end date is on or before today in the workspace timezone, the scheduled command extends `start_date` / `end_date` by the prior term length, keeps status **Active**, and writes an `auto_renewed` timeline activity. Draft create/edit and Active/Sent toggle (update with only `auto_renew`) are supported. No new Spatie permissions.

**Go / No-Go:** **Go**. Cutover: migrate-only (column + catalog bump), ensure scheduler runs `contracts:process-auto-renewals` daily.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| `auto_renew` requires `end_date` (create/update/toggle) | **Pass** |
| Active/Sent may toggle `auto_renew` without full draft edit | **Pass** |
| Term extension uses start→end day diff; idempotent after extend | **Pass** |
| Tenant isolation + entitlement gate in command | **Pass** |
| Catalog migrate-only **1.8.0** + CatalogSeeder | **Pass** |
| Pest auto-renew suite | **Pass** |
| Playwright contracts workflow (validation + Active toggle) | **Pass** (after toast strict-mode `.first()`) |
| Docs + roadmap (auto-renew removed from deferred) | **Pass** |

## Upgrade & staging smoke

1. `php artisan migrate --force` — adds `contracts.auto_renew`, catalog → **1.8.0** (do **not** `db:seed`).
2. Confirm Forge/Cloud schedule includes `contracts:process-auto-renewals` daily.
3. Smoke: create Active auto-renew contract with past end date → run command → dates extended + timeline.

## Rollback

Roll back bump migration (`down` → **1.7.0**) and drop `auto_renew` column migration. Scheduler entry can remain harmless if column removed after code rollback.
