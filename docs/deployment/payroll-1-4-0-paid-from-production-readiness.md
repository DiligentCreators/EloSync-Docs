# Payroll 1.4.0 — Mark Paid Paid-from Bank Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-09-26 (remediation 2026-09-27) |
| **Status** | **Go** — all audit findings closed; migrate + SPA/Mobile before production Mark paid with Accounting |
| **Scope** | Tenant Payroll module `payroll` **1.3.0 → 1.4.0** (Mark paid requires Paid from cash/bank when Accounting entitled; auto-post accrual + payment journals) |
| **Companion** | [Payroll ops](./payroll) · [Phase 7 HR readiness](./hr-phase7-production-readiness) · [Accounting](./accounting) · [User](/user-guide/payroll) · [Developer](/developer-guide/payroll) · [API](/api/tenant-v1-payroll) · [CHANGELOG](/changelog/) |

Additive MINOR on Payroll. No new permissions, queues, scheduler entries, or env vars. Workspaces without Accounting keep status-only Mark paid. Workspaces with Accounting gain a required Paid-from picker and cash/bank balance decrease on pay.

This audit covers **Payroll 1.4.0 paid-from only**. Prior Phase 7 HR readiness remains valid for profiles / approve / pay slips.

---

## Executive summary

When **Accounting** is entitled, **Mark paid** on an approved pay run requires an active cash/bank **Paid from** account. The service:

1. Ensures a **posted** accrual journal (`Dr` Salary Expense `6400` / `Cr` Salaries Payable `2200`) — creates+posts if missing, or posts an existing draft from **Post to journal**.
2. Creates+posts a **payment** journal (`Dr` Salaries Payable / `Cr` paid-from) via `CashMovementJournalService`.
3. Persists `paid_from_account_id`, accrual account FKs, `journal_entry_id`, and `payment_journal_entry_id`.

Optional **Post to journal** still creates a **draft** accrual only. Locked accounting periods are enforced when journals are posted (`JournalEntryService::post` → `assertDateNotLocked`), covered by dedicated Pest.

| Gate | Result |
|------|--------|
| Catalog `1.4.0` migrate-only bump | **Pass** |
| Schema additive + nullable account / payment JE columns | **Pass** |
| FK on `journal_entry_id` + `payment_journal_entry_id` → `journal_entries` | **Pass** |
| Starter CoA `2200` / `6400` (+ `ensureMissingSystemAccounts`) | **Pass** (`6100` remains Rent) |
| Accounting Mark paid requires cash/bank | **Pass** |
| Accrual ensure (missing / draft / posted) | **Pass** |
| Payment JE auto-posted (not draft) | **Pass** |
| Net ≤ 0 Mark paid rejected (Accounting) | **Pass** (Pest) |
| Locked period blocks Mark paid | **Pass** (Pest) |
| Without Accounting: status-only pay | **Pass** |
| Soft dep payroll → accounting (existing) | **Pass** |
| SPA Paid-from dialog (list / peek / view) | **Pass** |
| Mobile Paid-from picker | **Pass** |
| Pest `PayrollTest` (19) | **Pass** (local 2026-09-27) |
| Docs + changelog + this page | **Pass** |
| CatalogSeeder payroll `version` | **Pass** |
| Marketing payroll copy (Paid-from) | **Pass** |

**Go / No-Go:** **Go** after companion CI and `php artisan migrate --force` **before** SPA/Mobile that send `paid_from_account_id`.

---

## Findings

| ID | Severity | Status | Finding | Action |
|----|----------|--------|---------|--------|
| F1 | Medium | **Fixed** | CatalogSeeder payroll row omitted `version` | `'version' => '1.4.0'` on payroll in `CatalogSeeder` |
| F2 | Low | **Fixed** | Plan text said Salary Expense `6100` (already Rent) | Shipped **`6400` Salary Expense**; docs/constants aligned |
| F3 | Low | **Fixed** | No dedicated Pest for locked fiscal period on payroll pay | Added `blocks mark paid when the pay run period end falls in a locked accounting period` |
| F4 | Low | **Fixed** | No Pest for `net <= 0` Mark paid reject | Added `rejects mark paid when accounting is entitled and net total is zero` |
| F5 | Low | **Fixed** | `payment_journal_entry_id` (and legacy `journal_entry_id`) lacked FK | Migration `2026_09_26_190924_…` adds FKs → `journal_entries` `nullOnDelete` |
| F6 | Low | **Fixed** | Marketing payroll blurb omitted Paid-from | Website `lib/constants.ts` copy updated |

### Accepted / intentional (not defects)

