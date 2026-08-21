# Accounting — Production Guide

## Licensing

- Catalog slug: `accounting`
- Category: `finance` (sort `60`), module `sort_order = 10`
- Free Marketplace opt-in (`is_default_included = false`, `is_billable = false`)
- No hard module dependencies

## Bootstrap

1. Run migrations for `accounts`, `journal_entries`, `journal_entry_lines`, `account_transfers`, `account_balance_adjustments`
2. Register module via `register_accounting_module` migration (`DefaultModuleRegistrar`); bump to **1.2.0** for set balance
3. Grant permissions via `add_accounting_permissions` (`TenantPermissionSynchronizer`)
4. Deploy frontend Finance nav (Accounts, Journals, Transfers, General Ledger)

## Deploy checklist

1. Migrate schema + catalog + permissions
2. Confirm `module:accounting` + `accounting.*` on admin/manager/staff maps
3. Smoke: enable Accounting → Accounts shows starter CoA → **Set balance** on Cash → balance updates → void adjustment → create balanced journal → post → GL → void
4. Playwright: `test:e2e:accounting` / `test:e2e:accounting:modules:headed` (when CI has registration enabled)
