# FBR Invoicing — Developer Guide

Slug: `fbr-invoicing` · Catalog version **1.0.0** · Free Marketplace opt-in.

## Dependencies

| Dependency | Nature |
|------------|--------|
| `invoices` | Required hard |
| `products` | Required hard |
| `companies` | Optional soft |
| `contacts` | Optional soft |
| `estimates` | Optional soft (Batch 2 proforma extends Estimates inside the FBR gate) |

## Permissions

`fbr-invoicing.view`, `configure`, `validate`, `submit` — granted to admin/manager defaults via data migration.

## Module gating

Without entitlement:

- API list/show resources **omit** company/contact buyer FBR keys and invoice `fbr_*` / `fbr_readiness` / `fbr_payment_*` keys
- Estimate resources omit proforma fields, `display_status`, and estimated GST/further-tax keys
- Import field catalogs omit FBR columns
- Invoice export headers stay exactly as today
- Frontend hides FBR UI via `hasModule('fbr-invoicing')`
- Non-FBR tenants never see buyer verify, product FBR profile, Validate/Submit, readiness checklist, proforma extras, payment gate, or FBR PDF chrome

Prove with Pest on a non-FBR tenant **and** an FBR tenant (`FbrInvoicingNonFbrRegressionTest`, `FbrInvoicingGatingAndSafetyTest`, `FbrInvoicingQaRetest1Test`, `FbrInvoicingQaRetest2Test`, `EstimateFbrProformaTest`, `FbrPaymentGuardTest`, settings/import buyer-field tests).

## Data model

| Table | Scope |
|-------|--------|
| `fbr_hs_uoms` | Central shared (no `tenant_id`) |
| `fbr_registration_scenarios` | Central shared (`sale_type` nullable; `buyer_registration_type` for Registered/Unregistered / legacy text) |
| `fbr_workspace_credentials` | Tenant (encrypted tokens; optional Get_Reg_Type URL overrides; `nic_validate`; `environment_changed_at` / `environment_changed_by`; `updated_by`) |
| `product_fbr_profiles` | Tenant (`sale_type` nullable first-class; retail for 3rd-schedule; GST rate) |
| `fbr_invoice_submissions` | Tenant audit log (`payload_hash`, `retry_of` for submit inconsistency retry) |
| `customer_invoices.fbr_*` | Validated flag, FBR number (IRN), timestamps, last error, optional `fbr_registration_scenario_id` |
| `customer_invoice_lines.fbr_further_tax_type` | Additive nullable (`none` / `236G` / `236H` / `unregistered_4`); ignored when module off |
| `customer_credit_notes.fbr_*` | Additive nullable: `fbr_validated`, timestamps, `fbr_invoice_number`, `fbr_last_error`, `fbr_note_type` (`credit_note` \| `debit_note`; null = normal EloSync CN) |
| `customer_credit_note_lines.product_id` / `customer_invoice_line_id` | Additive nullable; resolve HS/UoM/saleType from product profile / original invoice line |
| `estimates` proforma columns | Additive nullable: `payment_terms`, `delivery_terms`, `advance_terms`, `advance_percent`, `advance_amount`, `due_date` |
| `estimate_lines.fbr_further_tax_type` / `fbr_sale_type` | Additive nullable snapshots for FBR tenants |
| Companies/Contacts FBR buyer columns | Additive nullable |

Canonical lists: `App\Support\Fbr\FbrSaleTypes`, `App\Support\Fbr\FbrFurtherTaxTypes`, `App\Support\Fbr\FbrNoteTypes`, `App\Support\Fbr\FbrPakistanProvinces`, `App\Support\Fbr\FbrSellerNtn` (mirrored in Frontend `src/lib/fbr.ts` where applicable).

## Official FBR DI facts (payload)

