# Expense itemized lines (expenses 1.7.0) — Production Readiness

| Field | Value |
|-------|--------|
| **Date** | 2026-10-19 |
| **Status** | **Go for production** — Pest and headed Playwright green |
| **Scope** | Optional itemized expense lines. Header amount and tax are the sums. Pay still posts one journal debit |
| **Catalog** | **expenses 1.6.0 → 1.7.0** |
| **Companion** | [Expenses user guide](/user-guide/expenses) · [CHANGELOG](/changelog/) |

---

## Executive summary

Draft expenses can store up to 50 lines (description, amount, tax, category). The header amount and tax are rewritten from those lines. The header category is set only when every line shares one category; otherwise it is empty and the list, record, and sheet show **Mixed**. Creating without `lines` still stores a single header amount. Purchase-order convert copies each purchase-order line and splits the purchase-order tax across them. Mark as paid still debits one expense account for the gross.

**Go / No-Go:** **Go.** Migrate-only (`expense_lines` plus the catalog bump). Existing expenses stay header-only until the next draft save. Do not `db:seed`.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Header-only create still stores amount and tax with no lines | **Pass** (Pest) |
| Lines recompute totals, clear a mixed category, and replace on update | **Pass** (Pest) |
| Category filter matches a line category | **Pass** (Pest) |
| Pay posts one debit of the gross | **Pass** (Pest) |
| Submitted expenses reject line edits | **Pass** (Pest) |
| Purchase-order convert splits tax across lines | **Pass** (Pest) |
| Catalog **expenses 1.7.0** | **Pass** (Pest) |
| Headed one session: empty title, description, and amount stay on the form; a second line with another category shows Mixed; edit updates the first amount; pay journal shows `6000` / `1000` and `$30.00`; category filter finds the expense; purchase-order convert shows the source line | **Pass** (`npm run test:e2e:expenses:lines:headed`, 1 passed) |
| Headed expenses suite: lines, unpay, create/pay, receipt, and purchase-order convert | **Pass** (5 passed; workflow rerun with `E2E_VIDEO=off` after ffmpeg was unavailable) |

## Audit

Reviewed `ExpenseService` line sync, pay journal, purchase-order convert, web and mobile forms, and the list category badge on 2026-10-19.

The first headed run failed because the local database had not migrated `expense_lines`. After `php artisan migrate`, the same session passed. The list previously showed an empty category for mixed lines; it now shows **Mixed**, matching the record page. Pay remains one journal. Reimbursement beyond paid is still deferred.

---

## Deploy

1. `php artisan migrate --force`. Do not `db:seed`.
2. Confirm `modules.version` for `expenses` is `1.7.0`.
3. Deploy Frontend after production build; hard-refresh SPA. Ship the mobile build with the same API.
