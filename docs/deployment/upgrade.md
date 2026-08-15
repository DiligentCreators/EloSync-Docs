# Upgrade Guide

How to ship application releases to existing production installations without reseeding.

## Standard upgrade

```bash
php artisan down --retry=60   # optional
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
php artisan queue:restart
php artisan reverb:restart   # if Reverb is running
php artisan up
```

That is the complete path for catalog modules and tenant permission vocabulary changes that follow the platform pattern.

## What migrate does for modules & RBAC

| Change type | Mechanism | Safe for existing data? |
|-------------|-----------|-------------------------|
| New default-included module | Data migration + `DefaultModuleRegistrar` | Yes — insert-only catalog; install only if workspace never had a subscription row |
| New permissions | Data migration + `TenantPermissionSynchronizer` | Yes — additive grants only; never resets customized roles |
| Schema | Normal Laravel migrations | Follow usual migration discipline |

## Do not run in production upgrades

- `php artisan db:seed`
- `CatalogSeeder` / Central catalog seeders to “pick up” new modules
- Role/permission seeders to “sync” RBAC
- Manual SQL that reactivates cancelled module subscriptions
- Any process that expects login to repair missing permissions

## Invoices 1.2.0 (status model)

After migrate:

1. Confirm catalog `invoices` version is `1.2.0`
2. Confirm existing invoice rows remapped (`sent`/`partial` → `unpaid`, `void` → `cancelled`)

## Invoices 1.1.1 (branded PDF settings)

After migrate:

1. Confirm catalog `invoices` version is `1.1.1`
2. Operators can fill Settings → Branding → Invoice company profile / payment details for PDF chrome

## Invoices 1.1.0 (recurring + PDF)

After migrate:

1. Confirm catalog `invoices` version is at least `1.1.0` (prefer `1.1.1` after the branded PDF polish migrate)
2. Confirm scheduler includes `invoices:generate-recurring` (daily, `withoutOverlapping(120)`, `onOneServer`)
3. `composer install` must include `dompdf/dompdf` for PDF download
4. Optional env (defaults are fine): `INVOICES_RECURRING_CATCHUP_CAP` (52), `INVOICES_RECURRING_CHUNK_SIZE` (100), `INVOICES_RECURRING_TIME_BUDGET_SECONDS` (45), `INVOICES_PDF_CACHE_SECONDS` (300), `INVOICES_PDF_PER_MINUTE` (30)
5. Treat a non-zero `invoices:generate-recurring` exit as a tenant-series failure — see logs `invoices.generate-recurring.tenant_failed`

See [Invoices 1.1.0 production readiness](/deployment/invoices-production-readiness).

## Storage module (2026-08-13)

After migrating Storage:

1. Map gateway prices for each billable pack (`storage-10` … `storage-1000`) × monthly/yearly
2. Confirm `FILESYSTEM_BRANDING_DISK=public` and uploads on S3/Wasabi
3. Workspaces that already had Team Chat receive free Storage automatically (grandfather migration)
4. New workspaces install free Storage from Marketplace when they need content uploads

See [Storage deployment](/deployment/storage).

## New workspaces after upgrade

`TenantProvisioningService` continues to:

1. Install every published `is_default_included` module
2. Provision default roles/permissions via `TenantAuthorizationProvisioningService`
3. Create the owner via `TenantAuthBootstrapService` (no RBAC mutation on later logins)

## Multi-Provider Email Delivery

After pulling a release that includes multi-provider email:

```bash
composer install --no-dev --optimize-autoloader   # pulls symfony/postmark-mailer + mailgun-mailer
php artisan migrate --force                       # email_logs tables + email-logs.* permission grants
php artisan email:migrate-tenant-mail-modes       # optional; --dry-run first. Backfills mail_mode from legacy mail_host
php artisan queue:restart                         # required — workers cache mailer config
```

Notes:

- Legacy tenants with a filled `mail_host` still behave as custom SMTP until the migrate command runs (recommended).
- Configure Central **Settings → Mail** (SMTP / Postmark / Mailgun). Env `MAIL_*` remains bootstrap fallback only.
- After changing mail credentials in Settings, always run `php artisan queue:restart`.
- Smoke: Central + Tenant **Send test**, then open **Email logs**.

See [Multi-Provider Email](/developer-guide/multi-provider-email).

## Verification

```bash
php artisan test --compact tests/Feature/ProductionModuleDeploymentTest.php
```

Smoke:

1. Existing workspace receives the new module in nav **only if** it never had that subscription (or already had it active)
2. Customized role permission sets are unchanged except for explicitly migrated additive grants
3. New registration still gets all default-included modules + full owner permissions

## Expenses categories 1.1.0 (first-party SPA contract)

Ship **Backend migrate before the SPA**. Expense resources no longer return `category` as a string; the SPA expects `category_id` and embedded `{ id, name, slug }`.

```bash
php artisan migrate --force   # expense_categories + backfill + catalog bump 1.0.0 → 1.1.0
# then deploy Frontend, then Docs
```

Do **not** run `db:seed`. Starter categories (Travel / Office / Software / Utilities / Other) lazy-seed on first list/create/PO convert. **Other** cannot be deleted; starter slugs stay stable if renamed.

See [Expenses production](/deployment/expenses).

## Help Desk module v1.0.0

After migrate, existing workspaces do **not** auto-install Help Desk. Operators enable `help-desk` from Marketplace. Registration is migrate-only via `DefaultModuleRegistrar` — do **not** run `db:seed`. Permissions ship additively via `TenantPermissionSynchronizer`.

```bash
php artisan migrate --force   # help_desk_* tables + catalog registration + help-desk.* permissions
# then deploy Frontend, then Docs
```

See [Help Desk production](/deployment/help-desk).

## Projects 1.0.0 + Tasks project_id (1.2.0)

```bash
php artisan migrate --force   # projects tables + permissions + catalog + tasks.project_id + tasks 1.2.0
# then deploy Frontend (Projects nav + optional task project picker), then Docs
```

Do **not** run `db:seed`. Projects is free Marketplace opt-in (not default-included). See [Projects production](/deployment/projects).

## Automation module (billable add-on)

After migrate, existing workspaces do **not** auto-install Automation. Operators install `automation` from Marketplace. Include the `automations` queue on workers and confirm `automation:dispatch-schedules` is on the scheduler. Optional env: `AUTOMATION_WEBHOOK_SECRET`. See [Automation production](/deployment/automation).

## Storage module + capacity packs

After migrate, free `storage` and billable packs are catalog-only except: workspaces that already have **Team Chat** entitled receive free Storage via the grandfather migration (and new Team Chat installs companion-install Storage). Map Stripe/Creem prices for each pack × cycle before selling packs. See [Storage deployment](/deployment/storage).

## Knowledge Base module (free Operations opt-in)

After migrate, existing workspaces do **not** auto-install Knowledge Base. Operators install `knowledge-base` from Marketplace (internal articles only; not billable). See [Knowledge Base production](/deployment/knowledge-base).

## Related

- [Release Process](/deployment/release-process)
- [v1.1.0 release](/changelog/v1.1.0)
- [Platform production runbook](/deployment/platform-production-runbook)
- [Module development — production](/deployment/module-development)
- [Communication Templates deployment](/deployment/communication-templates)
- [Multi-Provider Email](/developer-guide/multi-provider-email)
- [Email Webhooks](/developer-guide/email-webhooks)
- [Tenant provisioning](/developer-guide/tenant-provisioning)
- [Expenses production](/deployment/expenses)
- [Help Desk production](/deployment/help-desk)

- [Projects production](/deployment/projects)
