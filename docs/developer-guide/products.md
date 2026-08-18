# Products — Developer Guide

Products is the Phase 5 catalog module. It follows the Leads-style module layout: tenant model, form requests, resources, policy, service, events/subscriber, activity logging, frontend list/form/detail UI, and Playwright coverage.

## Backend

| Piece | Path |
|-------|------|
| Models | `Product`, `ProductCategory`, `ProductNote`, `ProductActivity` |
| Service | `app/Services/Tenant/ProductService.php` |
| HTTP | `ProductController`, `ProductCategoryController`, `app/Http/Requests/Tenant/Api/V1/Product*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Product*` |
| Authorization | `ProductPolicy`, `ProductCategoryPolicy` |
| Tests | `tests/Feature/Tenant/Product/` |

Products is gated by `module:products` and `products.view|create|update|delete|restore|force.delete`. Category CRUD uses the same permissions.

## Domain rules

- `sku` is unique per tenant; category is nullable and is nullified if removed.
- On create, `sku` may be omitted or blank — `ProductService` assigns the next SKU (`products_sku_prefix` tenant setting, default `SKU-`, plus a 5-digit sequence including soft-deleted rows) and retries on unique collisions. Clients may override with an explicit SKU. `GET /products/next-sku` previews the next value for the SPA.
- Product `description` accepts sanitized HTML (same allowlist as billing document notes; `style` stripped, `javascript:` / `data:` hrefs neutralized); empty HTML is stored as `null`.
- There is no separate product/service type. Services are catalog rows with `track_stock = false`.
- `track_stock` controls whether `StockService` can mutate a product's stock.
- Product notes and `product_activities` provide the domain timeline; the model also uses Spatie `LogsActivity`.
- `product_id` on `purchase_order_lines` and billing document lines (`quotation_lines`, `estimate_lines`, `customer_invoice_lines`) is nullable and validated by `LinkableProduct` when supplied: Products module entitled, actor has `products.view` (or superadmin), product is active and not soft-deleted, same tenant.
- Billing SPA line pickers (and purchase-order picker) gate on Products + `products.view`, list **active** products with server search, auto-fill line text on select, and leave edited fields intact when clearing the link. Convert estimate → invoice and recurring invoice generation copy `product_id`.

Catalog: slug `products`, version **1.2.0** (auto SKU + HTML description + link hardening).

## Frontend and verification

Pages are in `src/pages/products/`; service/types/query keys/permissions live in the shared API, type, constants, and navigation layers. The route and nav item use `module:products` plus `products.view`. Currency uses shared `currencyOptions()` / `SearchableSelect` and defaults to tenant `settings.currency` on create.

Run:

```bash
php artisan test --compact tests/Feature/Tenant/Product
npm run test:e2e:products
```
