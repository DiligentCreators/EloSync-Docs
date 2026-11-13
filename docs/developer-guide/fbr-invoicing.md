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

## Commands

- `php artisan fbr:sync-hs-uom {path}`
- `php artisan fbr:sync-scenarios {path}`

## Services

- `App\Services\Tenant\Fbr\FbrCredentialService`
- `App\Services\Tenant\Fbr\FbrInvoiceService` — payload build, validate, submit (correct Live/Sandbox URLs)
- `App\Services\Central\Fbr\FbrHsUomCatalogService`

## Tests

`tests/Feature/Tenant/FbrInvoicing/FbrInvoicingModuleTest.php` — entitlement gate, encrypted credentials, catalog read, validate→submit with `Http::fake`, resubmit blocked.

Frontend: `test:e2e:fbr-invoicing`.
