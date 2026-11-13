# FBR Invoicing — Developer Guide

Slug: `fbr-invoicing` · Catalog version **1.0.0** · Free Marketplace opt-in.

## Dependencies

| Dependency | Nature |
|------------|--------|
| `invoices` | Required hard |
| `products` | Required hard |
| `companies` | Optional soft |
| `contacts` | Optional soft |

## Permissions

`fbr-invoicing.view`, `configure`, `validate`, `submit` — granted to admin/manager defaults via data migration.

## Data model

| Table | Scope |
|-------|--------|
| `fbr_hs_uoms` | Central shared (no `tenant_id`) |
| `fbr_registration_scenarios` | Central shared |
| `fbr_workspace_credentials` | Tenant (encrypted tokens) |
| `product_fbr_profiles` | Tenant |
| `fbr_invoice_submissions` | Tenant audit log |
| `customer_invoices.fbr_*` | Validated flag, FBR number, timestamps, last error |
| Companies/Contacts FBR buyer columns | Additive |

## Tenant API

Prefix `/api/tenant/v1/fbr-invoicing` · middleware `module:fbr-invoicing`:

- `GET/PUT credentials`
- `GET hs-codes`, `GET hs-uoms`, `GET scenarios`
- `GET/PUT products/{product}/profile`
- `POST invoices/{customerInvoice}/validate`
- `POST invoices/{customerInvoice}/submit`

## Central API

`/api/central/v1/fbr-catalog/*` — HS/UoM CRUD + CSV import, scenarios list/store/import.

| Action | Permission |
|--------|------------|
| List HS/UoM + scenarios | `modules.list` |
| Create/update/delete/import | `modules.update` |

No starter seed data — operators create or import all rows.

## Central SPA

Route: `/{centralPrefix}/fbr-catalog` (nav: **Catalog → FBR Catalog**). Upload dialogs call `POST .../hs-uoms/import` and `POST .../scenarios/import` with a 180s axios timeout.

## Commands

- `php artisan fbr:sync-hs-uom {path}` — CSV upsert; empty `unit_name` → `Others`; leading zeros kept; rejoins broken description fields
- `php artisan fbr:sync-scenarios {path}`

## Services

- `App\Services\Tenant\Fbr\FbrCredentialService`
- `App\Services\Tenant\Fbr\FbrInvoiceService` — payload build, validate, submit (correct Live/Sandbox URLs)
- `App\Services\Central\Fbr\FbrHsUomCatalogService` — `DEFAULT_UNIT_NAME = Others`; `description` column is `TEXT`

## Tests

`tests/Feature/Tenant/FbrInvoicing/FbrInvoicingModuleTest.php` — entitlement gate, encrypted credentials, catalog read, validate→submit with `Http::fake`, resubmit blocked.

`tests/Feature/FbrHsUomCatalogSyncTest.php` — CSV sync: leading zeros, empty unit default, long/broken descriptions.

`tests/Feature/Central/Fbr/FbrCatalogImportTest.php` — Central multipart import + permission gate.

Frontend: `test:e2e:fbr-invoicing`.
