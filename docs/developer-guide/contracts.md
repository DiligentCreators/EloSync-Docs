# Contracts — Developer Guide

Mirror of the [Opportunities developer guide](/developer-guide/opportunities) and [Quotations developer guide](/developer-guide/quotations) (assignee scope, notes, domain timeline), kept lean: no line items, no pipeline/board — a contract is a single agreement record. Prefer copying those patterns over inventing new ones. PDF + customer e-signature reuse the Quotation accept-link pattern.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Contract.php`, `ContractNote`, `ContractActivity` |
| Enums | `ContractStatusEnum`, `ContractActivityTypeEnum` |
| Support | `app/Support/Billing/DocumentHtmlSanitizer.php`, `DocumentDiscountRules.php` (notes max length), `QuotationInvoiceGuard.php`, `FrontendUrl::contractAccept()` |
| PDF | `app/Services/Tenant/ContractPdfService.php`, `resources/views/contracts/pdf.blade.php` |
| Email | `app/Services/Tenant/ContractEmailService.php` (+ `BillingDocumentMailer`, `ResolvesBillingDocumentRecipients`) |
| Service | `app/Services/Tenant/ContractService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ContractController.php`, `PublicContractAcceptanceController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Contract/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Contract/*` |
| Policy | `app/Policies/ContractPolicy.php` |
| Events | `app/Events/Contract*.php` |
| Subscriber | `app/Listeners/ContractEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Contract/ContractAssignedNotification.php` |
| Link rules | `LinkableQuotation` (checks Quotations entitlement + assignee scope + same `opportunity_id`), `EligibleOpportunityAssignee` |
| Dependency migration | `database/migrations/2026_07_30_230005_add_contracts_opportunities_dependency.php` (mirrors the Quotations → Opportunities dependency) |
| Tests | `tests/Feature/Tenant/Contract/ContractTest.php`, `ContractAcceptanceTest.php`, `tests/Feature/Central/Module/ContractsModuleDependencyTest.php` |

## Domain notes

- **Hard dependency**: Contracts declares a required `module_dependencies` row on Opportunities — Marketplace install is blocked until Opportunities is entitled.
- **Soft optional dependency**: `quotation_id` is nullable and validated by `LinkableQuotation` — it fails validation when the Quotations module is not entitled for the tenant, when the quotation is soft-deleted, when the actor cannot view that quotation (same assignee-scope pattern as `LinkableCompanyForOpportunity`), or when the quotation’s `opportunity_id` does not match the contract’s opportunity.
- **Create invoice** (`ContractService::createInvoice()`): soft Invoices entitlement. Active contracts only (`isBillable()`). Repeatable with `lockForUpdate` on the contract. Copies quotation lines when present, else a lump-sum line from `value`. Sets `contract_id` and optional `quotation_id`. Second and later bills require `acknowledge_repeat_billing=true`. Does not unique-index `quotation_id`. Fires `ContractInvoiceCreated`. `QuotationInvoiceGuard` is used only for the detail flag `quotation_already_invoiced` (UI warning).
- Status machine lives on `ContractStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → sent|active|terminated`; `sent → active|expired|terminated`; `active → expired|terminated`. `ContractService::changeStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions, including re-entering the same status.
- **Send** (`POST …/send`, `contracts.send`): `draft → sent`, then `issueAcceptanceToken()` (hashed token + expiry + `signature_requested` activity). Status-only — no email/PDF on send.
- **Staff accept** (`POST …/accept`, `contracts.accept`): `sent → active`; clears outstanding acceptance token.
- **Draft activate without signature**: `POST …/status` with `active` (`contracts.update`) — allowed from draft; no customer link required.
- **Customer email:** `POST …/email` (`contracts.send`, assignee-scoped, `throttle:billing-document-email`) via `ContractEmailService`. Draft → 422. Recipients resolve from opportunity contact/company when `to` is omitted. For **Sent**, rotates acceptance token and appends `FrontendUrl::contractAccept()`. Records `emailed` + tenant email log (`contract.emailed`).
- **Customer e-signature v1:** `POST …/acceptance-link` (`contracts.send`) rotates token hash + expiry. Public `GET/POST /public/contracts/accept/{token}` (throttle `contract-acceptance`) shows summary / accepts with signer name+email+IP → `active`. Columns: `acceptance_token_hash`, `acceptance_token_expires_at`, `accepted_at`, `accepted_by_name`, `accepted_by_email`, `acceptance_ip`. Resource exposes `has_acceptance_link`, `acceptance_link_expires_at`, signer fields (not the raw token). Activity types `signature_requested` / `signed`. SPA guest page `/#/accept/contracts/:token`. Link expiry = earlier of contract `end_date` end-of-day or 30 days. Expire/terminate/internal activate clear unused links.
- Content updates are **draft-only** (`Contract::isEditable()`); assignment stays available via `POST …/assign` after send/activate.
- No line items / totals — `value` is a single optional decimal field.
- Memo `description` and `notes` accept sanitized HTML via `DocumentHtmlSanitizer` (same allowlist as billing document notes; empty HTML is stored as `null`). Timeline comments (`contract_notes`) remain plain text.
- PDF: `GET …/pdf` (`contracts.view`, assignee-scoped, `throttle:contracts-pdf`) renders from `resources/views/contracts/pdf.blade.php` via `ContractPdfService` — branded layout aligned with other sales documents.
- Assignee scoping via `ScopesToAssignee` with `contracts.assign`.
- `send` / `accept` / `convert` policies are assignee-scoped (same as `view` / `update`) unless the actor has `contracts.assign` or is superadmin.
- `contracts.force.delete` is not granted to any default role — owner/superadmin only.
- Stats include a `sent` count alongside other statuses.

## Permissions

```
contracts.view | create | update | delete | restore | force.delete | assign | send | accept | convert
```

Routes use `module:contracts` then `can:contracts.*` / policies.

Catalog: slug `contracts`, category `sales`, `is_default_included = false`, `is_billable = false`, `sort_order = 60`, version **1.5.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only). 1.1.0 added opportunity auto-fill + HTML memos; 1.2.0 adds create-invoice (soft Invoices entitlement); 1.2.1 requires `acknowledge_repeat_billing` for second+ bills; 1.3.0 related inline creates; **1.5.0 PDF + customer e-signature accept links** (+ `contracts.send` / `contracts.accept`). Production readiness: [Sales document convert](/deployment/sales-document-convert-production-readiness).

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-contracts.md](/api/tenant-v1-contracts).

## Frontend

SPA should mirror **Opportunities** / **Quotations** (table + create/edit page, record page) under the existing AppLayout — do not invent a parallel shell. Create form: selecting an opportunity auto-fills party, value, currency, and title (when empty); assignee is copied only when that user appears in the picker (`filterTaskAssigneeOptions` — suspended users omitted; owners and lead-excluded users remain assignable). Quotation auto-links only when that opportunity has exactly one quotation. Description and notes use the shared TipTap `RichTextEditor`. Store allows the creating actor to pass `assigned_to` as themselves; otherwise `EligibleOpportunityAssignee` (active non-suspended users) applies. Service still defaults `assigned_to` to the actor when the field is null. Guest accept route: `/#/accept/contracts/:token` (mirrors quotations).

| Piece | Path (expected) |
|-------|-----------------|
| Page | `src/pages/contracts/` |
| Form / detail | create/edit page + record page (Overview, Notes, Activity) |
| Guest accept | `src/pages/contracts/contract-accept-page.tsx` |
| Service | `contractService` in `src/api/services.ts` |
| Nav | `permission: contracts.view`, `module: 'contracts'` (Sales) |
| Playwright | `e2e/pages/contracts.page.ts`, `e2e/tests/contracts/`, `npm run test:e2e:contracts` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Contract/ContractTest.php tests/Feature/Tenant/Contract/ContractAcceptanceTest.php tests/Feature/Central/Module/ContractsModuleDependencyTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:contracts
```

## Logging

- Spatie `LogsActivity` on `Contract` (log name `contracts`)
- Domain `contract_activities` timeline (`emailed`, `signature_requested`, `signed`, plus existing types)
- `PlatformAuditService` via `ContractEventSubscriber`
