# Invoices — Developer Guide

Mirror of the [Quotations developer guide](/developer-guide/quotations) (assignee scope, notes, domain timeline, line items), kept module-standalone: **no required FK / hard dependency**, unlike Quotations/Contracts which require Opportunities.

> **Naming:** the backend model is `CustomerInvoice` (table `customer_invoices`) — Central's own platform-billing `Invoice` model already exists for subscription invoices the platform sends *to* tenants. Frontend mirrors this with `customerInvoiceService` / `PERMISSIONS.customerInvoices` / `QUERY_KEYS.customerInvoices`, distinct from the pre-existing `invoiceService` / `PERMISSIONS.invoices`.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/CustomerInvoice.php`, `CustomerInvoiceLine`, `CustomerInvoiceNote`, `CustomerInvoiceActivity` |
| Enums | `CustomerInvoiceStatusEnum`, `CustomerInvoiceActivityTypeEnum`, `CustomerInvoiceRecurrenceFrequencyEnum`, `CustomerInvoiceRecurrenceStatusEnum`, `DocumentDiscountTypeEnum` |
| Support | `app/Support/Billing/DocumentTotalsCalculator.php`, `DocumentDiscountRules.php`, `DocumentHtmlSanitizer.php`, `BrandedDocumentPdfContext.php` |
| Service | `app/Services/Tenant/CustomerInvoiceService.php` (+ `ScopesToAssignee`) |
| PDF | `app/Services/Tenant/CustomerInvoicePdfService.php`, `resources/views/invoices/pdf.blade.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/CustomerInvoiceController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/CustomerInvoice/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/CustomerInvoice/*` |
| Policy | `app/Policies/CustomerInvoicePolicy.php` |
| Events | `app/Events/CustomerInvoice*.php` |
| Subscriber | `app/Listeners/CustomerInvoiceEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/CustomerInvoice/CustomerInvoiceAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableCompany`, `LinkableReseller`, `EligibleInvoiceAssignee` — `quotation_id` is a plain tenant-scoped `Rule::exists()`, **not** gated by a `LinkableQuotation`-style entitlement rule; `reseller_id` requires Resellers entitlement + assignee scope via `LinkableReseller` |
| Tests | `tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceTest.php`, `CustomerInvoiceRecurrenceTest.php` |

## Domain notes

