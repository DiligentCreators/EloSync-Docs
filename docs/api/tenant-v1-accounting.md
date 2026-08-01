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

Create body: `code`, `name`, `type` (`asset`\|`liability`\|`equity`\|`revenue`\|`expense`), optional `parent_id`, `is_active`, `description`.

Listing auto-seeds the starter chart when the tenant has no accounts.

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

## General ledger

### GET `/general-ledger`

Permission: `accounting.view`.

Query: `account_id`, `from`, `to`.

Response includes `opening_balance`, `closing_balance`, and `lines` (posted only; void excluded).
