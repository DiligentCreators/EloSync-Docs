# Payments Stripe refunds (1.7.0) — Production Readiness Audit

| Field | Value |
|-------|--------|
| **Date** | 2026-10-17 |
| **Status** | **Go for production** — feature Pest green; headed payments Playwright **10/10** |
| **Scope** | Live Stripe refunds for gateway customer payments; ledger, invoice allocations, and accounting stay in sync |
| **Catalog** | **payments 1.6.0 → 1.7.0** |
| **Companion** | [Payments user guide](/user-guide/payments) · [Payments developer guide](/developer-guide/payments) · [Payments API](/api/tenant-v1-payments) · [CHANGELOG](/changelog/) |

---

## Executive summary

Posted payments with `gateway_provider=stripe` refund the captured PaymentIntent on the **workspace** Stripe account, then record the existing ledger refund. Cash, bank, cheque, and other methods stay ledger-only. A Stripe Dashboard refund is recorded once when `refund.created` arrives.

**Go / No-Go:** **Go.** Migrate-only. No new permission. Central Cashier is not used. Operators add `refund.created` to the existing customer-payments webhook.

| Gate | Result |
|------|--------|
| Platform freeze | **Pass** |
| Stripe call happens before the ledger write; a Stripe error leaves the payment posted | **Pass** (Pest) |
| Manual refund never calls Stripe | **Pass** (Pest) |
| Checkout Session id (`cs_`) is resolved to a PaymentIntent and stored | **Pass** (Pest) |
| Duplicate `refund.created` does not double `amount_refunded` | **Pass** (Pest) |
| Secret key follows `gateway_mode`, then the capture note, then the current connection mode | **Pass** (code review) |
| `payments.refund` still authorizes the staff route | **Pass** (existing Pest) |
| Catalog migrate-only bump + CatalogSeeder companion **1.7.0** | **Pass** (Pest) |
| Refund dialog explains an empty, zero, or over-balance amount and keeps submit disabled | **Pass** (headed Playwright) |
| Ledger refund of $20 on an $80 posted payment restores $20 of invoice balance and shows the refund row | **Pass** (headed Playwright, Accounting installed on the demo workspace) |
| Stripe payment shows **Refund via Stripe** and does not submit a live charge | **Pass** (headed Playwright) |
| Payments Playwright, headed, one worker | **Pass** — **10/10** (`test:e2e:payments:headed`) |

Feature Pest on 2026-10-17: **14 passed / 99 assertions** (Stripe refund, existing ledger refund, portal checkout, catalog 1.6.0 and 1.7.0 bumps).

---

## Security summary

| Control | Status |
|---------|--------|
| `POST /payments/{id}/refund` still requires `payments.refund` | Pass |
| Workspace secret keys stay on `TenantStripeApi`; Central `StripeGateway` is not called | Pass |
| Webhook still verifies the active-mode signing secret before `refund.created` | Pass |
| Unknown PaymentIntents are ignored | Pass |
| `stripe_refund_id` is unique, so a staff refund and the webhook cannot both insert | Pass |
| Refund responses expose the Stripe refund id, not the secret key | Pass |

---

## Findings disposition

| ID | Severity | Item | Disposition |
|----|----------|------|-------------|
| **F1** | Medium | Refund submit was disabled for a bad amount with no explanation | **Fixed** — the dialog shows “Enter a refund amount.”, “Refund amount must be greater than zero.”, or “Refund amount cannot exceed the refundable balance.” Headed test covers all three and then records a $20 ledger refund |
| **I1** | Info | A new refund attempt uses a new idempotency key. If Stripe succeeds and the ledger write fails, a retry can refund again until `refund.created` books the first id | **Accepted** — webhook `refund.created` is required in the go-live steps. The unique `stripe_refund_id` stops a double ledger row |
| **I2** | Info | Playwright’s bundled ffmpeg download timed out, so the workflow spec runs on system Chrome with video off | **Accepted** — not a product defect. Authz and Stripe specs passed in the same headed run |

---

## Headed browser coverage

`npx playwright test e2e/tests/payments --project=tenant --headed --workers=1` on 2026-10-17. Result: **10 passed**.

One demo login inside the payments workflow, then the Stripe shared-session spec and the send-permission spec:

1. Create a payment, allocate it to an invoice, post it
2. Open **Record refund**, clear the amount, enter an amount over the balance, confirm both errors, cancel
3. Download and email the receipt, void the payment, confirm the invoice returns to unpaid
4. Open a Stripe-captured payment, confirm **Refund via Stripe**, enter 0, confirm the error, cancel without calling Stripe
5. Post an $80 cash payment, submit a $20 refund, confirm “Refund recorded”, “partially refunded”, the $20 refund row, and the invoice balance of $20
6. Stripe dialog: enable without keys, save sandbox keys, bogus live secret fails the connection test, disconnect
7. Staff without `payments.send` can download a receipt and cannot email it

---

## Upgrade

1. `php artisan migrate --force` — `gateway_mode`, `stripe_refund_id`, catalog **1.7.0**. Do not `db:seed`.
2. Deploy the SPA and hard-refresh.
3. Add `refund.created` to the workspace Stripe webhook. Keep the Checkout events.
4. Sandbox smoke: portal Pay now, then **Refund via Stripe** for a partial amount.