- **SN001 / SN002** item `saleType` is the verbatim string `Goods at standard rate (default)`. Buyer type + sandbox `scenarioId` distinguish them (SN001 registered, SN002 unregistered) — not a different `saleType` string.
- **SN008** uses `saleType` `3rd Schedule Goods`.
- Item UoM is sent as `Numbers, pieces, units`. Catalog short name `Number` is normalized to that official string before the DI call.
- Seller / buyer registration number on the wire: **7-digit NTN** or **13-digit CNIC**. Seller **save** allows **7–9** digit NTN or 13-digit CNIC (`FbrSellerNtn`); when stored length is not 7/13, `sellerNTNCNIC` uses `nic_validate` digits when those are 7/13. `warnings.seller_registration_warning` when neither is usable.
- Credit notes (and debit notes) are posted with `invoiceType` **`Debit Note`** plus `invoiceRefNo` = original FBR IRN. Sandbox rejects `invoiceType: "Credit Note"` (status `01`, error **0003**). Reason is required (**0027**); reason `Others` needs remarks (**0028**). This CN sandbox gap remains open.

## Tenant API

Prefix `/api/tenant/v1/fbr-invoicing` · middleware `module:fbr-invoicing`:

| Method | Path | Notes |
|--------|------|--------|
| `GET` / `PUT` | `credentials` | Sandbox/Live token + seller identity — see **Batch 1 settings** / seller NTN |
| `GET` | `hs-codes` | `{hs_code, description}`; search code **and** description |
| `GET` | `hs-uoms`, `scenarios`, `provinces`, `sale-types`, `further-tax-types` | Catalog reads |
| `POST` | `buyer/verify` | Permission `validate` — see **D1** |
| `GET` / `PUT` | `products/{product}/profile` | Product FBR profile (sale type, HS, UoM, rate, retail, SRO, …) |
| `POST` | `invoices/{customerInvoice}/validate` | Permission `validate` — see **D5**, **D6** |
| `POST` | `invoices/{customerInvoice}/submit` | Permission `submit` — see **D4**, **D6**, **D7**, **R2-1** |
| `POST` | `credit-notes/{customerCreditNote}/validate` / `submit` | Same response shape as invoices |

There are **no** FBR validate/submit routes for estimates. Validate and submit are **separate** endpoints. Validate must succeed before submit; editing invoice content clears validation (never clears a stored FBR IRN). Submit uses `lockForUpdate` plus a per-document Cache lock; it does **not** HTTP-retry on ordinary failures (validate may retry). A single automatic **inconsistency** retry may run after a successful validate with the same `payload_hash` — see **R2-1**. Live outbound calls are blocked in `local`/`testing` unless `FBR_ALLOW_LIVE_LOCALLY=true`.

### Validate / submit response shape

```json
{
  "status": "Valid" | "Invalid",
  "status_code": "00",
  "item_errors": [
    {
      "index": 1,
      "product_name": "Widget A",
      "status_code": "0046",
      "message": "…"
    }
  ],
  "fbr_readiness": { }
}
```

- Line problems use **1-based** `index` = invoice line number and `product_name` = that line’s name.
- Document-level problems (buyer details, credentials, etc.) use `index` **0** and `product_name` `"Invoice"` or `"Credit note"`. Frontend `formatFbrItemError` renders these as **`Invoice: message`**.
- **Local (pre-FBR) validation** returns the **same shape** as FBR Invalid responses (status `Invalid`, `status_code` when known, `item_errors[]`).
- Invoice validate/submit (and invoice detail) also return **`fbr_readiness`** for FBR tenants only (omitted for non-FBR). Submitted invoices keep readiness with `locked: true` and optional `post_submission_issues`.

## Batch 1 — settings, buyers, import, readiness

### Credentials / environment

`FbrCredentialService` + Billing → FBR Invoicing UI:

