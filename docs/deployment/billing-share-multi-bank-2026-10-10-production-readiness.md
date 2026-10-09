# Multi-bank remittance + public invoice/quotation share links — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-10 |
| **Status** | **Go for production** |
| **Scope** | Settings → Branding `invoice_bank_accounts` (multi-account enable/disable); guest share links for invoices & quotations (view + branded PDF); catalog **invoices 1.11.0 → 1.12.0**, **quotations 1.9.0 → 1.10.0** |
| **Companion** | [Invoices](/user-guide/invoices-overview) · [Quotations](/user-guide/quotations-overview) · [Tenant settings](/developer-guide/tenant-settings) · [Upgrade](/deployment/upgrade) · [CHANGELOG](/changelog/) |

---

## Executive summary

Workspaces can store up to ten remittance bank accounts and toggle which appear on invoice PDFs / guest share pages. Staff with send permission can mint opaque 90-day public share links; guests view the document and download the same branded Dompdf as CRM without logging in. Void (invoice) and reject/expire (quotation) clear tokens. Legacy flat `invoice_bank_*` keys still hydrate and sync from the **first enabled** account (cleared when none are enabled).

**Go / No-Go:** **Go**.

| Gate | Result |
|------|--------|
| Platform freeze (guest pages under existing SPA hash routes; no parallel shell) | **Pass** |
| Token opacity (SHA-256 hash in DB; plaintext only in mint URL) | **Pass** |
| Expiry (90 days) + void/reject/expire clear link | **Pass** — Pest |
| Entitlement-gated public routes (generic 404) | **Pass** |
| Rate limits (`document-share` / `document-share-pdf` by IP) | **Pass** |
| Multi-bank PDF + `payment_bank.bank_accounts` (enabled only) | **Pass** — Pest + headed e2e |
| Legacy sync when all accounts disabled | **Pass** — remediations A1 |
| Catalog migrate-only + CatalogSeeder companion | **Pass** — **1.12.0** / **1.10.0** |
| Docs + CHANGELOG same delivery | **Pass** |
| Playwright headed one-session | **Pass** — `npm run test:e2e:billing-share:headed` (4/4) |
| Pest (banks + share + catalog bump) | **Pass** |

## Findings

### Closed (audit remediations)

| ID | Severity | Finding | Resolution |
|----|----------|---------|------------|
| A1 | Medium | `toLegacyFlat()` fell back to a disabled account when none were enabled | Sync only from enabled accounts; all-disabled clears legacy keys + Pest |
| A2 | Medium | `document-share` throttle keyed by authenticated user id when present | Always key by IP (parity with PDF limiter) |
| A3 | Medium | No deployment readiness page / developer-guide lag on public share + multi-bank | This page + invoices developer guide + upgrade + VitePress index |
| A4 | Low | Bank remove control lacked accessible name for e2e | `aria-label="Remove account N"` + headed cleanup uses role |

### Accepted (intentional / ops — not defects)

| ID | Severity | Notes |
|----|----------|-------|
| R1 | Info | Guest JSON includes `contact_name` / `company_name` for document context; SPA bank block shows enabled remittance only |
| R2 | Info | **Copy share link** is on dedicated record pages (not list peeks) — matches billing peek rules |
| R3 | Ops | Deploy Backend + Frontend together; migrate-only — **do not** `db:seed` |
| R4 | Info | Quotation **Copy accept link** remains separate from public share |

## What shipped

### Backend

- Migration `2026_10_09_221135_add_public_view_tokens_to_billing_documents_table` (+ catalog bumps)
- `InvoiceBankAccounts` + settings validation / `TenantSettingService` sync
- `PublicInvoiceShareController` / `PublicQuotationShareController`; mint on invoice/quotation services
- PDF Payment Information loops enabled `bank_accounts`
- Rate limiters `document-share` / `document-share-pdf`
- Pest: `InvoiceBankAccountsSettingTest`, `CustomerInvoicePublicShareTest`, `QuotationPublicShareTest`, `InvoicesQuotationsPublicShareBumpTest`

### Frontend

- Settings → Branding multi-bank UI
- Invoice/quotation **Copy share link**; guest `/#/view/invoices|quotations/:token` + PDF
- Playwright: `e2e/tests/billing/billing.share-and-banks.headed.spec.ts` (`test:e2e:billing-share:headed`)

### Docs

- User / API / tenant-settings / changelog / upgrade / this readiness page

## Test evidence

```
herd php artisan test --compact tests/Feature/Tenant/Settings/InvoiceBankAccountsSettingTest.php tests/Feature/Tenant/CustomerInvoice/CustomerInvoicePublicShareTest.php tests/Feature/Tenant/Quotation/QuotationPublicShareTest.php tests/Feature/Central/Catalog/InvoicesQuotationsPublicShareBumpTest.php
```

Pest: **12 passed** (81 assertions).

```
E2E_BROWSER_CHANNEL=chrome E2E_VIDEO=off npm run test:e2e:billing-share:headed
```

Playwright headed (`--workers=1`, one workspace login): **4 passed** — banks (one disabled), invoice validation + share, guest invoice PDF, quotation share + guest PDF.

## Operator checklist

1. Deploy Backend → `php artisan migrate --force` (**do not** `db:seed`)
2. Confirm catalog: `invoices` **1.12.0**, `quotations` **1.10.0**
3. Deploy Frontend SPA
4. Smoke: Settings → Branding two banks / one disabled → send invoice → Copy share link → guest view + PDF (only enabled bank) → void → link 404; same for sent quotation share (accept link still works)

## Related

- [Upgrade](/deployment/upgrade)
- [Changelog](/changelog/)
- [Invoices developer guide](/developer-guide/invoices)
- [Tenant settings](/developer-guide/tenant-settings)
