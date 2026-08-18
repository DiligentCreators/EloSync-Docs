# Billing product line picker — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-18 |
| **Status** | **Go** — migrate-first rollout (Backend before SPA) |
| **Scope** | Optional `product_id` on quotation / estimate / invoice lines + Products HTML description |
| **Branch** | `feature/billing-documents-discounts-and-terms` |
| **Catalog** | quotations **1.3.1**, estimates **1.3.1**, invoices **1.5.1**, products **1.1.1** |
| **Companions** | [Quotations](/user-guide/quotations) · [Estimates](/user-guide/estimates) · [Invoices](/user-guide/invoices) · [Products](/user-guide/products) · [API quotes](/api/tenant-v1-quotations) · [Changelog](/changelog/) |

Additive MINOR/PATCH on existing billing document modules and Products. No new permissions, queues, or foundation changes (platform freeze).

---

## Executive summary

Operators with **Products** installed and `products.view` can optionally pick an **active** catalog product on quotation, estimate, and invoice lines. The SPA uses **server-side search** (`status=active`) to fill **name**, rich **details**, and **unit price**; fields remain editable. Clearing the product link does **not** wipe edited text. The API stores client-sent values plus optional `product_id` (no catalog re-copy on save). `LinkableProduct` requires Products entitlement, `products.view` (or superadmin), an active non-trashed product, and tenant scope. Estimate → invoice convert and recurring invoice clone preserve `product_id`. Product / document HTML strips `style` and neutralizes `javascript:` / `data:` hrefs.

| Gate | Result |
|------|--------|
| Nullable `product_id` FK + `nullOnDelete` (idempotent migrate) | **Pass** |
| `LinkableProduct` (entitlement + `products.view` + active + SoftDeletes) | **Pass** |
| `syncLines` persists `product_id`; convert + recurring copy | **Pass** |
| Line resources expose `product_id` + optional `product` `{id,sku,name}` | **Pass** |
| Eager load `lines.product` on show/mutations | **Pass** |
| SPA picker gated `products` module + `products.view`; server search + `status=active` | **Pass** |
| Clear product link does not wipe edited line text | **Pass** |
| `DocumentHtmlSanitizer` strips `style` / `data:` / `javascript:` | **Pass** |
| SPA display DOMPurify (`sanitizeDocumentHtml`) | **Pass** |
| Catalog bumps migrate-only (no auto-entitle) | **Pass** |
| Pest: entitlement, inactive/trashed/permission, convert + recurring `product_id` | **Pass** |
| Playwright products + quotations (+ clear/hide) + estimates + invoices | **Pass** (see Test evidence) |
| `database.md` line schemas | **Pass** |

**Go / No-Go:** **Go** — ship after Backend migrate on all tenant DBs **before** SPA that posts `product_id`.

---

## Findings (remediated)

