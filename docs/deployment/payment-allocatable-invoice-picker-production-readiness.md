# Payment create hides fully paid invoices — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-18 |
| **Status** | **Go for production** — feature Pest green; headed payments Playwright **10/10** |
| **Scope** | Payment create allocation picker omits fully paid (and cancelled) invoices; edit keeps already-allocated invoices |
| **Catalog** | No bump (picker/API query filter only) |
| **Companion** | [Payments user guide](/user-guide/payments) · [Payments developer guide](/developer-guide/payments) · [Invoices API](/api/tenant-v1-invoices) · [CHANGELOG](/changelog/) |

---

## Executive summary

When recording a new customer payment, the invoice allocation picker must only offer invoices that can still accept money. Fully paid invoices (`status=paid` or `balance_due = 0`) and cancelled invoices are excluded. Draft and unpaid invoices with a remaining balance remain selectable. Editing a **draft** payment still shows invoices already allocated on that payment so existing rows do not disappear from the select.

**Go / No-Go:** **Go.** Deploy Backend + Frontend together. No migrate. No new permission.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| `GET /invoices?allocatable=1` returns only `balance_due > 0` and excludes `paid` / `cancelled` | **Pass** (Pest) |
| Create payment SPA requests `allocatable=1` | **Pass** (code review) |
| Client filter hides paid/cancelled and keeps `balance_due > 0` | **Pass** (Vitest) |
| Edit keeps already-allocated invoice ids even when paid | **Pass** (Vitest) |
| Create form still validates empty amount | **Pass** (headed Playwright) |
| Paid invoice number absent from picker; open invoice present | **Pass** (headed Playwright) |
| Existing payments workflow (allocate, post, refund validation, void) | **Pass** (headed Playwright suite) |

---

## Security summary

| Control | Status |
|---------|--------|
| Allocatable list still requires `invoices.view` / `viewAny` | Pass |
| Assignee scope on invoice list unchanged | Pass |
| Post still rejects paid/cancelled allocations server-side | Pass (existing `CustomerPaymentService::post`) |
| No new endpoints or permissions | Pass |

---

## Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **F1** | Medium | Create payment allocation picker listed fully paid invoices | **Fixed** — API `allocatable=1` + SPA filter |
| **I1** | Info | Edit mode loads unfiltered `per_page=100` and keeps allocated ids client-side | **Accepted** — draft edits are rare; post still rejects invalid allocations |
| **I2** | Info | Local headed run may need `CI=1` so Playwright starts Vite when port 5173 is down | **Accepted** — operator note only |

---

## Headed browser coverage

`CI=1 npm run test:e2e:payments:headed -- --workers=1` on 2026-10-18. Result: **10 passed**.

Authz and Stripe specs each use one demo login (shared session within the file). The payments workflow uses one demo login for the serial path:

1. Create form: submit without amount → **Amount is required** (field error under `#main-content`)
2. Allocation picker: fully paid invoice number → no options / empty; open unpaid invoice still listed
3. Create payment, allocate to open invoice, post
4. Refund dialog validation (empty / over-balance), receipt PDF + email, void
5. Stripe dialog enable/save/live-fail/disconnect + portal online payment flag
6. Staff without `payments.send`: download receipt allowed, email hidden / API forbidden

---

## Upgrade

1. Deploy Backend (no migrate).
2. Deploy Frontend SPA and hard-refresh.
3. Smoke: open **Payments → New**, allocate — a paid invoice number must not appear; an unpaid invoice with balance must appear.
