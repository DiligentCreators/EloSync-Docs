# Invoices 1.1.0 — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-08-15 |
| **Status** | **Go** — staging → production after CI, migrate, and scheduler confirm |
| **Scope** | Tenant Invoices module `invoices` **1.0.0 → 1.1.0** (recurring series + PDF) |
| **Branch** | `feature/recurring-invoices-pdf` |
| **Companion** | [Invoices production](./invoices) · [Developer](/developer-guide/invoices) · [User](/user-guide/invoices) · [API](/api/tenant-v1-invoices) |

This is an additive MINOR on the existing customer-invoice module (not Stripe/Cashier, not Central `Invoice`). No new permissions or queues. Optional `INVOICES_*` env vars have production-safe defaults.

---

## Executive summary

Workspaces that already entitled Invoices pick up recurring + PDF after migrate. Catalog bump does **not** auto-install for workspaces that never entitled the module.

| Gate | Result |
|------|--------|
| `module:invoices` + `invoices.*` (no new family) | **Pass** |
| PDF `invoices.view` + assignee scope + `throttle:invoices-pdf` | **Pass** |
| Stop series `invoices.update`; optional void `invoices.void` | **Pass** |
| Workspace timezone due generation | **Pass** |
| Idempotent daily generate + unique `(tenant, source, issue_date)` | **Pass** |
| Soft-deleted occurrence does not unique-fail the tenant run | **Pass** (F1) |
| Generator `chunkById` + per-tenant time budget | **Pass** (F2) |
| PDF cache + warm job on send (default queue) | **Pass** (F3) |
| Catch-up cap 52 + remaining periods next tick | **Pass** (F4) |
| Command **FAILURE** if any tenant series fails | **Pass** (F5) |
| Invoice memo on Overview + PDF | **Pass** (F6) |
| Headed e2e stop with `void_latest_unpaid` | **Pass** (F7) |
| Dompdf `isRemoteEnabled=false`, Blade escaped | **Pass** |
| Catalog `1.1.0` migrate-only | **Pass** |
| Pest recurrence | **Pass** |
| Playwright headed one-session | **Pass** (5) |
| Docs + upgrade + runbook | **Pass** |

**Go / No-Go:** **Go** after companion CI, `composer install`, `php artisan migrate --force`, and confirming `invoices:generate-recurring` is on the production scheduler.

---

## Findings

| ID | Severity | Status | Finding | Action |
|----|----------|--------|---------|--------|
| F1 | Medium | **Fixed** | `alreadyIssued` ignored soft-deleted children, so retrying the same `issue_date` could hit the unique index and abort that tenant’s remaining series | `withTrashed()` + per-series `try/catch`; Pest |
| F2 | Medium | **Fixed** | Generator `get()`s all due series roots | `chunkById` (`INVOICES_RECURRING_CHUNK_SIZE`, default 100) + per-tenant time budget |
| F3 | Medium | **Fixed** | PDF is synchronous Dompdf on the request | Cache by id + `updated_at`; `WarmCustomerInvoicePdfJob` on send (default queue); `throttle:invoices-pdf` |
| F4 | Low | **Fixed** | Catch-up cap was 12 periods per run | Default **52**; remaining due periods run on the next daily tick; Pest cap=1 then two artisan runs |
| F5 | Low | **Fixed** | Command logged `tenant_failed` and still exited 0 | Returns `FAILURE` if any entitled tenant had a failed series or exception |
| F6 | Low | **Fixed** | Invoice memo (`notes`) was on the PDF only | Overview shows the memo; Notes tab remains the activity stream |
| F7 | Low | **Fixed** | Headed e2e stopped a series without `void_latest_unpaid` | Generate a child from Playwright (tenant-scoped tinker), then check the void checkbox |

### Accepted / intentional

| Item | Notes |
|------|-------|
| No new permissions | Reuse `invoices.view` (PDF), `invoices.update` (stop), `invoices.void` (optional child void) |
| Generated invoices are **Draft** | Operator sends; no auto-email |
| Stopping does not void paid history | Optional checkbox only voids latest unpaid generated draft/sent |
| No stored `pdf_path` | Rendered on the fly (cached) |
| No new queue name | Warm job uses the **default** Redis queue |
| Emailing invoices | Deferred (roadmap) |

