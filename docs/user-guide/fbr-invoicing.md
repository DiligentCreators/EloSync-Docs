# FBR Invoicing

Pakistan **FBR Digital Invoicing** compliance for EloSync workspaces. Install the free Marketplace module **FBR Invoicing**, configure seller credentials, attach HS/UoM profiles to products, then **Validate** and **Submit** from a customer invoice.

## Prerequisites

- Marketplace entitlement: **Invoices** and **Products** (hard dependencies)
- Optional: **Companies** / **Contacts** for buyer NTN, STRN, registration type, and province
- FBR sandbox or live API token from the FBR Digital Invoicing portal

## Configure credentials

Billing → **FBR Invoicing**:

1. Enter seller business name, NTN/CNIC, STRN, province, and address
2. Choose **Sandbox** or **Live**
3. Paste the matching API token (leave blank later to keep the saved token)
4. Save

Tokens are encrypted at rest. HS codes and units of measure come from a **platform-wide catalog** (not per-workspace lists).

## Buyer details

When FBR Invoicing is installed, company (and contact) forms show FBR buyer fields: NTN/CNIC, STRN, registration type (`Registered` / `Unregistered`), and province. Link the invoice to that company or contact before submitting.

## Product FBR profile

Each invoiced product needs an FBR profile (HS code, UoM, tax rate string, scenario). Use the tenant API `PUT /fbr-invoicing/products/{id}/profile` or the product UI when available. Pick HS codes from the shared catalog; UoM options filter by HS code.

## Validate and submit

On an invoice detail page (with the module entitled):

1. **Validate with FBR** — must succeed before submit
2. **Submit to FBR** — stores the FBR invoice number; resubmit is blocked
3. PDF shows **FBR Invoice No** when present

Times use Settings → General → Timezone for display of validation/submission timestamps.

## Updating the HS/UoM catalog

Platform operators manage the shared catalog from **Central → Catalog → FBR Catalog** (starts empty — nothing is pre-seeded):

1. Download **Sample HS/UoM** / **Sample scenarios** (also inside each import dialog)
2. Import CSV, or use **New HS/UoM** / **New scenario**
3. Edit or delete any row from the table actions menu

HS/UoM CSV columns: `hs_code`, `unit_name`, `description`. Scenario CSV columns: `scenario_id`, `buyer_registration_type`. Codes that start with zero stay intact. Rows with a blank unit are imported as **Others**. One update applies to every workspace.

CLI remains available for automation: `php artisan fbr:sync-hs-uom` / `fbr:sync-scenarios`.