- **No hard dependency**: Invoices does **not** declare a `module_dependencies` row on Opportunities (unlike Quotations/Contracts) — it installs standalone from Marketplace.
- Status machine lives on `CustomerInvoiceStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → unpaid|cancelled`, `unpaid → cancelled|paid`, `paid`/`cancelled` are terminal. `paid` is set programmatically by [Payments](/developer-guide/payments) posting/voiding or [Credit Notes](/developer-guide/credit-notes) applying, via `CustomerInvoice::applyBalanceStatus()` / `recalculateBalanceFromAmounts()` — partial settlement keeps `unpaid`. This API only exposes user-driven `send` / `void` (cancel) / `status`.
- **`Unpaid → Cancelled` requires a zero ledger** — `CustomerInvoiceService::void()` is the enforcement point (not just the enum): it throws `ValidationException` (422, `status`, naming the invoice number) if `amount_paid > 0` (void the payments first) or `amount_credited > 0` (applied credits can never be reversed). `CustomerInvoice::isVoidable()` mirrors this (Draft/Unpaid only, both amounts zero). `changeStatus()` (used by `POST …/status`) routes a `cancelled` target through `void()` rather than calling `transitionStatus()` directly, so both entry points share the same ledger guard.
- `CustomerInvoiceService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions.
- Content updates (`PUT`) and line sync are **draft-only** via `CustomerInvoice::isEditable()` (`status === draft`). Assignment remains available after send via `POST …/assign`.
- `POST …/status` (`changeStatus`) maps target status to permissions in the controller: `unpaid` → `invoices.send`, `cancelled` → `invoices.void`, otherwise `invoices.update`. The form request itself only requires `invoices.update`; the controller's `Gate::authorize()` call adds the stricter check per target status.
- `send` / `void` / `view` / `update` policies are assignee-scoped (same pattern) unless the actor has `invoices.assign` or is superadmin.
- `send()` backfills `issue_date` to today if unset, then transitions to `sent`. If the invoice is a recurring **series root**, this also sets `recurrence_status=active`. **`recurrence_next_issue_on`** is the date the operator chose on the draft (required when recurring); Send keeps it when it is after the issue date, otherwise it falls back to one frequency step from the issue date. **Status-only** — no outbound email delivery.
- Recurring series live on `customer_invoices` (`is_recurring`, `recurrence_frequency`, `recurrence_status`, `recurrence_next_issue_on`, `recurrence_ends_on`, `recurrence_due_days`, `recurring_source_invoice_id`). The original invoice is the template. `invoices:generate-recurring` (daily) clones **draft** occurrences from the root’s current lines; children are not themselves recurring. `POST …/recurrence/stop` ends the series (`ended`) and optionally voids the latest unpaid generated invoice (`void_latest_unpaid`). Voiding the root also ends an active series.
- Generator: `chunkById` over due series roots, per-series `try/catch`, `withTrashed()` uniqueness for `(tenant, source, issue_date)`, catch-up cap (`config('invoices.recurring_catchup_cap')`, default 52) and per-tenant time budget. Command returns `FAILURE` if any entitled tenant had a failed series. Remaining due periods run on the next daily tick.
- PDF: `GET …/pdf` (`invoices.view`, assignee-scoped, `throttle:invoices-pdf`) renders a Dompdf document from `resources/views/invoices/pdf.blade.php` via `CustomerInvoicePdfService` on the fly (no stored `pdf_path`). Layout uses workspace `button_color`, embedded logo (base64 from branding disk), and invoice settings (`company_*`, `invoice_bank_*`, `invoice_payment_terms`, `invoice_default_notes`). Includes discount rows when `discount_total > 0`, sanitized memo HTML, and a **Payments received** table for posted payment allocations. Shows a **Partial** chip when unpaid with partial payments. Cached (base64) by id + `updated_at` + settings fingerprint so database/Redis JSON stores stay valid UTF-8 and branding edits invalidate the cache. `send()` dispatches `WarmCustomerInvoicePdfJob` on the default queue.
- Line items are fully replaced on create/update (`CustomerInvoiceService::syncLines()`); `CustomerInvoice::recalculateTotals()` delegates to `DocumentTotalsCalculator` for `subtotal` / `discount_total` / `tax_total` / `total` from persisted `CustomerInvoiceLine` rows plus document `line_discount_type`. Tax is calculated after line discounts. `balance_due` is then derived from `total - amount_paid - amount_credited` via `recalculateBalanceFromAmounts()`, called by [Payments](/developer-guide/payments) on post/void and by [Credit Notes](/developer-guide/credit-notes) on apply.
- Shared line discounts use `DocumentDiscountTypeEnum` (`none`, `percent`, `fixed`) on the parent as `line_discount_type`; lines store `name`, optional `body`, and `discount_value`. Validation in `DocumentDiscountRules`. Memo `notes` accept sanitized HTML via `DocumentHtmlSanitizer`.
- **Partial** is UI-only: the SPA shows a Partial badge when `status === unpaid`, `amount_paid > 0`, and `balance_due > 0`. The API has no `partial` status — partial settlement keeps `unpaid` until the balance clears.
- Assignee scoping via `ScopesToAssignee` with `invoices.assign`.
- `invoices.force.delete` is not granted to any default role — owner/superadmin only.
- `contact_id` / `company_id` are optional and validated for module entitlement + assignee scope (`LinkableContact` / `LinkableCompany`), same as Quotations/Opportunities. `quotation_id` is optional and only existence/tenant-checked — a tenant can link any of its own quotations even if Quotations is not currently entitled (no soft-entitlement guard, unlike Contracts → Quotations).
- Auto-numbering: `CustomerInvoiceService::nextNumber()` reads the `invoices_number_prefix` tenant setting (default `INV-`), then zero-pads a running count (`CustomerInvoice::withTrashed()->count() + 1`) to 5 digits. `customer_invoices` has a `unique(tenant_id, number)` DB index; `create()` wraps the insert with the shared `RetriesOnDuplicateNumber` trait (`app/Services/Tenant/Concerns/RetriesOnDuplicateNumber.php`), retrying up to 3 times with a freshly generated number if two concurrent requests race to the same count-derived sequence. The same trait/index pattern is used by Payments, Credit Notes, and Estimates.
- Overdue definition (shared by list `overdue=true` filter and `stats.overdue`): `due_date < today`, `status` = `unpaid`, `balance_due > 0`.

## Permissions

```
invoices.view | create | update | delete | restore | force.delete | assign | send | void
```

Routes use `module:invoices` then `can:invoices.*` / policies.

Catalog: slug `invoices`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`, version **1.4.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only); 1.4.0 bumped with HTML line details and terms & conditions.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-invoices.md](/api/tenant-v1-invoices).

