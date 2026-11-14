# FBR Invoicing — Production readiness

## Migrate

Run EloSync-Backend migrations (catalog registration, permissions, schema), including additive:

- `sale_type` on `fbr_registration_scenarios`
- `fbr_registration_scenario_id` on `customer_invoices`
- `sandbox_reg_type_url` / `live_reg_type_url` on `fbr_workspace_credentials`
- Environment-change audit columns on `fbr_workspace_credentials` (`environment_changed_at`, `environment_changed_by`, `updated_by`) when present
- `sale_type` on `product_fbr_profiles`
- `fbr_further_tax_type` on `customer_invoice_lines`
- `customer_credit_notes` FBR columns + line `product_id` / `customer_invoice_line_id`
- nullable `customer_credit_note_id` on `fbr_invoice_submissions`
- `payload_hash` / `retry_of` on `fbr_invoice_submissions` (submit inconsistency retry)
- Proforma fields on `estimates` (`payment_terms`, `delivery_terms`, `advance_terms`, `advance_percent`, `advance_amount`, `due_date`) and `estimate_lines` (`fbr_further_tax_type`, `fbr_sale_type`)
- Additive nullable FBR buyer columns on companies/contacts

No `db:seed` in production for catalog/RBAC. Never run `local:seed-fbr-qa-tenants` (or any `local:*` demo command) in production.

Ensure Dompdf writable dirs exist after deploy (auto-created by `App\Support\Pdf\DompdfOptionsFactory` when PDFs run): `storage/framework/dompdf`, `storage/fonts` (git-ignored).

## Environment

Optional keys (names only — never put tokens in docs/commits):

```bash
# Allow Live FBR validate/submit/buyer-verify from APP_ENV=local|testing (default false)
FBR_ALLOW_LIVE_LOCALLY=false

# Seconds to wait before a single automatic submit retry on inconsistent sandbox results (default 2)
FBR_SUBMIT_INCONSISTENCY_RETRY_SECONDS=2
```

With the default, Live cannot be selected or called from local/testing. Production/staging allow Live after admin confirmation (`confirm_text=LIVE`). Blocked Live-switch attempts are audited (`fbr_credentials.environment_switch_blocked`).

## Catalog load

After deploy, load the full FBR HS↔UoM catalog once. Prefer the **Central SPA** (no SSH required):

1. Sign in to Central → **Catalog → FBR Catalog**
2. **Import HS/UoM** (and optionally **Import scenarios**)
3. Confirm the toast counts (`created` / `updated` / `skipped` / `defaulted_unit`)

API equivalent: `POST /api/central/v1/fbr-catalog/hs-uoms/import` (multipart `file`) with `modules.update`.

Optional CLI (same importer):

```bash
php artisan fbr:sync-hs-uom /secure/path/fbr-hs-uoms.csv
php artisan fbr:sync-scenarios /secure/path/fbr-scenarios.csv
```

CSV columns: `hs_code`, `unit_name`, `description`. Scenario CSV: `scenario_id`, `buyer_registration_type`, optional `sale_type`. UTF-8 BOM / Excel-quoted headers are accepted. Leading zeros on `hs_code` are preserved. Empty `unit_name` is stored as **Others**. Descriptions are `TEXT` (not capped at 255). Large imports may take ~1–2 minutes; the SPA request timeout is 180s.

The catalog starts empty (no seeded HS/UoM or scenarios). Load it after deploy via Central UI or artisan — an empty catalog means tenant HS pickers return nothing.

## Pilot checklist

1. Entitle **invoices**, **products**, **fbr-invoicing** for the pilot workspace (optional **estimates** for proforma)
2. Billing → FBR Invoicing → paste **Sandbox** token (leave blank later to keep it; UI shows bullets + last-4 only); set **seller address** (required — settings amber warning + readiness flag; validate/submit blocked while empty); seller NTN 7–9 digits or CNIC 13 digits (add NIC validation when NTN length is not 7/13); province from the 7 canonical names (aliases accepted); save; confirm seller-registration warning when neither is FBR-usable
3. Confirm environment badge, admin-only Live switch with typed `LIVE`, blocked-attempt audit, and environment-change meta (who/when)
4. Buyer fields on company/contact; Verify with FBR → Registered / Unregistered / Not found (or informational sandbox status — never auto-Registered on failure); set type manually if needed
5. Optional FBR columns on company/contact import; row-level errors; no Verify during import
6. Product FBR profile: HS search, sale type, **18%** default for standard-rate, retail visible for 3rd schedule
7. Invoice qty ≥ 1; further tax only for unregistered; readiness checklist from saved data (NTN optional for Unregistered; seller address ok); line editor: typed 0% stays 0 with amber reject warning, empty rate → profile note; empty tax rate defaults from profile with notification; explicit 0% kept and blocked on Validate/Submit for standard-rate/3rd-schedule; Validate (status code + `Invoice: …` / deduped per-line item errors; one automatic retry when FBR contradicts the invoice, then try-again) → Submit (one automatic inconsistency retry if sandbox contradicts a matching validate); Draft→issued/unpaid, `fbr_invoice_number`, PDF IRN + QR; readiness stays read-only after submit
8. Confirm Edit/Void/Trash hidden on page/list/drawer/bulk + API blocked; **Record payment disabled until IRN** (API 422); after IRN, partial/full payments (and void payment) work without unlocking FBR fields; email PDF with IRN/QR; WhatsApp share only when `whatsapp-cloud` entitled; issue credit/debit note → Validate → Submit (FBR type Debit Note + invoiceRefNo)
9. Estimates (if entitled): proforma banner, terms, estimated GST (1200 @ retail 1500 × 18% → 270 / 1470), Expired display from validity, convert → Draft invoice (issue date today, due date + payment terms copied, further tax in total) then Validate/Submit; no FBR HTTP on estimates
10. Companies/contacts/products: trash + restore; permanent delete refused when used on an FBR-submitted document; unreferenced records still force-deletable
11. Repeat with Live token only after sandbox success (and never from local/testing without `FBR_ALLOW_LIVE_LOCALLY`)
12. Confirm a non-FBR workspace shows unchanged invoices/contacts/companies/estimates/import/payments/share (no FBR UI or API keys)
13. Local QA only: `php artisan local:seed-fbr-qa-tenants` seeds `non-fbr-demo` / `fbr-demo` (never production; never mutates `demo-crm`). Use **log mail** (`MAIL_MAILER=log`) and **no real WhatsApp** send — share uses `wa.me` only when WhatsApp is entitled

## Secrets

Do not log tokens. Credentials use Eloquent `encrypted` casts on `fbr_workspace_credentials`. API responses expose only `has_*_token` and masked bullet + last-4 hints — never raw tokens or passwords in examples/logs.

## Verdict

**Go** for sandbox pilots after migrations + catalog load + Pest green (`tests/Feature/Tenant/FbrInvoicing/*`, `EstimateFbrProformaTest`, including settings hardening, QA retest 1–3, Batch 3, payment guard, PDF, and gating). Bulk send / watermark / month-year prefix remain **not** shipped (Batch 4+).
