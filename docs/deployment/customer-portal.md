# Customer Portal — Production Guide

## Licensing

- Catalog slug: `customer-portal`
- Category: `operations`, free Marketplace opt-in
- `is_default_included = false`, `is_billable = false`, version **1.0.0**
- **Hard dependency:** `contacts` (`module_dependencies`)
- Soft sections: invoices, payments, quotations, contracts, help-desk

## Bootstrap

1. Migrate catalog registration, permissions, `portal_users`, password-reset tokens, Help Desk `portal_user_id` (**help-desk → 1.13.0**)
2. Install **Contacts** then **Customer Portal** from Marketplace (dependency resolver enforces Contacts)
3. Grant `customer-portal.*` via permission migration / default role maps — do **not** re-seed roles

## Deploy checklist

1. `php artisan migrate --force` (no `db:seed` on production upgrades)
2. Confirm `portal-api` guard + `portal_users` provider in `config/auth.php` are deployed
3. Deploy Frontend with `/#/portal/*` routes and staff `/customer-portal`
4. Smoke: install Contacts + Customer Portal → invite Contact with email → accept invite → login → open invoice PDF (if Invoices entitled) → create Help Desk ticket (if Help Desk entitled)
5. Smoke: disable portal user → login fails; enable → login works
6. Smoke: document without contact/company does not appear in portal lists

## Monitoring

- Mail: portal invite + password reset notifications
- Auth throttles on portal login / invite / reset / `POST /api/central/v1/public/portal-workspaces`
- Platform audit: follow existing tenant login patterns if extended later

## Related

- [Production readiness](/deployment/customer-portal-1-0-0-production-readiness)
- [Product Roadmap](/getting-started/product-roadmap)
