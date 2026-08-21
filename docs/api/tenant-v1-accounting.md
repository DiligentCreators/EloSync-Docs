# Tenant API v1 — Accounting

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:accounting`, plus `can:accounting.*`.

## Accounts

| Method | Path | Permission |
|--------|------|------------|
| GET | `/accounts` | `accounting.view` |
| GET | `/accounts/stats` | `accounting.view` |
| POST | `/accounts` | `accounting.create` |
| GET | `/accounts/{account}` | `accounting.view` |
| PUT | `/accounts/{account}` | `accounting.update` |
| DELETE | `/accounts/{account}` | `accounting.delete` |
| POST | `/accounts/{account}/restore` | `accounting.restore` |
| DELETE | `/accounts/{account}/force` | `accounting.force.delete` |

Create body: `code`, `name`, `type` (`asset`\|`liability`\|`equity`\|`revenue`\|`expense`), optional `parent_id`, `is_active`, `is_cash_bank` (asset only), `description`.

List query: optional `is_cash_bank=1` for deposit/paid-from pickers. List/show include **`balance`** (posted journals, signed by account normal balance).

Listing auto-seeds the starter chart when the tenant has no accounts. Starter Cash `1000` has `is_cash_bank=true`.

## Journal entries

| Method | Path | Permission |
|--------|------|------------|
| GET | `/journal-entries` | `accounting.view` |
| GET | `/journal-entries/stats` | `accounting.view` |
| POST | `/journal-entries` | `accounting.create` |
| GET | `/journal-entries/{journalEntry}` | `accounting.view` |
| PUT | `/journal-entries/{journalEntry}` | `accounting.update` |
| DELETE | `/journal-entries/{journalEntry}` | `accounting.delete` |
| POST | `/journal-entries/{journalEntry}/restore` | `accounting.restore` |
| DELETE | `/journal-entries/{journalEntry}/force` | `accounting.force.delete` |
| POST | `/journal-entries/{journalEntry}/post` | `accounting.post` |
| POST | `/journal-entries/{journalEntry}/void` | `accounting.void` |

Create/update body: `entry_date`, optional `memo`, `lines[]` with `account_id`, `debit`, `credit`, optional `memo` / `sort_order`. Lines must balance; each line has debit XOR credit. Draft-only edit/delete. Void body optional `void_reason`.

## Account transfers

| Method | Path | Permission |
|--------|------|------------|
| GET | `/account-transfers` | `accounting.view` |
| GET | `/account-transfers/stats` | `accounting.view` |
| POST | `/account-transfers` | `accounting.create` |
| GET | `/account-transfers/{accountTransfer}` | `accounting.view` |
| POST | `/account-transfers/{accountTransfer}/void` | `accounting.void` |

Create body: `from_account_id`, `to_account_id` (distinct active cash/bank accounts), `amount`, `transferred_at`, optional `currency`, `reference`, `memo`. Creates and **posts** a journal (Dr to / Cr from). Status starts `posted`. Void body optional `void_reason` — voids the linked journal.

## General ledger

### GET `/general-ledger`

Permission: `accounting.view`.

Query: `account_id`, `from`, `to`.

Response includes `opening_balance`, `closing_balance`, and `lines` (posted only; void excluded).