| Behaviour | Detail |
|-----------|--------|
| Environment badge | Active `sandbox` / `live` from credentials payload |
| Live switch | **Owner/admin** + `fbr-invoicing.configure` only (`can_switch_environment`) |
| Live confirmation | Switching to live requires `confirm_live=true` and `confirm_text` exactly `LIVE` |
| Local/test guard | `live_allowed_here` is false when `APP_ENV` is `local`/`testing` and `FBR_ALLOW_LIVE_LOCALLY` is unset/false — Live switch and outbound Live calls are blocked |
| Blocked Live audit | Platform audit `fbr_credentials.environment_switch_blocked` (actor, from, to, reason: `local_block` \| `not_admin` \| `missing_confirm`) before the same 403/422 |
| Token secrecy | Response never includes raw tokens; only `has_*_token` + `sandbox_token_hint` / `live_token_hint` (**bullets** `\u{2022}` × 4 + last 4 when length ≥ 12) |
| Blank token | Omitting or blanking a token field keeps the encrypted token already stored |
| Seller NTN | Save: 7–9 digit NTN or 13-digit CNIC. Wire: 7 or 13 via `ntn_cnic` or fallback `nic_validate`. Warning when neither usable |
| Province | `FbrPakistanProvinces::all()` — 7 canonical names; aliases normalised via `normalize()` |
| Audit | Platform audit events `fbr_credentials.created` / `updated` / `environment_changed`; payload exposes `environment_changed_at` and `environment_changed_by` (actor name) |

### Buyer FBR fields (companies & contacts)

- Gated by entitlement: resources omit keys when module off; writes ignore/null FBR columns for non-FBR tenants.
- Shared normalisation: `FbrBuyerFieldNormalizer` (digits-only NTN/CNIC length **7 or 13**; registration type blank → `null`, never defaulted to Registered; province aliases → canonical).
- Frontend: `FbrBuyerFields` + `hasModule('fbr-invoicing')` on company/contact sheets and views.

### Import

Company/contact import templates and mapping include optional `ntn_cnic`, `strn`, `province`, `registration_type` **only** when entitled. Invalid FBR values fail that row (`failed_count`); valid rows continue. Import does **not** call `buyer/verify`. Pest: `CompanyFbrImportTest`, `ContactFbrImportTest`.

### Readiness checklist

`FbrInvoiceReadiness::forInvoice` computes from the **saved** invoice + company/contact + product FBR profiles + credentials:

- Buyer: NTN/CNIC **required** only when Registered; Unregistered optional (if present must be 7/13 digits)
- Lines: HS + UoM present; tax evaluated via `FbrInvoiceTaxGuard`
- Credentials configured + environment; empty seller address → readiness warning; `validated` / `submitted` / overall `ready`
- Submitted: `locked: true` + `post_submission_issues` (read-only UI)

Returned on invoice detail and on validate/submit responses; UI refreshes after those calls and stays visible after submit.

## Behaviour (D1–D7 + retest-2)

### D1 — Buyer verify

`POST …/buyer/verify` (Get_Reg_Type / STATL-style).

Returns `verification_status` of **Registered** / **Unregistered** / **Not found** / **Unknown**, or a graceful sandbox/transport unavailable payload (`success: false`, typically HTTP 200 from EloSync). Never a **500**. Never auto-sets Registered when FBR returns empty/unknown type or the call fails.

When the sandbox returns an upstream error **with** a readable status/registration hint, response includes informational `fbr_reported_status_code` / `fbr_reported_registration_type` only — UI shows them as information; registration type is **not** auto-applied from those fields. Explicit Registered/Unregistered from a successful business response may still be offered for the user to apply.

### D2 — 3rd-schedule tax

For `saleType` `3rd Schedule Goods` (SN008):

- `salesTaxApplicable` = **retail price × qty × rate**
- `fixedNotifiedValueOrRetailPrice` required before the FBR call; retail is stored and visible on the product FBR profile
- Example: sale 1200, retail 1500, 18%, qty 1 → tax **270**, line total **1470**

### D3 — PDF after FBR submit

When `fbr_invoice_number` is set, the invoice PDF includes the FBR IRN and a **PNG QR** (GD) encoding that number. Non-FBR PDFs are unchanged (no FBR chrome). Official FBR logo on PDF is **not** shipped yet.

