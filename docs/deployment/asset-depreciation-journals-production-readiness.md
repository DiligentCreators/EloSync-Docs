# Asset depreciation journals (assets 1.3.0 / accounting 1.10.0) — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-10-18 |
| **Status** | **Go for production** — Pest and headed Playwright green |
| **Scope** | Straight-line monthly depreciation journals for Assets when Accounting is installed |
| **Catalog** | **assets 1.2.0 → 1.3.0**, **accounting 1.9.0 → 1.10.0** |
| **Companion** | [Assets user guide](/user-guide/assets) · [Accounting](/user-guide/accounting-overview) · [CHANGELOG](/changelog/) |

---

## Executive summary

The first depreciation post for an asset capitalizes purchase cost: debit Fixed Assets `1500`, credit Owner Equity `3000`. Each later month debits Depreciation Expense `6500` and credits Accumulated Depreciation `1550`. The last open month of useful life takes the rounding remainder. Retired, disposed, foreign-currency, and already-posted months do not post. Without Accounting, the new fields still save and no journal is written.

**Go / No-Go:** **Go.** Migrate-only. Existing assets are not backfilled.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Capitalize once, then straight-line months through the remainder | **Pass** (Pest) |
| Duplicate month, early month, retired, and foreign currency rejected | **Pass** (Pest) |
| Missing Accounting writes no journal | **Pass** (Pest) |
| `assets.depreciate` required | **Pass** (Pest) |
| Batch posts eligible assets and skips the rest | **Pass** (Pest) |
| Catalog bumps and optional assets → accounting dependency | **Pass** (Pest) |
| Headed one-session SPA: empty name stays on the form; salvage and early month stay in the dialog; capitalization `1500`/`3000` and depreciation `6500`/`1550` open from Journals; duplicate month stays in the dialog; list batch skips an asset with no useful life | **Pass** (`npm run test:e2e:assets:depreciation:headed`, 1 passed) |

## Audit

Reviewed the posting service, permissions, catalog bumps, SPA dialog, mobile post action, and the headed session on 2026-10-18. No product defect turned up. Validation messages stay on the create form and in the depreciation dialog. The list batch reports posted and skipped counts for every asset in the workspace, so a shared demo login will include assets left by earlier runs.

---

## Deploy

1. `php artisan migrate --force`. Do not `db:seed`.
2. Confirm `modules.version` for `assets` is `1.3.0` and `accounting` is `1.10.0`.
3. Deploy Frontend after production build; hard-refresh SPA. Ship the mobile build.
4. Smoke: create an asset with cost, useful life, and start date → **Post depreciation** → journal lines `6500` / `1550`, and a capitalization journal `1500` / `3000`.
