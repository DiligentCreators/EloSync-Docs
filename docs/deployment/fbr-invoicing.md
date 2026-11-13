# FBR Invoicing — Production readiness

## Migrate

Run EloSync-Backend migrations (catalog registration, permissions, schema). No `db:seed` in production for catalog/RBAC.

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

CSV columns: `hs_code`, `unit_name`, `description`. UTF-8 BOM / Excel-quoted headers are accepted. Leading zeros on `hs_code` are preserved. Empty `unit_name` is stored as **Others**. Descriptions are `TEXT` (not capped at 255). Large imports may take ~1–2 minutes; the SPA request timeout is 180s.

The catalog starts empty (no seeded HS/UoM or scenarios). Load it after deploy via Central UI or artisan.

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