**Troubleshooting (Windows / `php artisan serve`):** Dompdf font subsetting called `tempnam()` against `sys_get_temp_dir()`. Under `php artisan serve` on Windows, `TEMP`/`TMP` can be stripped so the temp dir becomes `C:\WINDOWS` (not writable) and every PDF returns **500**. Fix: all Dompdf services build `Options` via `App\Support\Pdf\DompdfOptionsFactory` with `tempDir` = `storage/framework/dompdf` and `fontCache` = `storage/fonts` (both auto-created and git-ignored).

### D4 — Lock after FBR submit

Once `fbr_invoice_number` is set, the invoice is locked on **every** surface: full page, list, drawer, **bulk** actions, and API. No Edit, Void, or Trash. Backend rejects those mutations. Corrections go through credit/debit notes.

Validate and Submit actions are hidden after submission. Do **not** treat bulk “Send N to FBR” or PDF watermark / month-year prefix as shipped — those are later batches.

### D5 — Invalid validate UX / payload

Invalid validate (local or FBR) returns status, `status_code`, and per-line `item_errors` suitable for UI copy like `Item n (product name) [code]: message`. Document-level rows render as **`Invoice: message`**. After a Valid **00**, `fbr_readiness` refreshes.

### D6 — Standard-rate GST default and zero-tax / mismatch block

On FBR workspaces, standard-rate goods default to **18%** GST from the product FBR profile.

`FbrInvoiceLineCalculator` (create/update):

- **Omitted / null / empty** `tax_rate` → default from product FBR profile **and** report `fbr_adjustments: [{line_index, field: 'tax_rate', from, to, reason}]` (plus activity note when available)
- **Explicit numeric 0** on standard-rate / 3rd-schedule / reduced → keep **0** (never overwrite)
- Frontend line editor: typed 0% stays 0 with warning; empty rate takes profile rate on product pick

`FbrInvoiceTaxGuard` runs on **both validate and submit**:

- Sale types that require positive sales tax (standard-rate, 3rd-schedule, reduced): reject **0%** stored tax and reject when stored tax diverges from the FBR expected amount (never silently recomputes)
- Zero-rated / exempt: 0% allowed
- Non-FBR tenants: unaffected (no `fbr_adjustments` key)

### D7 — Draft → issued after submit

After a successful FBR submit, invoice status moves from **Draft** to the workspace’s issued/unpaid equivalent (via the normal send path, no email). Non-FBR drafts are unchanged.

### R2-1 — Submit inconsistency retry

When submit returns non-00 with **no** IRN after a recent successful validate (**00**) with the **same** `payload_hash` (within ~10 minutes), EloSync retries **once** (~2s delay, `submit_retry` / `retry_of`). Concurrent submits are blocked (`submission in progress`). Never retries when an IRN was returned or on HTTP 5xx success-looking bodies. If the retry also fails, return Invalid with an inconsistency message asking the user to try again — nothing was submitted. Config: `fbr.submit_inconsistency_retry_seconds`.

### R2-5 — Workspace currency default

`CustomerInvoiceService` create: FBR-entitled tenants default omitted currency to `workspaceCurrency()`; non-FBR stays previous USD-when-omitted behaviour.

### R2-8 — Payments only after FBR submit

On FBR-entitled tenants, create/update allocations and `post` for a payment are rejected with **422** when any allocated invoice lacks `fbr_invoice_number` (message explains submit/IRN is required first). Invoice detail exposes `fbr_payment_allowed` / `fbr_payment_block_reason` for FBR tenants only so the UI can disable **Record payment**. Non-FBR payment flows are unchanged. After a successful submit (IRN set), recording/posting a payment remains allowed and does not unlock the invoice or alter FBR fields.

## Batch 2 — Proforma on Estimates

Extends existing Estimates inside the FBR gate (no separate proforma model; Quotations untouched except non-FBR regression).

**Invariant:** Estimates never call FBR — no validate/submit endpoints, no FBR HTTP, no IRN, no `fbr_invoice_submissions` rows. Pest: `Http::assertNothingSent()` across create/update/send/accept/convert/pdf; FBR estimate routes 404/405.

