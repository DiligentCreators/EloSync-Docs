# Sales document convert — production readiness

**Decision: Go** (migrate-first) · 19 Aug 2026

Catalog versions after migrate: **quotations 1.4.1**, **contracts 1.2.1**, **estimates 1.3.3**, **invoices 1.6.1**.

## Scope

One-shot quote/estimate convert-to-invoice, repeatable contract progress billing, and integrity hardening from the production readiness audit (lock races, soft-delete messaging, estimate entitlement, repeat-billing acknowledgement, unique `estimate_id`).

## Gates

| Gate | Result |
|------|--------|
| `lockForUpdate` on quote/estimate convert (+ linked quotation for estimates) | Pass |
| Unique nullable `customer_invoices.estimate_id` | Pass |
| Soft Invoices entitlement on estimate convert | Pass |
| Soft-deleted invoice blocks convert with restore/force-delete guidance | Pass |
| Contract 2nd+ bill requires `acknowledge_repeat_billing=true` | Pass |
| Estimates UI convert gated on `hasModule('invoices')` | Pass |
| Stop recurring refetches invoice detail before dialog | Pass |
| Pest convert / soft-delete / entitlement / acknowledge cases | Pass |
| Billing Playwright (prior session) | Pass (13/13) |

## Accepted by design

- `*.convert` does **not** require `invoices.create` (soft-convert pattern, same as PO → expense). Default admin/manager roles include both.
- `quotation_id` stays non-unique so contracts can bill repeatedly.
- Soft-deleted invoices still block one-shot convert (integrity). Ops restore or force-delete to unblock.

## Deploy

1. Backend: `composer install` (if needed) → `php artisan migrate` (unique `estimate_id` + catalog bumps through **1.4.1 / 1.2.1 / 1.3.3 / 1.6.1**).
2. Confirm scheduler still runs `invoices:generate-recurring` (unchanged).
3. Deploy Frontend after Backend (acknowledge payload + estimate Invoices gate + stop refetch).
4. Custom roles: ensure `quotations.convert` / `contracts.convert` / `estimates.convert` where needed (defaults updated earlier).

## Staging smoke

1. Send quote → convert → convert again → 422; soft-delete invoice → convert still 422 with “in trash” message; force-delete → convert allowed again.
2. Estimate without Invoices entitled → convert 422 on `estimate`.
3. Active contract → create invoice (no acknowledge) → create again without flag → 422 on `acknowledge_repeat_billing` → with `true` → 201.
4. Recurring invoice: send → generate → Stop recurring shows void-latest checkbox when a draft child exists.

## Rollback

- Revert SPA first if API clients cannot send `acknowledge_repeat_billing`.
- Do not drop the unique `estimate_id` index in production without a data plan; down migration exists for local only.

## Related

- [Upgrade](/deployment/upgrade) · [Changelog](/changelog/) · [Quotations API](/api/tenant-v1-quotations) · [Contracts API](/api/tenant-v1-contracts) · [Estimates API](/api/tenant-v1-estimates)
