# Invoices — Developer Guide

Mirror of the [Quotations developer guide](/developer-guide/quotations) (assignee scope, notes, domain timeline, line items), kept module-standalone: **no required FK / hard dependency**, unlike Quotations/Contracts which require Opportunities.

> **Naming:** the backend model is `CustomerInvoice` (table `customer_invoices`) — Central's own platform-billing `Invoice` model already exists for subscription invoices the platform sends *to* tenants. Frontend mirrors this with `customerInvoiceService` / `PERMISSIONS.customerInvoices` / `QUERY_KEYS.customerInvoices`, distinct from the pre-existing `invoiceService` / `PERMISSIONS.invoices`.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/CustomerInvoice.php`, `CustomerInvoiceLine`, `CustomerInvoiceNote`, `CustomerInvoiceActivity` |
| Enums | `CustomerInvoiceStatusEnum`, `CustomerInvoiceActivityTypeEnum` |
| Service | `app/Services/Tenant/CustomerInvoiceService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/CustomerInvoiceController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/CustomerInvoice/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/CustomerInvoice/*` |
| Policy | `app/Policies/CustomerInvoicePolicy.php` |
| Events | `app/Events/CustomerInvoice*.php` |
| Subscriber | `app/Listeners/CustomerInvoiceEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/CustomerInvoice/CustomerInvoiceAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableCompany`, `LinkableReseller`, `EligibleInvoiceAssignee` — `quotation_id` is a plain tenant-scoped `Rule::exists()`, **not** gated by a `LinkableQuotation`-style entitlement rule; `reseller_id` requires Resellers entitlement + assignee scope via `LinkableReseller` |
| Tests | `tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceTest.php` |

## Domain notes

- **No hard dependency**: Invoices does **not** declare a `module_dependencies` row on Opportunities (unlike Quotations/Contracts) — it installs standalone from Marketplace.
- Status machine lives on `CustomerInvoiceStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → sent|void`, `sent → void|partial|paid`, `partial → paid` only, `paid`/`void` are terminal. `partial`/`paid` are set programmatically by [Payments](/developer-guide/payments) posting/voiding or [Credit Notes](/developer-guide/credit-notes) applying, via `CustomerInvoice::applyBalanceStatus()` / `recalculateBalanceFromAmounts()` — this API only exposes user-driven `send` / `void` / `status`.
- **`Partial → Void` is deliberately not an allowed transition** — an invoice only reaches `partial` once `amount_paid` and/or `amount_credited` is non-zero, and `CustomerInvoiceService::void()` is the enforcement point (not just the enum): it throws `ValidationException` (422, `status`, naming the invoice number) if `amount_paid > 0` (void the payments first) or `amount_credited > 0` (applied credits can never be reversed). `CustomerInvoice::isVoidable()` mirrors this (Draft/Sent only, both amounts zero). `changeStatus()` (used by `POST …/status`) routes a `void` target through `void()` rather than calling `transitionStatus()` directly, so both entry points share the same ledger guard.
- `CustomerInvoiceService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions.
- Content updates (`PUT`) and line sync are **draft-only** via `CustomerInvoice::isEditable()` (`status === draft`). Assignment remains available after send via `POST …/assign`.
- `POST …/status` (`changeStatus`) maps target status to permissions in the controller: `sent` → `invoices.send`, `void` → `invoices.void`, otherwise `invoices.update`. The form request itself only requires `invoices.update`; the controller's `Gate::authorize()` call adds the stricter check per target status.
- `send` / `void` / `view` / `update` policies are assignee-scoped (same pattern) unless the actor has `invoices.assign` or is superadmin.
- `send()` backfills `issue_date` to today if unset, then transitions to `sent`. **Status-only** — no outbound email/PDF delivery in this phase.
- Line items are fully replaced on create/update (`CustomerInvoiceService::syncLines()`); `CustomerInvoice::recalculateTotals()` derives `subtotal` / `tax_total` / `total` from persisted `CustomerInvoiceLine` rows. `balance_due` is then derived from `total - amount_paid - amount_credited` via `recalculateBalanceFromAmounts()`, called by [Payments](/developer-guide/payments) on post/void and by [Credit Notes](/developer-guide/credit-notes) on apply.
- Assignee scoping via `ScopesToAssignee` with `invoices.assign`.
- `invoices.force.delete` is not granted to any default role — owner/superadmin only.
- `contact_id` / `company_id` are optional and validated for module entitlement + assignee scope (`LinkableContact` / `LinkableCompany`), same as Quotations/Opportunities. `quotation_id` is optional and only existence/tenant-checked — a tenant can link any of its own quotations even if Quotations is not currently entitled (no soft-entitlement guard, unlike Contracts → Quotations).
- Auto-numbering: `CustomerInvoiceService::nextNumber()` reads the `invoices_number_prefix` tenant setting (default `INV-`), then zero-pads a running count (`CustomerInvoice::withTrashed()->count() + 1`) to 5 digits. `customer_invoices` has a `unique(tenant_id, number)` DB index; `create()` wraps the insert with the shared `RetriesOnDuplicateNumber` trait (`app/Services/Tenant/Concerns/RetriesOnDuplicateNumber.php`), retrying up to 3 times with a freshly generated number if two concurrent requests race to the same count-derived sequence. The same trait/index pattern is used by Payments, Credit Notes, and Estimates.
- Overdue definition (shared by list `overdue=true` filter and `stats.overdue`): `due_date < today`, `status` in `sent`/`partial`, `balance_due > 0`.

## Permissions

```
invoices.view | create | update | delete | restore | force.delete | assign | send | void
```

Routes use `module:invoices` then `can:invoices.*` / policies.

Catalog: slug `invoices`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 10`. Registered via `DefaultModuleRegistrar` migration (migrate-only).

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-invoices.md](/api/tenant-v1-invoices).

## Frontend

SPA mirrors **Quotations** (table + form dialog, detail sheet) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path |
|-------|------|
| Page | `src/pages/invoices/` (`invoices-page.tsx`, `invoice-form-dialog.tsx`, `invoice-detail-sheet.tsx`) |
| Detail sheet tabs | Overview, Lines, Notes, Timeline — actions: assign, add note, send, void, edit (draft only), delete. No **accept** action (Invoices has no `accepted` status). |
| Service | `customerInvoiceService` in `src/api/services.ts` |
| Types | `CustomerInvoice*` in `src/types/api.ts` (kept distinct from the pre-existing Central `Invoice*` types) |
| Query keys | `QUERY_KEYS.customerInvoices` / `customerInvoice(id)` / `customerInvoiceTimeline(id)` / `customerInvoiceStats` |
| Permissions | `PERMISSIONS.customerInvoices.*` (maps to `invoices.*` permission strings) |
| Nav | New **Billing** sidebar group (after Sales) — `permission: PERMISSIONS.customerInvoices.view`, `module: 'invoices'`. Kept separate from the Central Billing nav. |
| Route | `tenantRoutes.invoices = '/invoices'`, lazy-loaded in `App.tsx` behind `RequireAccess module="invoices"` |
| Notifications | `src/notifications/modules/invoices.ts` — `customer_invoice.assigned` → `/invoices?invoice={id}` |
| Playwright | `e2e/pages/invoices.page.ts`, `e2e/tests/invoices/`, `npm run test:e2e:invoices` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:invoices
```

## Logging

- Spatie `LogsActivity` on `CustomerInvoice` (log name `customer_invoices`)
- Domain `customer_invoice_activities` timeline
- `PlatformAuditService` via `CustomerInvoiceEventSubscriber`