## Frontend

SPA mirrors **Quotations** (table + form dialog, detail sheet) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path |
|-------|------|
| Page | `src/pages/invoices/` (`invoices-page.tsx`, `invoice-form-dialog.tsx`, `invoice-detail-sheet.tsx`) |
| Detail sheet tabs | Overview, Lines, Notes, Timeline — actions: download PDF, stop recurring (active series root), assign, add note, send, cancel (`/void`), edit (draft only), delete. No **accept** action (Invoices has no `accepted` status). List/detail show **Partial** badge (display-only) when unpaid with partial payments. |
| Shared billing UI | `src/components/billing/document-lines-editor.tsx`, `document-totals-panel.tsx`, `src/components/common/rich-text-editor.tsx`, `src/lib/billing/document-totals.ts`, `src/lib/sanitize-html.ts` |
| Service | `customerInvoiceService` in `src/api/services.ts` |
| Types | `CustomerInvoice*` in `src/types/api.ts` (kept distinct from the pre-existing Central `Invoice*` types) |
| Query keys | `QUERY_KEYS.customerInvoices` / `customerInvoice(id)` / `customerInvoiceTimeline(id)` / `customerInvoiceStats` |
| Permissions | `PERMISSIONS.customerInvoices.*` (maps to `invoices.*` permission strings) |
| Nav | New **Billing** sidebar group (after Sales) — `permission: PERMISSIONS.customerInvoices.view`, `module: 'invoices'`. Kept separate from the Central Billing nav. |
| Route | `tenantRoutes.invoices = '/invoices'`, lazy-loaded in `App.tsx` behind `RequireAccess module="invoices"` |
| Notifications | `src/notifications/modules/invoices.ts` — `customer_invoice.assigned` → `/invoices?invoice={id}` |
| Playwright | One shared login, headed human workflow: validation, CRUD, Overview memo + activity notes/timeline, PDF, send/void, recurring generate + stop with optional void, shortcuts, trash. `e2e/pages/invoices.page.ts`, `e2e/tests/invoices/`, `npm run test:e2e:invoices` / `test:e2e:invoices:headed` |

Production readiness: [Invoices 1.1.0](/deployment/invoices-production-readiness).

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceTest.php tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceRecurrenceTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:invoices
```

## Logging

- Spatie `LogsActivity` on `CustomerInvoice` (log name `customer_invoices`)
- Domain `customer_invoice_activities` timeline
- `PlatformAuditService` via `CustomerInvoiceEventSubscriber`
- Recurring generate: `invoices.generate-recurring.series_failed`, `tenant_failed`, `time_budget_reached`
- PDF: `invoices.pdf.rendered`, `invoices.pdf.warm_failed`