| ID | Severity | Status | Finding | Remediation |
|----|----------|--------|---------|-------------|
| H1 | High | **Ops gate** | SPA before migrate → SQL missing `product_id` | Deploy Backend migrate first; smoke POST with `product_id` |
| H2 | High | **Fixed** | Picker `per_page: 100`, client filter only | Server `search` + `status=active` via products list API |
| H3 | High | **Fixed** | `database.md` still showed `description` on quote lines | Updated quotation/estimate/invoice line schemas |
| H4 | High | **Fixed** | Pest gaps: entitlement / convert / recurring | Estimate + invoice entitlement; convert + recurring assert `product_id` |
| M1 | Medium | **Fixed** | Sanitizer kept `style=` / `data:` hrefs | Strip `style`; neutralize `data:` + unit tests |
| M2 | Medium | **Fixed** | Soft-deleted products passed `LinkableProduct` | SoftDeletes-aware `Product::query()` |
| M3 | Medium | **Fixed** | API ignored `products.view` | Require `products.view` or superadmin (SPA + PO picker aligned) |
| M4 | Medium | **Fixed** | Convert / products overview incomplete | Developer convert list + products guides |
| M5 | Medium | **Fixed** | e2e missing clear-without-wipe + picker hidden | Quotations Playwright extended |
| L1 | Low | **Fixed** | Inactive products linkable | Reject unless `ProductStatusEnum::Active`; picker filters active |
| L2 | Low | **Fixed** | Upgrade runbook omitted migrates | Named under upgrade + this page |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No new permissions | Reuse document create/update + Products entitlement / `products.view` |
| Client-owned line text | Selecting a product overwrites on select; save does not re-pull catalog |
| Soft delete ≠ `nullOnDelete` | Force-delete nulls FK; soft delete leaves `product_id` (embed may be null) |
| Catalog bump ≠ auto-install | Workspaces without Quotations/Estimates/Invoices/Products unchanged |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| Pest unit `DocumentHtmlSanitizer` | Required green | style / data / javascript |
| Pest Quotation product link + entitlement + inactive/trashed/permission | Required green | QuotationTest |
| Pest Estimate product link + entitlement + convert `product_id` | Required green | EstimateTest |
| Pest Invoice product link + entitlement + recurring `product_id` | Required green | CustomerInvoiceTest / RecurrenceTest |
| `npm run test:e2e:products` | Required green | Validation + CRUD |
| `npm run test:e2e:quotations` | Required green | Clear-without-wipe + picker hidden without Products |
| `npm run test:e2e:estimates` | Required green | Convert asserts invoice `product_id` |
| `npm run test:e2e:invoices` | Required green | Product draft + recurring |

---

## Deploy order

1. **Backend** — `php artisan migrate --force`  
   - `2026_08_18_000658_bump_products_module_version_to_1_1_0`  
   - `2026_08_18_001042_add_product_id_to_billing_document_lines_tables`  
   - `2026_08_18_001043_bump_billing_document_modules_for_product_line_picker`  
   - `2026_08_18_063000_bump_modules_for_product_line_picker_hardening` → catalog **1.1.1 / 1.3.1 / 1.3.1 / 1.5.1**
2. Confirm catalog versions match the table above
3. **SPA** — server-search product picker + TipTap product description
4. **Docs**
5. Staging smoke below

Suggested merge: **Backend → Frontend → Docs**. Do **not** `db:seed`.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | Migrations `000658` / `001042` / `001043` / `063000` on all tenant DBs | Ops | ☐ |
| 2 | Catalog versions match table above | Ops | ☐ |
| 3 | Products entitled workspace: pick product on quote/estimate/invoice | Eng | ☐ |
| 4 | Edit line text after pick; save; show still shows edited text + `product_id` | Eng | ☐ |
| 5 | Clear product link → edited text remains | Eng | ☐ |
| 6 | Estimate convert → invoice line retains `product_id` | Eng | ☐ |
| 7 | Workspace without Products: no picker; API reject `product_id` | Eng | ☐ |
| 8 | Pest billing/product filters green in CI | Eng | ☐ |
| 9 | Playwright products + quotations + estimates + invoices green | Eng | ☐ |
| 10 | Branded PDF still renders line body HTML safely | Eng | ☐ |

---

## Staging smoke

1. Entitle Products + Quotations (or Estimates / Invoices).
2. Create a product with rich HTML description and a price.
3. New quotation/estimate/invoice → search/select product → confirm name/details/price fill.
4. Edit details → save → reopen → text unchanged; `product_id` still set.
5. Clear product link → edited text remains.
6. Accept estimate → Convert to invoice → API show line has same `product_id`.
7. Download PDF → line details visible, no script / style injection.

---

## Rollback

- **SPA only:** hide picker / stop posting `product_id` (column remains nullable).
- **Schema:** do not drop `product_id` in production without a dedicated reverse migration; additive columns are safe to leave.
- **Catalog versions:** down migrations restore prior versions only if explicitly run (usually leave bumps).

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Eng | | 2026-08-18 | **Go** |
| Ops | | | Migrate complete ☐ |
| Product | | | |
