# Storage — Deployment

## Migrate

```bash
php artisan migrate
```

Registers free `storage` + billable packs (`storage-10` … `storage-1000`), pack → storage dependencies, `storage.*` permissions, and grandfathers free Storage onto workspaces that already have Team Chat entitled.

## Disks (unchanged)

```dotenv
FILESYSTEM_DISK=s3
FILESYSTEM_BRANDING_DISK=public
# FILESYSTEM_AVATAR_DISK=public  # default
```

Content uploads (chat / feedback / imports) use the uploads/S3 disk and count toward quota. Branding + avatars stay on the VPS `public` disk and do not count.

Prefer a **dedicated Wasabi/S3 bucket** for EloSync tenant content (separate from SQL backups on the same account). Monitor sellable capacity; reserve headroom for ops backups.

## Gateway product mapping

For each billable pack × monthly/yearly cycle, map Stripe/Creem product/price IDs under Central → Payment Gateways → Product Mapping (`payment_gateway_module_prices`). Checkout fails closed when mapping is required and missing.

## Smoke checks

1. Install free Storage from Marketplace → Settings → Storage shows 1 GB allowance.
2. Upload a Team Chat attachment (or install Team Chat and confirm companion Storage).
3. Purchase a pack after cancelling any other pack; conflict message when a second pack is already active.
4. Confirm branding logo upload still works without a pack.

## Related

- [Object Storage](/developer-guide/object-storage)
- [Payment gateways](/developer-guide/payment-gateways)
- [Upgrade](/deployment/upgrade)
