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

## Tenant API & Webhooks (Settings → Developers)

Migrate-first platform capability (not a Marketplace module).

1. Deploy Backend + Frontend + Docs together.
2. Run `php artisan migrate --force` — adds `personal_access_tokens.token_type`, `tenant_webhook_endpoints`, `tenant_webhook_deliveries`, and grants `settings.manage_developers` to owner/admin defaults.
3. Ensure a queue worker processes the **`webhooks`** queue (`DeliverTenantWebhookJob`). Include `webhooks` in the Forge worker list (see [Laravel Forge](./laravel-forge)).
4. Smoke: Settings → Developers → create API token → Bearer call → create webhook → Send test.

See [Tenant API & Webhooks production readiness](./tenant-api-webhooks-production-readiness).

## AI Assistant platform 1.0.0 → 1.0.1

After migrate (`2026_08_21_010000`–`010300`):

1. Confirm catalog rows `ai` (billable **1.0.1**), `ai-credits-1k`, `ai-credits-5k`, `ai-credits-20k` are published.
2. Confirm permissions `ai.use`, `ai.manage`, `ai.confirm` exist and default admin/manager maps include them.
3. Confirm scheduler runs `ai:rollover-monthly-credits` (daily, overlapping locked, one server).
4. Set Central Settings → AI (`ai_enabled`, provider, encrypted `ai_api_key`, models, monthly included credits).
5. Deploy the SPA **after** migrate — Ask EloSync / Settings AI (`ai.manage`) / Lead Copilot require the module entitlement.
6. Smoke: entitle `ai` → wallet grant → Ask EloSync → Lead Copilot; platform mode returns **402** when credits are exhausted or below the pre-provider ceiling.

**1.0.1** hardens credit integrity (wallet `lockForUpdate`, pre-provider credit ceiling, request-path `ensurePeriod`), enforces `ai.manage` on Settings AI, and adds `throttle:ai` on message/copilot routes.

Go-live: [AI production readiness](/deployment/ai-production-readiness) · ops notes [AI deployment](/deployment/ai).

## Sales document invoice conversion (quotations 1.4.1 / contracts 1.2.1 / invoices 1.6.1 / estimates 1.3.3)

After migrate:

1. Confirm catalog versions: quotations `1.4.1`, contracts `1.2.1`, invoices `1.6.1`, estimates `1.3.3`
2. Confirm `customer_invoices.contract_id` exists (nullable FK) and **unique** nullable `estimate_id`
3. Confirm `quotations.convert` and `contracts.convert` are granted to default admin/manager roles
4. Deploy the SPA **after** migrate — convert actions 422 until Invoices is entitled; contract re-bills need `acknowledge_repeat_billing`

Do **not** unique-index `customer_invoices.quotation_id`. Contract billing is repeatable. Quote/estimate one-shot uses `QuotationInvoiceGuard` plus `lockForUpdate` (and unique `estimate_id`).

Go-live: [Sales document convert production readiness](/deployment/sales-document-convert-production-readiness).

## Sales document invoice conversion (quotations 1.4.0 / contracts 1.2.0 / invoices 1.6.0 / estimates 1.3.2)

Superseded by **1.4.1 / 1.2.1 / 1.6.1 / 1.3.3** integrity hardening above. Historical checklist:

1. Confirm catalog versions: quotations `1.4.0`, contracts `1.2.0`, invoices `1.6.0`, estimates `1.3.2`
2. Confirm `customer_invoices.contract_id` exists (nullable FK)
3. Confirm `quotations.convert` and `contracts.convert` are granted to default admin/manager roles
4. Deploy the SPA **after** migrate — convert actions 422 until Invoices is entitled on the workspace

Do **not** unique-index `customer_invoices.quotation_id`. Contract billing is repeatable; the quotation/estimate one-shot guard is application-level (`QuotationInvoiceGuard`).

## Contracts 1.1.0 — auto-fill and HTML memos

After migrate:

1. Confirm catalog `contracts` version is `1.1.0`
2. Confirm `contracts.description` exists (nullable text)
3. Deploy the SPA **after** migrate — posting `description` before the column exists will 500
4. Store allows the creating actor as `assigned_to`. The SPA copies assignee only when that user is in the eligible picker; omitted `assigned_to` still defaults to the actor.

See [Contracts 1.1.0 production readiness](/deployment/contracts-production-readiness).

## Founding Beta invites

After migrate (`2026_08_16_232506_add_founding_beta_invites_to_beta_applications_table`):

1. Confirm `founding_beta_enabled`, `founding_beta_apply_url`, and `founding_beta_invite_ttl_days` exist (seeded via `updateOrInsert` in that migration).
2. Ensure a queue worker listens to `emails` (Founding Beta invite notification).
3. Set `FRONTEND_URL` to the SPA that serves `/#/register?invite=…`.
4. Keep marketing origins off `SANCTUM_STATEFUL_DOMAINS` (public apply/resend use Bearer-less JSON + CSRF except).

Go-live checklist: [Founding Beta invite production readiness](/deployment/founding-beta-invite-production-readiness).

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

## Billing product line picker (quotations / estimates / invoices + products)

After migrate (Backend **before** SPA):

```bash
php artisan migrate --force
# includes:
# 2026_08_18_000658_bump_products_module_version_to_1_1_0
# 2026_08_18_001042_add_product_id_to_billing_document_lines_tables
# 2026_08_18_001043_bump_billing_document_modules_for_product_line_picker
# 2026_08_18_063000_bump_modules_for_product_line_picker_hardening
```

1. Confirm catalog versions: products `1.1.1`, quotations `1.3.1`, estimates `1.3.1`, invoices `1.5.1`
2. Existing entitled workspaces keep entitlements; catalog bump does **not** auto-install modules
3. Smoke: create a line with `product_id` on a draft quotation/estimate/invoice; convert estimate → invoice; generate a recurring occurrence

See [Billing product line picker production readiness](/deployment/billing-product-line-picker-production-readiness).

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

## Assets module v1.0.0

After migrate, existing workspaces do **not** auto-install Assets. Operators enable `assets` from Marketplace. Registration is migrate-only via `DefaultModuleRegistrar` — do **not** run `db:seed`. Permissions ship additively via `TenantPermissionSynchronizer`. No hard module dependencies.

```bash
php artisan migrate --force   # assets / asset_notes / asset_activities + catalog registration + assets.* permissions
# then deploy Frontend, then Docs
```

See [Assets production](/deployment/assets).

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

- [Assets production](/deployment/assets)

- [Projects production](/deployment/projects)