---

## Test evidence

| Suite | Result | Notes |
|-------|--------|-------|
| `php artisan test --compact tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceRecurrenceTest.php` | **13 passed** | Activate on send, frequency required, generate + idempotent, timezone, stop, stop+void, reject stop on child, PDF + cache hit, PDF 403, catch-up cap, soft-delete skip, schedule registration, command failure exit |
| `npm run test:e2e:invoices:headed` | **5 passed (~7.5m with headed slowMo)** | One login session |

**Headed e2e (single session):** empty/title-only validation; all five frequencies; create with tax totals; lines/Overview memo/timeline; edit; PDF from sheet and row menu; send; Sent KPI; void; recurring generate + stop with optional void; `n` / `Ctrl+F`; delete/restore; My invoices filter.

---

## Deploy order

1. **Backend** — `composer install` (pulls `dompdf/dompdf`) then `php artisan migrate --force` (recurrence columns + catalog `1.1.0`)
2. Confirm scheduler: `invoices:generate-recurring` daily, `withoutOverlapping(120)`, `onOneServer`
3. Optional env only if you need to tune catch-up / PDF (see [Invoices production](./invoices#optional-env))
4. **SPA** — recurring form, stop dialog, Download PDF, Overview memo
5. **Docs**
6. Staging smoke below before production traffic

Suggested merge: **Backend → Frontend → Docs**. Do **not** `db:seed`.

---

## Pre-flight checklist

| # | Check | Owner | Pass? |
|---|-------|-------|-------|
| 1 | `composer install` includes `dompdf/dompdf` | Ops | ☐ |
| 2 | Migrations applied (`add_recurrence_to_customer_invoices` + bump `1.1.0`) | Ops | ☐ |
| 3 | Catalog `invoices` version `1.1.0` | Ops | ☐ |
| 4 | Scheduler has `invoices:generate-recurring` | Ops | ☐ |
| 5 | Pest recurrence + existing `CustomerInvoiceTest` green in CI | Eng | ☐ |
| 6 | Playwright `test:e2e:invoices` green | QA | ☐ |
| 7 | Staging smoke signed off | QA / Ops | ☐ |

---

## Staging smoke (human)

1. Marketplace → Invoices already installed (or install free)
2. New invoice → empty submit shows Title + Description required
3. Recurring on → frequencies Weekly / Monthly / Quarterly / Semi-annually / Yearly
4. Create draft with a line and a memo → Overview shows the memo → **Download PDF** (opens a `.pdf`)
5. Send recurring invoice → badge Recurring, **Next invoice**, **Stop recurring**
6. `php artisan invoices:generate-recurring` → a **Draft** child appears for the next period
7. Stop recurring and check **Also void the latest unpaid generated invoice**
8. Void a sent non-recurring invoice
9. Soft-delete → Deleted only → Restore

---

## Rollback

| Layer | Action |
|-------|--------|
| Frontend | Redeploy previous SPA (recurring/PDF UI disappears; API columns remain) |
| Backend code | Redeploy previous release; keep additive migrations |
| Module disable | Marketplace uninstall (invoice rows retained) |
| Schema | Do **not** roll back recurrence columns in prod without a data plan |
| Scheduler | Removing the command stops new drafts; existing series rows stay |

---

## Monitoring

- Domain timeline: `recurrence_started`, `recurrence_stopped`, `recurrence_generated`
- Logs: `invoices.generate-recurring.tenant_failed`, `invoices.generate-recurring.series_failed`, `invoices.generate-recurring.time_budget_reached`, `invoices.pdf.rendered`, `invoices.pdf.warm_failed`
- Nightwatch: `invoices:generate-recurring` duration and **non-zero exit**; `GET invoices/{id}/pdf` latency
- Spatie log name `customer_invoices`

---

## Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Engineering | | | **Go** / No-Go |
| Product | | | F1–F7 fixed |
| Ops | | | Staging migrate + scheduler + smoke ☐ |

**Recommendation:** Merge companions after CI green; run staging smoke.