| Item | Notes |
|------|-------|
| No new permissions | Reuse `payroll.pay` / `payroll.post` |
| Draft accrual from Post | Cash movement rule: payment JE auto-posts; early accrual may stay draft until Mark paid |
| No WHT / unpay / void reverse | Explicitly out of scope for 1.4.0 |
| Catalog bump ≠ auto-install | Workspaces without Payroll entitlement unchanged |
| Post to journal after paid-with-Accounting | Hidden once `journal_entry_id` is set |

---

## Plan coverage matrix

| Plan item | Result |
|-----------|--------|
| `paid_from` / expense / liability / `payment_journal_entry_id` columns | Pass |
| Starter `2200` + salary expense code | Pass (`6400`) |
| `markPaid` + `CashMovementJournalService` | Pass |
| `PayPayRunRequest` + controller | Pass |
| Resource nested journals / accounts | Pass |
| Catalog **1.3.0 → 1.4.0** | Pass |
| Pest: cash drop / missing paid_from / no accounting / draft→pay | Pass |
| Pest: locked period + net ≤ 0 | Pass |
| Journal entry FKs on pay run | Pass |
| `.ai/rules/tenant.md` cash movements | Pass |
| Frontend dialog list/peek/view + e2e helper | Pass |
| Mobile picker + payload | Pass |
| User / dev / API / accounting docs + CHANGELOG | Pass |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/Payroll/PayrollTest.php` | **19 passed** (local 2026-09-27) | Accounting pay cash drop, missing paid_from 422, no-accounting status-only, draft accrual then pay, net ≤ 0, locked period |
| `tests/Feature/Tenant/Accounting/AccountTest.php` | **7 passed** | Starter CoA; custom `6300` Marketing unaffected by `6400` |
| `npm run test:e2e:payroll` (or module suite) | Required green in CI | `markPayRunPaidFromList` opens Paid-from dialog when Accounting entitled |

---

## Deploy order

1. Companion **CI** green (Backend / Frontend / Docs / Mobile as applicable)
2. **Backend** — `php artisan migrate --force`
   - `2026_09_26_182640_add_payroll_paid_from_and_payment_journal_to_pay_runs_table`
   - `2026_09_26_182643_bump_payroll_module_to_1_4_0`
   - `2026_09_26_190924_add_foreign_keys_to_pay_run_journal_entry_columns`
3. Confirm catalog `payroll` version `1.4.0` (no `db:seed`)
4. Confirm Accounts list backfills `2200` / `6400` via `ensureMissingSystemAccounts` (or first Mark paid / Post)
5. **SPA** then **Mobile** — Paid-from UI must not ship before migrate
6. **Docs** / Website (marketing copy)
7. Staging smoke below before production traffic

Suggested merge: **Backend → Frontend → Mobile → Docs** (+ Website). Do **not** `db:seed`.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Pest `PayrollTest` green in CI (19) | Eng | ☐ |
| 2 | Playwright payroll suite green (Paid-from dialog path) | QA | ☐ |
| 3 | Migrations `182640` + `182643` + `190924` applied | Ops | ☐ |
| 4 | Catalog `payroll` version `1.4.0` | Ops | ☐ |
| 5 | SPA/Mobile deployed **after** migrate | Ops | ☐ |
| 6 | Staging smoke signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → install **Employees**, **Payroll**, **Accounting** (free).
2. Open **Accounts** — confirm Cash `1000`, Salaries Payable `2200`, Salary Expense `6400` (or create cash/bank if needed). Seed cash via Set balance / opening journal so a credit is visible.
3. Create payroll profile + pay run → **Approve**.
4. **Mark paid** without selecting Paid from → expect validation (dialog requires selection / API 422).
5. **Mark paid** with Cash → status Paid; accrual + payment journals **posted**; Cash balance decreases by net total; Salaries Payable nets to zero for that run.
6. Optional path: on another approved run, **Post to journal** first (draft accrual) → **Mark paid** with bank → draft becomes posted + payment JE posted.
7. Workspace **without** Accounting: Mark paid one-click, no journals / no Paid from.
8. Locked fiscal period covering `period_end`: Mark paid fails with period lock validation; pay run stays **approved**.
9. Approved run with net `0.00`: Mark paid with Accounting fails validation; stays approved.

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend / Mobile | Redeploy previous build (Paid-from UI disappears; columns remain) |
| Backend code | Redeploy previous release; leave columns (nullable) |
| Catalog | Optional `bumpVersion('payroll', '1.3.0')` only if ops must show prior Marketplace version — prefer leave `1.4.0` if columns remain |
| Data | Do **not** drop payment/accrual journals already posted without a finance-approved void plan |

---

## Related

- [Payroll production guide](./payroll)
- [Phase 7 HR production readiness](./hr-phase7-production-readiness)
- [Accounting deployment](./accounting)
- [CHANGELOG — Payroll Mark paid → Paid from bank](/changelog/)
