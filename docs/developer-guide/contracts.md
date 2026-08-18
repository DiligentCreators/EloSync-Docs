# Contracts — Developer Guide

Mirror of the [Opportunities developer guide](/developer-guide/opportunities) and [Quotations developer guide](/developer-guide/quotations) (assignee scope, notes, domain timeline), kept lean: no line items, no pipeline/board — a contract is a single agreement record. Prefer copying those patterns over inventing new ones.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Contract.php`, `ContractNote`, `ContractActivity` |
| Enums | `ContractStatusEnum`, `ContractActivityTypeEnum` |
| Support | `app/Support/Billing/DocumentHtmlSanitizer.php`, `DocumentDiscountRules.php` (notes max length) |
| Service | `app/Services/Tenant/ContractService.php` (+ `ScopesToAssignee`) |
| Controller | `app/Http/Controllers/Tenant/Api/V1/ContractController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Contract/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Contract/*` |
| Policy | `app/Policies/ContractPolicy.php` |
| Events | `app/Events/Contract*.php` |
| Subscriber | `app/Listeners/ContractEventSubscriber.php` (audit + assignment notification) |
| Notifications | `app/Notifications/Tenant/Contract/ContractAssignedNotification.php` |
| Link rules | `LinkableQuotation` (checks Quotations entitlement + assignee scope + same `opportunity_id`), `EligibleOpportunityAssignee` |
| Dependency migration | `database/migrations/2026_07_30_230005_add_contracts_opportunities_dependency.php` (mirrors the Quotations → Opportunities dependency) |
| Tests | `tests/Feature/Tenant/Contract/ContractTest.php`, `tests/Feature/Central/Module/ContractsModuleDependencyTest.php` |

## Domain notes

- **Hard dependency**: Contracts declares a required `module_dependencies` row on Opportunities — Marketplace install is blocked until Opportunities is entitled.
- **Soft optional dependency**: `quotation_id` is nullable and validated by `LinkableQuotation` — it fails validation when the Quotations module is not entitled for the tenant, when the quotation is soft-deleted, when the actor cannot view that quotation (same assignee-scope pattern as `LinkableCompanyForOpportunity`), or when the quotation’s `opportunity_id` does not match the contract’s opportunity.
- Status machine lives on `ContractStatusEnum::allowedTransitions()` / `canTransitionTo()`: `draft → active → expired|terminated` (also `draft → terminated`). `ContractService::changeStatus()` throws `ValidationException` (422, `status` field) for disallowed transitions, including re-entering the same status.
- Content updates are **draft-only** (`Contract::isEditable()`); assignment stays available via `POST …/assign` after activate.
- No line items / totals — `value` is a single optional decimal field.
- Memo `description` and `notes` accept sanitized HTML via `DocumentHtmlSanitizer` (same allowlist as billing document notes; empty HTML is stored as `null`). Timeline comments (`contract_notes`) remain plain text.
- Assignee scoping via `ScopesToAssignee` with `contracts.assign`.
- `contracts.force.delete` is not granted to any default role — owner/superadmin only.

## Permissions

```
contracts.view | create | update | delete | restore | force.delete | assign
```

Routes use `module:contracts` then `can:contracts.*` / policies.

Catalog: slug `contracts`, category `sales`, `is_default_included = false`, `is_billable = false`, `sort_order = 60`, version **1.1.0**. Registered via `DefaultModuleRegistrar` migration (migrate-only).

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-contracts.md](/api/tenant-v1-contracts).

## Frontend

SPA should mirror **Opportunities** / **Quotations** (table + form dialog, detail sheet) under the existing AppLayout — do not invent a parallel shell. Create form: selecting an opportunity auto-fills party, value, currency, assignee, and title (when empty); quotation auto-links only when that opportunity has exactly one quotation. Description and notes use the shared TipTap `RichTextEditor`.

| Piece | Path (expected) |
|-------|-----------------|
| Page | `src/pages/contracts/` |
| Form / detail | form dialog + detail sheet (Overview, Notes, Activity) |
| Service | `contractService` in `src/api/services.ts` |
| Nav | `permission: contracts.view`, `module: 'contracts'` (Sales) |
| Playwright | `e2e/pages/contracts.page.ts`, `e2e/tests/contracts/`, `npm run test:e2e:contracts` |

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/Contract/ContractTest.php tests/Feature/Central/Module/ContractsModuleDependencyTest.php
npm run typecheck && npm run lint && npm run build
npm run test:e2e:contracts
```

## Logging

- Spatie `LogsActivity` on `Contract` (log name `contracts`)
- Domain `contract_activities` timeline
- `PlatformAuditService` via `ContractEventSubscriber`
