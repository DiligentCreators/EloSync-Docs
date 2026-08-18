# Quotations — Developer Guide

Mirror of the [Opportunities developer guide](/developer-guide/opportunities) (assignee scope, notes, domain timeline), kept leaner: no pipeline/board, no related Contact/Company/Lead FKs beyond the required Opportunity link. Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Quotation.php`, `QuotationLine`, `QuotationNote`, `QuotationActivity` |
| Enums | `QuotationStatusEnum`, `QuotationActivityTypeEnum`, `DocumentDiscountTypeEnum` |
| Support | `app/Support/Billing/DocumentTotalsCalculator.php`, `DocumentDiscountRules.php`, `DocumentHtmlSanitizer.php` |
| PDF | `app/Services/Tenant/QuotationPdfService.php`, `resources/views/quotations/pdf.blade.php` |
| Service | `app/Services/Tenant/QuotationService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/QuotationController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Quotation/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Quotation/*` |
| Policy | `app/Policies/QuotationPolicy.php` |
| Events | `app/Events/Quotation*.php` |
| Subscriber | `app/Listeners/QuotationEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Quotation/QuotationAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableCompanyForOpportunity`, `EligibleOpportunityAssignee` |
| Dependency migration | `database/migrations/2026_07_30_210006_add_quotations_opportunities_dependency.php` (mirrors `2026_07_22_000003_add_meetings_calendar_dependency.php`) |
| Tests | `tests/Feature/Tenant/Quotation/QuotationTest.php`, `tests/Feature/Central/Module/QuotationsModuleDependencyTest.php` |

## Domain notes

- **Hard dependency**: Quotations declares a required `module_dependencies` row on Opportunities — Marketplace install is blocked until Opportunities is entitled (unlike Opportunities' own soft-only related FKs).
- Status machine lives on `QuotationStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → sent → accepted|rejected|expired`. `QuotationService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions, **including re-entering the same status** (e.g. sending an already-sent quotation).
- Content updates (`PUT`) and line sync are **draft-only** via `Quotation::isEditable()`. Assignment remains available after send via `POST …/assign`.
- `POST …/status` maps target status to permissions: `sent` → `quotations.send`, `accepted` → `quotations.accept`, otherwise `quotations.update`.
- `send` / `accept` policies are assignee-scoped (same as `view` / `update`) unless the actor has `quotations.assign` or is superadmin.
- **Send is status-only** — no outbound email delivery; PDF download is available separately via **Download PDF**.
- Line items are fully replaced on create/update (`QuotationService::syncLines()`); `Quotation::recalculateTotals()` delegates to `DocumentTotalsCalculator` for `subtotal` / `discount_total` / `tax_total` / `total` from persisted `QuotationLine` rows plus document `line_discount_type`. Tax is calculated after line discounts.
- Lines use required short `name` plus optional long `body`, optional `product_id` (`LinkableProduct`: Products entitled, `products.view` or superadmin, active non-trashed). Memo `notes` accept sanitized HTML via `DocumentHtmlSanitizer`.
- Shared line discounts use `DocumentDiscountTypeEnum` (`none`, `percent`, `fixed`) on the parent as `line_discount_type`; lines store only `discount_value`. Validation lives in `DocumentDiscountRules`.
- PDF: `GET …/pdf` (`quotations.view`, assignee-scoped, `throttle:quotations-pdf`) renders from `resources/views/quotations/pdf.blade.php` via `QuotationPdfService` — same branded layout as invoices.
- Assignee scoping via `ScopesToAssignee` with `quotations.assign`.
- `quotations.force.delete` is not granted to any default role — owner/superadmin only.
- `contact_id` / `company_id` are optional and validated for module entitlement + assignee scope, same as Opportunities.

## Permissions

```
quotations.view | create | update | delete | restore | force.delete | assign | send | accept
```

Routes use `module:quotations` then `can:quotations.*` / policies.

Catalog: slug `quotations`, category `sales`, `is_default_included = false`, `is_billable = false`, `sort_order = 50`, version **1.3.1**. Registered via `DefaultModuleRegistrar` migration (migrate-only); 1.3.0 added optional product line picker; 1.3.1 hardens linking + sanitizer.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-quotations.md](/api/tenant-v1-quotations).

## Frontend

SPA should mirror **Opportunities** (table + form dialog, detail sheet) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path (expected) |
|-------|-----------------|
| Page | `src/pages/quotations/` |
| Form / detail | form dialog + detail sheet (Overview, Lines, Notes, Activity) — shared `DocumentLinesEditor`, `DocumentTotalsPanel`, `RichTextEditor` for memo notes |
| Service | `quotationService` in `src/api/services.ts` |
| Nav | `permission: quotations.view`, `module: 'quotations'` (Sales) |
| Playwright | `e2e/pages/quotations.page.ts`, `e2e/tests/quotations/`, `npm run test:e2e:quotations` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Quotation/QuotationTest.php tests/Feature/Central/Module/QuotationsModuleDependencyTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:quotations
```

## Logging

- Spatie `LogsActivity` on `Quotation` (log name `quotations`)
- Domain `quotation_activities` timeline
- `PlatformAuditService` via `QuotationEventSubscriber`
