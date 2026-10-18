# Expense unpay (expenses 1.6.0) — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-10-19 |
| **Status** | **Go for production** — Pest and headed Playwright green |
| **Scope** | Undo a paid expense back to approved, and void its payment journal when Accounting is installed |
| **Catalog** | **expenses 1.5.0 → 1.6.0** |
| **Companion** | [Expenses user guide](/user-guide/expenses) · [Accounting](/user-guide/accounting) · [CHANGELOG](/changelog/) |

---

## Executive summary

**Undo payment** (`expenses.pay`) returns a paid expense to approved and clears the paid-from and expense account links. When Accounting is entitled, the payment journal is voided in the same transaction, including a withholding line, so cash and withholding payable return to their pre-payment balances. A later Mark as paid posts a new journal. A locked fiscal period rejects the undo and leaves the expense paid. Without Accounting, only the status changes.

**Go / No-Go:** **Go.** Migrate-only catalog bump. Existing paid expenses stay paid until someone undoes them.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Unpay voids the journal, including withholding, and restores cash | **Pass** (Pest) |
| Second unpay is rejected; a later pay posts a new journal | **Pass** (Pest) |
| Locked period leaves status paid and the journal posted | **Pass** (Pest) |
| Without Accounting, status returns to approved and no journal is written | **Pass** (Pest) |
| Catalog **expenses 1.6.0** | **Pass** (Pest) |
| Headed one session: empty title, category, and amount stay on the create form; pay dialog cancel stays approved; posted journal shows `6000` / `1000`; undo cancel stays paid; undo clears Paid from and the journal link; the voided journal shows `void`; a second pay uses a new journal number and undo returns to approved | **Pass** (`npm run test:e2e:expenses:unpay:headed`, 1 passed) |

## Audit

Reviewed `ExpenseService::unpay`, the status and Ask EloSync authorization for paid → approved, the web confirm, and the mobile confirm on 2026-10-19. The headed session found no product defect. Create still requires a category, so the session adds one before submit. The payment journal void is visible on the journal as `void`, and paying again posts a different journal. A locked period is covered in Pest and rolls the status change back with the journal.

---

## Deploy

1. `php artisan migrate --force`. Do not `db:seed`.
2. Confirm `modules.version` for `expenses` is `1.6.0`.
3. Deploy Frontend after production build; hard-refresh SPA. Ship the mobile build with the same API.