| Area | Behaviour (FBR tenants only) |
|------|------------------------------|
| Fields | `payment_terms`, `delivery_terms`, `advance_terms` + optional `advance_percent` / `advance_amount`, `due_date`; line `fbr_further_tax_type` / `fbr_sale_type` |
| Estimated tax | Shared `FbrInvoiceLineCalculator` — per-line `estimated_sales_tax` / `estimated_further_tax`; totals `estimated_gst_total`, `estimated_further_tax_total`, `estimated_grand_total`. Example: 1200 @ retail 1500 × 18% → GST **270** / line **1470** |
| Display status | Derived `display_status` = `expired` when `valid_until` is before today (workspace TZ) and status is draft/sent; **stored** status unchanged |
| PDF | Banner `PROFORMA INVOICE — NOT A FINAL TAX INVOICE`; validity, due date, terms, estimated taxes; **no** FBR number/QR |
| Convert | Existing convert → **Draft** invoice, `fbr_validated` false, no IRN; then normal invoice validate/submit |

Non-FBR estimate request rules and resource shape unchanged.

## Payload notes

- Includes `sellerSTRN` / `buyerSTRN` when present
- Item `saleType` from product `sale_type`, else scenario `sale_type` (fallback `Goods at standard rate (default)`) — never blank (0046)
- Unregistered buyer + registered standard-rate → auto-switch toward unregistered scenario (SN002) when the catalog has it
- Further tax from line `fbr_further_tax_type` on value excl. ST; **blocked for Registered** buyers; `furtherTaxTotal` when > 0
- Prefer invoice-level `fbr_registration_scenario_id`, else first line product scenario
- `scenarioId` sent in **sandbox only** (omitted on live)
- Registered buyers require NTN + province at validate/submit; qty `min:1` when module entitled
- Void/edit/trash blocked when `fbr_invoice_number` is set on invoices **and** on FBR credit/debit notes; payment create/post gated until IRN (R2-8)

### Credit / debit note payload mapping

| EloSync | FBR DI field |
|---------|--------------|
| `fbr_note_type=credit_note` **or** `debit_note` | `invoiceType` = **`Debit Note`** (sandbox rejects `Credit Note` / 0003) |
| Original invoice `fbr_invoice_number` | `invoiceRefNo` |
| Credit note lines + product FBR profile / original invoice line | Same item fields as sale invoices (HS, UoM, rate, saleType, retail, SRO, …) |
| EloSync original invoice `number` | Kept on the credit note / PDF only (not substituted for `invoiceRefNo`) |
| Reason / remarks | Required by FBR (0027 / 0028 for `Others`) — sandbox gap still open |

Refuse validate/submit unless module entitled, original invoice has `fbr_invoice_number`, credentials pass the live guard, and buyer/product FBR data is present (same rules as invoices). Creating a credit note from an FBR-submitted invoice (module on) defaults `fbr_note_type` to `credit_note` and may copy line `product_id` / `customer_invoice_line_id`. Request field `fbr_note_type` is prohibited when the module is off.

## Open gaps (do not invent)

- Credit-note sandbox type/reason gap (`Credit Note` → 0003; reason/remarks 0027/0028)
- SN024 SRO pipe-typo in catalog data
- UoM aliases beyond catalog short name `Number` → `Numbers, pieces, units`
- Official FBR logo on PDF not implemented
- No dedicated item-level “SRO” `saleType` string beyond `sroScheduleNo` / `sroItemSerialNo`
- Bulk “Send N to FBR”, PDF watermark / month-year prefix (later batches — not shipped)

## Central API

`/api/central/v1/fbr-catalog/*` — HS/UoM CRUD + CSV import, scenarios list/store/import. No starter seed — operators import all rows. Central SPA: `/{centralPrefix}/fbr-catalog` (nav **Catalog → FBR Catalog**), 180s import timeout.

## Commands

