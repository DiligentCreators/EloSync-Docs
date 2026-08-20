# Payments — Developer Guide

Mirror of the [Invoices developer guide](/developer-guide/invoices) (assignee scope, notes, domain timeline), with one structural difference: Payments declares a **required** `module_dependencies` row on Invoices — the first Phase 3 module to do so.

> **Naming:** the backend model is `CustomerPayment` (table `customer_payments`) — Central's own platform-billing Payments ledger already exists for subscription payments tenants make *to* the platform. Frontend mirrors this with `customerPaymentService` / `PERMISSIONS.customerPayments` / `QUERY_KEYS.customerPayments`, distinct from the pre-existing `paymentService` / `PERMISSIONS.payments`.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/CustomerPayment.php`, `CustomerPaymentAllocation`, `CustomerPaymentNote`, `CustomerPaymentActivity` |
| Enums | `CustomerPaymentStatusEnum`, `CustomerPaymentMethodEnum`, `CustomerPaymentActivityTypeEnum` |
| Service | `app/Services/Tenant/CustomerPaymentService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/CustomerPaymentController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/CustomerPayment/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/CustomerPayment/*` |
| Policy | `app/Policies/CustomerPaymentPolicy.php` |
| Events | `app/Events/CustomerPayment*.php` |
| Subscriber | `app/Listeners/CustomerPaymentEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/CustomerPayment/CustomerPaymentAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableCompany`, `EligiblePaymentAssignee` — `allocations.*.customer_invoice_id` is a plain tenant-scoped `Rule::exists()` on `CustomerInvoice` |
| Tests | `tests/Feature/Tenant/CustomerPayment/CustomerPaymentTest.php` |

## Domain notes

- **Hard dependency**: Payments declares a required `module_dependencies` row on Invoices (`database/migrations/2026_07_31_221006_add_payments_invoices_dependency.php`) — Marketplace install is blocked until Invoices is entitled. Contrast with Invoices itself, which has no hard dependency.
- Status machine lives on `CustomerPaymentStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → posted`, `posted → void`; `void` is terminal. There is no `sent`/`partial` equivalent — Payments only has these three states.
- `CustomerPaymentService::post()` / `void()` throw `ValidationException` (422, `status` field) for disallowed transitions.
- `post()` locks every allocation's invoice with `CustomerInvoice::query()->lockForUpdate()` (deliberately **not** `withTrashed()` — a soft-deleted invoice must not receive a payment) and validates all of them in a first pass before mutating anything, on `allocations` (naming the invoice number): invoice must exist, its status must be `sent`/`partial`, the allocation amount must not exceed its `balance_due` (0.01 float tolerance), and if both the payment and invoice have a `currency` set they must match. Only after every allocation passes does a second pass add each `amount` to its `CustomerInvoice::amount_paid` and call `CustomerInvoice::recalculateBalanceFromAmounts()` (recomputes `balance_due` and advances `sent → partial|paid`).
- `void()` locks each invoice **with** `withTrashed()` and does not re-check its status — this is intentional: a void is a ledger correction that must succeed even if the invoice was since fully paid by another payment or soft-deleted, otherwise `amount_paid` would permanently disagree with the payment record. It does the mirror-image subtraction and recalculation.
- Content updates (`PUT`) — including replacing `allocations` — are **draft-only** via `CustomerPaymentService::isEditable()` (`status === draft`, same guard used for delete). Assignment remains available after posting via `POST …/assign`.
- Allocations are a first-class child table (`customer_payment_allocations`), not embedded JSON — each row is `{ customer_payment_id, customer_invoice_id, amount }`, loaded with its `customerInvoice` ref for display.
- Assignee scoping via `ScopesToAssignee` with `payments.assign`.
- `payments.force.delete` is not granted to any default role — owner/superadmin only.
- `contact_id` / `company_id` are optional and validated for module entitlement + assignee scope (`LinkableContact` / `LinkableCompany`), same pattern as Invoices.
- Auto-numbering: `CustomerPaymentService::nextNumber()` reads the `payments_number_prefix` tenant setting (default `PAY-`), then zero-pads a running count to 5 digits — same pattern as Invoices' `invoices_number_prefix`. Neither prefix setting is exposed in the Tenant Settings UI yet. `customer_payments` has a `unique(tenant_id, number)` DB index; `create()` retries up to 3 times via the shared `RetriesOnDuplicateNumber` trait on a duplicate-key collision.

## Permissions

```
payments.view | create | update | delete | restore | force.delete | assign | post | void
```

Routes use `module:payments` then `can:payments.*` / policies.

Catalog: slug `payments`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 20`. Registered via `DefaultModuleRegistrar` migration (migrate-only), with a follow-up migration inserting the `module_dependencies` row on `invoices`.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-payments.md](/api/tenant-v1-payments).

## Frontend

SPA mirrors **Invoices** (table + create/edit page, record page) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path |
|-------|------|
| Page | `src/pages/payments/` (`payments-page.tsx`, `payment-form-dialog.tsx`, `payment-detail-sheet.tsx`) |
| Detail sheet tabs | Overview, Allocations, Notes, Timeline — actions: assign, add note, post, void, edit (draft only), delete |
| Form dialog | Amount, currency, method, paid-at, reference, notes, contact/company/assignee pickers, and an allocations editor (`useFieldArray`). Allocation options show contact · company · invoice number — balance due; search matches name/company/number; selecting an invoice copies contact, company, and assignee onto the payment when present on the invoice. |
| Service | `customerPaymentService` in `src/api/services.ts` |
| Types | `CustomerPayment*` in `src/types/api.ts` (kept distinct from the pre-existing Central `Payment*` types) |
| Query keys | `QUERY_KEYS.customerPayments` / `customerPayment(id)` / `customerPaymentTimeline(id)` / `customerPaymentStats` |
| Permissions | `PERMISSIONS.customerPayments.*` (maps to `payments.*` permission strings) |
| Nav | **Billing** sidebar group, after Invoices — `permission: PERMISSIONS.customerPayments.view`, `module: 'payments'`. Kept separate from the Central Billing nav. |
| Route | `tenantRoutes.payments = '/payments'`, lazy-loaded in `App.tsx` behind `RequireAccess module="payments"` |
| Notifications | `src/notifications/modules/payments.ts` — `customer_payment.assigned` → `/payments?payment={id}` |
| Cross-link | Invoice record page shows a "Related payments" link to `/payments` when the Payments module + `payments.view` are both present |
| Playwright | `e2e/pages/payments.page.ts`, `e2e/tests/payments/`, `npm run test:e2e:payments` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/CustomerPayment/CustomerPaymentTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:payments
```

## Logging

- Spatie `LogsActivity` on `CustomerPayment` (log name `customer_payments`)
- Domain `customer_payment_activities` timeline
- `PlatformAuditService` via `CustomerPaymentEventSubscriber`
