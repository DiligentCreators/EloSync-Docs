# Credit Notes — Developer Guide

Mirror of the [Payments developer guide](/developer-guide/payments) (assignee scope, notes, domain timeline, hard dependency on Invoices), with a `lines` child table (subtotal/tax/total) instead of Payments' `allocations`.

> **Naming:** the backend model is `CustomerCreditNote` (table `customer_credit_notes`) — distinct from Central's own platform-billing `credit_notes` ledger table (credits the platform issues *to* a tenant against its own module-subscription invoices). Frontend mirrors this with `customerCreditNoteService` / `PERMISSIONS.customerCreditNotes` / `QUERY_KEYS.customerCreditNotes`.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/CustomerCreditNote.php`, `CustomerCreditNoteLine`, `CustomerCreditNoteNote`, `CustomerCreditNoteActivity` |
| Enums | `CustomerCreditNoteStatusEnum`, `CustomerCreditNoteActivityTypeEnum` |
| Service | `app/Services/Tenant/CustomerCreditNoteService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/CustomerCreditNoteController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/CustomerCreditNote/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/CustomerCreditNote/*` |
| Policy | `app/Policies/CustomerCreditNotePolicy.php` |
| Events | `app/Events/CustomerCreditNote*.php` |
| Subscriber | `app/Listeners/CustomerCreditNoteEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/CustomerCreditNote/CustomerCreditNoteAssignedNotification.php` |
| Link rules | `LinkableContact`, `LinkableCompany`, `EligibleCreditNoteAssignee` — `customer_invoice_id` is a plain tenant-scoped `Rule::exists()` on `CustomerInvoice` |
| Factories | `CustomerCreditNoteFactory`, `CustomerCreditNoteLineFactory`, `CustomerCreditNoteNoteFactory`, `CustomerCreditNoteActivityFactory` |
| Tests | `tests/Feature/Tenant/CustomerCreditNote/CustomerCreditNoteTest.php` |

## Domain notes