- `php artisan fbr:sync-hs-uom {path}`
- `php artisan fbr:sync-scenarios {path}`
- `php artisan local:seed-fbr-qa-tenants` — **local-only** idempotent seed of `non-fbr-demo` + `fbr-demo` (never production; never touches `demo-crm`; never prints passwords/tokens)
- `php artisan local:fbr-backfill-submitted-status` — **local-only**, idempotent: finds Draft invoices that already have an FBR invoice number and moves them to the normal issued/unpaid status via `CustomerInvoiceService::send` (no FBR HTTP calls, no email, FBR fields unchanged). Options: `--tenant=fbr-demo`, `--dry-run`, `--force-local-demo`. Blocked in production.

## Services

- `App\Services\Tenant\Fbr\FbrCredentialService`
- `App\Services\Tenant\Fbr\FbrInvoiceService` — invoice + credit/debit note payload, validate, submit (+ inconsistency retry), buyer verify
- `App\Services\Tenant\Fbr\FbrSubmitInconsistencyGuard` — same-hash validate→submit mismatch detection
- `App\Services\Tenant\Fbr\FbrInvoiceTaxGuard` — positive-tax / amount-match guard for validate + submit
- `App\Services\Tenant\Fbr\FbrInvoiceLineCalculator` — line tax defaults / 3rd-schedule / estimate estimated tax
- `App\Services\Tenant\Fbr\FbrInvoiceReadiness` — computed checklist payload (incl. locked / post_submission_issues)
- `App\Services\Tenant\Fbr\FbrPaymentGuard` — payment create/post only after IRN (FBR tenants)
- `App\Support\Fbr\FbrBuyerFieldNormalizer` — shared buyer NTN/CNIC / registration / province normalisation
- `App\Support\Fbr\FbrSellerNtn` — seller save vs FBR-API length rules
- `App\Services\Local\LocalFbrQaTenantService` — local QA tenant seed
- `App\Support\Fbr\FbrPakistanProvinces` — 7 canonical provinces + aliases
- `App\Support\Fbr\FbrSaleTypes` / `FbrFurtherTaxTypes` / `FbrNoteTypes` — canonical DI lists
- `App\Services\Central\Fbr\FbrHsUomCatalogService`
- `App\Support\Pdf\DompdfOptionsFactory` — writable Dompdf `tempDir` / `fontCache` under `storage/`

## Tests

Under `tests/Feature/Tenant/FbrInvoicing/`:

- `FbrInvoicingModuleTest.php`
- `FbrInvoicingNonFbrRegressionTest.php` — non-FBR tenant gating
- `FbrInvoicingGatingAndSafetyTest.php` — FBR tenant gating / lock / live guard
- `FbrInvoicingSettingsHardeningTest.php` — credentials Live confirm, token hints (bullets), seller NTN / nic_validate, province aliases, blocked Live audit
- `FbrInvoicingQaRetest1Test.php` — zero-tax on validate+submit, readiness, backfill command, non-FBR 0% unaffected
- `FbrInvoicingQaRetest2Test.php` — submit inconsistency retry, readiness locked/post_submission_issues, workspace currency, tax_rate adjustments, blocked Live audit
- `FbrPaymentGuardTest.php` — payments blocked until IRN; non-FBR unchanged
- `FbrInvoicingCreditNoteTest.php`
- `FbrInvoicingPdfTest.php` — non-FBR and FBR PDF **200** (IRN + QR when submitted)

Also: `tests/Feature/Tenant/Estimate/EstimateFbrProformaTest.php`, `tests/Feature/Tenant/Company/CompanyFbrBuyerFieldsTest.php`, `CompanyFbrImportTest.php`, `ContactFbrBuyerFieldsTest.php`, `ContactFbrImportTest.php`.

Central catalog / sync tests unchanged. Frontend: `test:e2e:fbr-invoicing` (credentials smoke); line-editor / tour unit tests for tax-rate warning and page-scoped tour dismiss.

## Deployment cross-links

See [FBR Invoicing — Production readiness](/deployment/fbr-invoicing) for migrate list, `FBR_ALLOW_LIVE_LOCALLY`, catalog load, and pilot checklist. User-facing flows: [FBR Invoicing user guide](/user-guide/fbr-invoicing).
