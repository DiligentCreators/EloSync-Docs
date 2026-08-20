# Estimates — Developer Guide

Mirror of the [Credit Notes developer guide](/developer-guide/credit-notes) (assignee scope, notes, domain timeline, hard dependency on Invoices, first-class `lines` child table), plus a **convert-to-invoice** action modeled after Quotations' status machine. Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Estimate.php`, `EstimateLine`, `EstimateNote`, `EstimateActivity` |
| Enums | `EstimateStatusEnum`, `EstimateActivityTypeEnum`, `DocumentDiscountTypeEnum` |
| Support | `app/Support/Billing/DocumentTotalsCalculator.php`, `DocumentDiscountRules.php`, `DocumentHtmlSanitizer.php` |
| PDF | `app/Services/Tenant/EstimatePdfService.php`, `resources/views/estimates/pdf.blade.php` |
| Service | `app/Services/Tenant/EstimateService.php` (+ `ScopesToAssignee`, injects `CustomerInvoiceService` for conversion) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/EstimateController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Estimate/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Estimate/*` |
| Policy | `app/Policies/EstimatePolicy.php` |
| Events | `app/Events/Estimate*.php` (including `EstimateConverted`) |
| Subscriber | `app/Listeners/EstimateEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Estimate/EstimateAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableCompany` — `quotation_id`/`opportunity_id` are plain tenant-scoped `Rule::exists()` on `Quotation`/`Opportunity` |
| Dependency migration | `database/migrations/2026_07_31_223006_add_estimates_invoices_dependency.php` (mirrors credit-notes → invoices) |
| Cross-module FK | `database/migrations/2026_07_31_223007_add_estimate_foreign_key_to_customer_invoices_table.php` adds the `customer_invoices.estimate_id` foreign key (the column itself already existed nullable from the Invoices migration) |
| Factories | `EstimateFactory`, `EstimateLineFactory`, `EstimateNoteFactory`, `EstimateActivityFactory` |
| Tests | `tests/Feature/Tenant/Estimate/EstimateTest.php`, `tests/Feature/Central/Module/EstimatesModuleDependencyTest.php` |

## Domain notes

- **Hard dependency**: Estimates declares a required `module_dependencies` row on Invoices — Marketplace install is blocked until Invoices is entitled, same pattern as Payments/Credit Notes → Invoices.
- Status machine lives on `EstimateStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → sent → accepted|rejected|expired` (identical shape to `QuotationStatusEnum`). `EstimateService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions, **including re-entering the same status**.
- `send()` backfills `issue_date` to today if it wasn't already set, then transitions `draft → sent`.
- Content updates (`PUT`) and line sync are **draft-only** via `Estimate::isEditable()` (`status === draft`). Assignment remains available after send via `POST …/assign`.
- `POST …/status` route middleware requires `estimates.update`; the controller then re-checks the specific gate per target status (`sent` → `send`, `accepted` → `accept`, otherwise `update`) before delegating to `EstimateService::changeStatus()`.
- `send` / `accept` / `convert` policies are assignee-scoped (same as `view` / `update`) unless the actor has `estimates.assign` or is superadmin.
- **`convertToInvoice()`** (`EstimateService`):
  1. Rejects if a `CustomerInvoice` already has this `estimate_id` (including soft-deleted ones) — an estimate converts **at most once**.
  2. Rejects unless `Estimate::isConvertible()` (`status` is `sent` or `accepted`).
  3. Rejects if `quotation_id` is set and `QuotationInvoiceGuard::alreadyInvoiced()` — the linked quotation already produced an invoice.
  4. Inside a DB transaction: copies `title`, `notes`, `terms_and_conditions`, `currency`, `line_discount_type`, `contact_id`, `company_id`, `quotation_id`, `assigned_to`, and a mapped copy of every `EstimateLine` (`product_id`, `name`, `body`, `discount_value`, quantities/prices/tax) into `CustomerInvoiceService::create()`, producing a **draft** invoice; sets `invoice->estimate_id` and saves.
  5. Transitions the estimate to `accepted` if it wasn't already (reuses `transitionStatus()`).
  6. Records a `converted` activity on the estimate and fires `EstimateConverted($estimate, $invoice, $actor)`.
  7. Returns the created `CustomerInvoice` (loaded with its own relations) — the controller renders it via `CustomerInvoiceResource`, not an Estimate resource.
- Lines are a first-class child table (`estimate_lines`), not embedded JSON — each row is `{ product_id?, name, body?, quantity, unit_price, tax_rate, sort_order, discount_value }`. Parent stores shared `line_discount_type`. `subtotal`/`discount_total`/`tax_total`/`total` are recomputed server-side via `DocumentTotalsCalculator` on create/update. Tax is calculated after line discounts.
- Shared line discounts use `DocumentDiscountTypeEnum` with validation in `DocumentDiscountRules`. Lines support optional `product_id` via `LinkableProduct` (Products entitled, `products.view` or superadmin, active non-trashed product). Memo `notes` / terms / bodies accept sanitized HTML via `DocumentHtmlSanitizer`.
- PDF: `GET …/pdf` (`estimates.view`, assignee-scoped, `throttle:estimates-pdf`) renders from `resources/views/estimates/pdf.blade.php` via `EstimatePdfService` — same branded layout as invoices. Totals are right-aligned; Notes / Terms are full-width blocks below so Dompdf paginates long HTML. Line-item body HTML is a block-level `.line-body` under each short pricing row.
- Assignee scoping via `ScopesToAssignee` with `estimates.assign`.
- `estimates.force.delete` is not granted to any default role — owner/superadmin only.
- `contact_id` / `company_id` are optional and validated for module entitlement + assignee scope (`LinkableContact` / `LinkableCompany`). `opportunity_id` / `quotation_id` are optional, tenant-scoped `exists()` checks (a quotation belongs to an opportunity, but the estimate doesn't enforce that the two match).
- Auto-numbering: `EstimateService::nextNumber()` reads the `estimates_number_prefix` tenant setting (default `EST-`), then zero-pads a running count to 5 digits — same pattern as Invoices/Payments/Credit Notes. Not yet exposed in the Tenant Settings UI. `estimates` has a `unique(tenant_id, number)` DB index; `create()` retries up to 3 times via the shared `RetriesOnDuplicateNumber` trait on a duplicate-key collision.

## Permissions

```
estimates.view | create | update | delete | restore | force.delete | assign | send | accept | convert
```

Routes use `module:estimates` then `can:estimates.*` / policies.

Catalog: slug `estimates`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 40`, version **1.4.2**. Registered via `DefaultModuleRegistrar` migration (migrate-only), with a follow-up migration inserting the `module_dependencies` row on `invoices`. 1.3.0 added optional product line picker; 1.3.1 hardens `LinkableProduct` + sanitizer; 1.3.2 blocks convert when the linked quotation is already invoiced; 1.3.3 adds soft Invoices entitlement check, `lockForUpdate`, unique `estimate_id`, and soft-delete recovery messaging; 1.4.0 dedicated record pages; 1.4.1 PDF long-notes pagination; 1.4.2 PDF long line-body pagination.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-estimates.md](/api/tenant-v1-estimates).

## Frontend

SPA mirrors **Invoices**/**Quotations** (table + create/edit page, record page) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path |
|-------|------|
| Page | `src/pages/estimates/` (`estimates-page.tsx`, `estimate-form-dialog.tsx`, `estimate-detail-sheet.tsx`) |
| Detail sheet | Overview, linked contact/company/opportunity/quotation/converted invoice, line items, notes, timeline — actions: assign, add note, send, accept, reject, **convert to invoice**, edit (draft only), delete |
| Form dialog | Title, currency, valid-until, rich-text notes, contact/company pickers, opportunity picker (quotation picker filtered by the selected opportunity), and shared `DocumentLinesEditor` + `DocumentTotalsPanel` with live subtotal/discount/tax/total preview |
| Service | `estimateService` in `src/api/services.ts` |
| Types | `Estimate*` in `src/types/api.ts` |
| Query keys | `QUERY_KEYS.estimates` / `estimate(id)` / `estimateTimeline(id)` / `estimateStats` |
| Permissions | `PERMISSIONS.estimates.*` (maps to `estimates.*` permission strings) |
| Nav | **Billing** sidebar group, after Credit Notes — `permission: PERMISSIONS.estimates.view`, `module: 'estimates'` |
| Route | `tenantRoutes.estimates = '/estimates'`, lazy-loaded in `App.tsx` behind `RequireAccess module="estimates"` |
| Notifications | `src/notifications/modules/estimates.ts` — `estimate.assigned` → `/estimates?estimate={id}` |
| Playwright | `e2e/pages/estimates.page.ts`, `e2e/tests/estimates/`, `npm run test:e2e:estimates` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Estimate/EstimateTest.php tests/Feature/Central/Module/EstimatesModuleDependencyTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:estimates
```

## Logging

- Spatie `LogsActivity` on `Estimate` (log name `estimates`)
- Domain `estimate_activities` timeline
- `PlatformAuditService` via `EstimateEventSubscriber`