- **Hard dependency**: Credit Notes declares a required `module_dependencies` row on Invoices (`database/migrations/2026_07_31_222006_add_credit_notes_invoices_dependency.php`) — Marketplace install is blocked until Invoices is entitled, same pattern as Payments → Invoices.
- Status machine lives on `CustomerCreditNoteStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → issued|void`, `issued → applied|void`, `applied → refunded`; `refunded` and `void` are terminal.
- `CustomerCreditNoteService::transitionStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions; used by `issue()` and `void()`. `apply()` and `refund()` guard transitions themselves (like Payments `post`/`void`).
- `issue()` backfills `issue_date` to today if it wasn't already set.
- `apply()` locks the linked invoice with `CustomerInvoice::query()->lockForUpdate()` (deliberately **not** `withTrashed()` — the target invoice must still be active) and validates before writing anything, throwing on `status`: invoice must exist, its status must be `unpaid`, and the credit note's `total` must not exceed the invoice's `balance_due` (0.01 float tolerance). It then adds `total` to `CustomerInvoice::amount_credited` and calls `CustomerInvoice::recalculateBalanceFromAmounts()` — this recomputes `balance_due` **and can advance the invoice `status`** to `paid`, the same as Payments posting. It also records a `credited` activity on the invoice itself. When Accounting is entitled, posts Dr Revenue / Cr AR (plus tax payable debit when tax > 0).
- `refund()` mirrors `CustomerPaymentService::void()`: voids the linked apply journal via `CashMovementJournalService::voidLinked()`, locks the invoice with `CustomerInvoice::withTrashed()->lockForUpdate()`, subtracts `total` from `amount_credited` (floored at 0), calls `recalculateBalanceFromAmounts()`, transitions the credit note to `refunded`, and records `credit_refunded` on the invoice. Dispatches `CustomerCreditNoteStatusChanged` + `CustomerCreditNoteRefunded`.
- `void()` is a pure status transition — it does **not** reverse any invoice balance, because it's only reachable from `draft`/`issued` (before `amount_credited` has been touched).
- Invoice cancel (`CustomerInvoiceService::void()`) rejects when net `amount_credited > 0` and tells operators to refund applied credit notes first.
- Content updates (`PUT`) — including replacing the full `lines` array — are **draft-only** via `CustomerCreditNoteService::isEditable()` (`status === draft`, same guard used for delete). Assignment remains available after issuing via `POST …/assign`.
- Lines are a first-class child table (`customer_credit_note_lines`), not embedded JSON — each row is `{ description, quantity, unit_price, tax_rate, sort_order }`. `subtotal`/`tax_total`/`total` are recomputed server-side from lines on create/update, same as Invoices.
- Assignee scoping via `ScopesToAssignee` with `credit-notes.assign`.
- `credit-notes.force.delete` is not granted to any default role — owner/superadmin only.
- `contact_id` / `company_id` are optional and validated for module entitlement + assignee scope (`LinkableContact` / `LinkableCompany`); when omitted, the frontend form pre-fills them from the selected invoice, but the backend does not auto-default them — a blank value is stored as `null`.
- Auto-numbering: `CustomerCreditNoteService::nextNumber()` reads the `credit_notes_number_prefix` tenant setting (default `CN-`), then zero-pads a running count to 5 digits — same pattern as Invoices/Payments. Prefix is editable under **Settings → General → Document number prefixes**. `customer_credit_notes` has a `unique(tenant_id, number)` DB index; `create()` retries up to 3 times via the shared `RetriesOnDuplicateNumber` trait on a duplicate-key collision.

## Permissions

```
credit-notes.view | create | update | delete | restore | force.delete | assign | issue | apply | void | refund
```

Routes use `module:credit-notes` then `can:credit-notes.*` / policies.

Catalog: slug `credit-notes`, category `billing`, `is_default_included = false`, `is_billable = false`, `sort_order = 30`, version **1.2.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only), with a follow-up migration inserting the `module_dependencies` row on `invoices`. Catalog MINOR bumps use `DefaultModuleRegistrar::bumpVersion` (e.g. `1.1.0 → 1.2.0` for applied refund).

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-credit-notes.md](/api/tenant-v1-credit-notes).

## Frontend

SPA mirrors **Invoices**/**Payments** (table + create/edit page, record page) under the existing AppLayout — do not invent a parallel shell.

| Piece | Path |
|-------|------|
| Page | `src/pages/credit-notes/` (`credit-notes-page.tsx`, `credit-note-form-dialog.tsx`, `credit-note-detail-sheet.tsx`) |
| Detail sheet | Overview, linked invoice, contact/company, line items, notes, timeline — actions: assign, add note, issue, apply, refund (applied), void (draft/issued), edit (draft only), delete |
| Form dialog | Invoice picker (drives default currency/contact/company), title, notes, issue date, contact/company/assignee pickers, and a line-items editor (`useFieldArray`) with live subtotal/tax/total preview |
| Service | `customerCreditNoteService` in `src/api/services.ts` |
| Types | `CustomerCreditNote*` in `src/types/api.ts` |
| Query keys | `QUERY_KEYS.customerCreditNotes` / `customerCreditNote(id)` / `customerCreditNoteTimeline(id)` / `customerCreditNoteStats` |
| Permissions | `PERMISSIONS.customerCreditNotes.*` (maps to `credit-notes.*` permission strings) |
| Nav | **Billing** sidebar group, after Payments — `permission: PERMISSIONS.customerCreditNotes.view`, `module: 'credit-notes'` |
| Route | `tenantRoutes.creditNotes = '/credit-notes'`, lazy-loaded in `App.tsx` behind `RequireAccess module="credit-notes"` |
| Notifications | `src/notifications/modules/credit-notes.ts` — `customer_credit_note.assigned` → `/credit-notes?credit-note={id}` |
| Cross-link | Invoice record page shows a "Credit notes" link to `/credit-notes?invoice={id}` when the Credit Notes module + `credit-notes.view` are both present |
| Playwright | `e2e/pages/credit-notes.page.ts`, `e2e/tests/credit-notes/`, `npm run test:e2e:credit-notes` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/CustomerCreditNote/CustomerCreditNoteTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:credit-notes
```

## Logging

- Spatie `LogsActivity` on `CustomerCreditNote` (log name `customer_credit_notes`)
- Domain `customer_credit_note_activities` timeline
- `PlatformAuditService` via `CustomerCreditNoteEventSubscriber`
