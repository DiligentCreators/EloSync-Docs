# Payment Gateways (workspace)

Connect **your** Stripe, Creem, or Kelviq account so customers can pay unpaid invoices from the Customer Portal. This is separate from EloSync Marketplace billing (Central → Payment Gateways).

## Requirements

- Install **Payments** (required dependency)
- Install **Payment Gateways** from Marketplace (free, not default-included)
- Optional: **Customer Portal** for Pay now

You need `payment-gateways.view` to open the page and `payment-gateways.manage_integrations` to configure gateways (admin/manager by default).

## Setup

1. Marketplace → install **Payment Gateways** (Payments must already be installed).
2. Open **Billing → Payment Gateways**.
3. For each provider you want:
   - **Configure** → paste sandbox/live keys and webhook secret
   - Creem also needs an **invoice product ID** (one-time product used with dynamic amount)
   - Kelviq also needs an **invoice plan identifier**
   - Enable the gateway → **Save** → **Test connection**
4. Point the provider’s webhook to the URL shown (or use **Copy webhook URL**).
5. **Set as default** on one ready gateway (used when the customer does not pick another).

You can enable **multiple** gateways. Customers see every ready gateway on the portal invoice and can choose; the workspace default is pre-selected.

## Portal Pay now

On an unpaid invoice in the Customer Portal:

- One ready gateway → **Pay now**
- Several ready gateways → pick a provider, then **Pay now**

Successful checkout posts a gateway payment on the Payments ledger and applies it to the invoice.

## Tips

- Keep sandbox mode until you verify webhooks end-to-end.
- Disconnect clears secrets for that provider only; other gateways stay configured.
- Staff refunds for Stripe-captured payments still use **Refund via Stripe** on the payment record.
