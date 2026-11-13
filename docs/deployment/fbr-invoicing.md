# FBR Invoicing — Production readiness

## Migrate

Run EloSync-Backend migrations (catalog registration, permissions, schema). No `db:seed` in production for catalog/RBAC.

## Catalog load

After deploy, load the full FBR HS↔UoM CSV once:

```bash
php artisan fbr:sync-hs-uom /secure/path/fbr-hs-uoms.csv
php artisan fbr:sync-scenarios /secure/path/fbr-scenarios.csv
```

Starter rows ship for local/CI only.

## Pilot checklist

1. Entitle **invoices**, **products**, **fbr-invoicing** for the pilot workspace
2. Billing → FBR Invoicing → paste **Sandbox** token; save
3. Set company buyer FBR fields; create product FBR profile (HS/UoM from catalog)
4. Create invoice → Validate → Submit; confirm `fbr_invoice_number` and PDF
5. Repeat with Live token only after sandbox success

## Secrets

Do not log tokens. Credentials use Eloquent `encrypted` casts on `fbr_workspace_credentials`.

## Verdict

**Go** for sandbox pilots after migrations + starter/full catalog load + Pest green.
