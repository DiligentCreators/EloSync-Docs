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

## Leads 1.5.0 → 1.6.0 — created_by / updated_by

After migrate (`2026_09_26_112037_add_created_by_and_updated_by_to_leads_table`, `2026_09_26_112040_bump_leads_module_to_1_6_0`, `2026_09_26_133208_remediates_leads_created_by_updated_by_backfill`):

1. Confirm catalog `leads` version is `1.6.0` (migrate-only; do **not** `db:seed`)
2. Confirm tenant `leads` has `created_by` / `updated_by` (nullable FKs); backfill is batched (chunk 500)
3. Deploy the SPA **after** migrate — Created by / Updated by columns and filters
4. Staging smoke: create → filter by creator → edit as second user → Updated by changes; add a note → Updated by changes; System filter for null actors

Go-live: [Leads 1.6.0 created/updated by production readiness](/deployment/leads-created-by-updated-by-1-6-0-production-readiness).

## Live Chat 1.5.1 → 1.5.2 — inbound notification broadcast

After migrate (`2026_09_25_210000_bump_live_chat_module_version_to_1_5_2`):

1. Confirm catalog `live-chat` version is `1.5.2`
2. Confirm `emails` queue workers (or sync) process `LiveChatInboundMessageNotification`
3. Staging smoke: visitor send → agent open tab receives bell / `NotificationCreated` while Echo is connected

## Live Chat 1.5.0 → 1.5.1 — production-readiness remediations

After migrate (`2026_09_25_200000_bump_live_chat_module_version_to_1_5_1`):

1. Confirm catalog `live-chat` version is `1.5.1`
2. Confirm API serves updated `public/widgets/live-chat.js`; Settings embed snippet includes `?v=1.5.1` (purge CDN for unversioned URLs)
3. Staging smoke: visitor send + open/close without HTTP 500 when automation/Reverb misbehaves; Retry does not duplicate a already-persisted visitor message

Go-live: [Live Chat 1.5.0 / 1.5.1 production readiness](/deployment/live-chat-1-5-0-production-readiness).

## Live Chat 1.4.2 → 1.5.0 — send soft-fail + typing

After migrate (`2026_09_25_142200_bump_live_chat_module_version_to_1_5_0`):

1. Confirm catalog `live-chat` version is at least `1.5.0` (prefer **1.5.1** if that migration is present)
2. Confirm API serves the updated static `public/widgets/live-chat.js` (purge CDN if used)
3. Deploy the SPA **after** Backend — desk typing API + `/` canned filter
4. `php artisan reverb:restart` when Reverb is used (typing/live desk); send works even if Reverb is down
5. Staging smoke: third-party Origin visitor send + agent reply without HTTP 500

Go-live: [Live Chat 1.5.0 / 1.5.1 production readiness](/deployment/live-chat-1-5-0-production-readiness). Baseline CORS/session audit: [Live Chat production readiness](/deployment/live-chat-production-readiness).

## User security settings (2FA, passkeys, sessions)

Deploy Backend + Frontend + Docs together. Run migrations **before** serving the SPA build that includes Profile → Security and the login TOTP step.

| Migration | Purpose |
|-----------|---------|
| `2026_09_01_230027_add_session_metadata_to_personal_access_tokens_table` | Session list metadata on Sanctum tokens |
| `2026_09_01_231207_create_passkeys_table` | WebAuthn passkeys |
| `2026_09_01_231209_add_two_factor_columns_to_users_table` | TOTP columns (tenant users) |
| `2026_09_01_231400_add_two_factor_columns_to_central_users_table` | TOTP columns (central users) |

Set `PASSKEYS_RELYING_PARTY_ID` and `PASSKEYS_ALLOWED_ORIGINS` before enabling passkeys in production. See [User security settings production readiness](/deployment/user-security-settings-production-readiness).

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
4. Scheduler runs `webhooks:prune-deliveries --days=90` weekly (delivery payload retention).
5. Smoke: Settings → Developers → create API token → Bearer call → create webhook → Send test.

See [Tenant API & Webhooks production readiness](./tenant-api-webhooks-production-readiness).

## Short Links 1.1.0 → 1.2.0

Deploy **Backend + Frontend + Docs together**.

1. `php artisan migrate --force` — widens `short_links.code` to 64 chars; bumps catalog `short-links` to **1.2.0** (`2026_08_23_231224_widen_short_link_codes_and_bump_version`).
2. Set production env: `SHORT_LINK_BASE_URL` (e.g. `https://go.elosync.com`), `SHORT_LINK_MARKETING_URL`, `SHORT_LINK_BETA_URL`.
3. Point short-domain DNS at the same Laravel app that serves `GET /r/{identifier}`.
4. Confirm queue workers process `RecordShortLinkClickJob` (default queue).
5. Deploy SPA after migrate — vanity slug create field and copy icons require the new frontend build.
6. Smoke: create vanity slug → public redirect; pause/delete → branded 404; `npm run test:e2e:short-links`.

Go-live: [Short Links production readiness](./short-links-production-readiness) · ops [Short Links deployment](./short-links).

## Platform polish lanes A, B, C

Deploy **Backend + Frontend + Docs together**. Frontend PR #143 is already on `main`; Backend PR #148 and Docs PR #170 must merge before production.

1. `php artisan migrate --force` — attachment tables, `document_links`, catalog version bumps (`2026_08_23_*`).
2. Deploy Backend **before or with** the SPA (receipt upload, document links, credit note / PO PDF+email APIs).
3. Confirm `emails` queue workers and Storage upload disk ([Storage production readiness](./storage-production-readiness)).
4. Smoke: documents, expenses, help-desk, tenant-dashboard, AI module Playwright scripts (`--workers=1`).

Go-live audit: [Platform polish A/B/C production readiness](./platform-polish-a-b-c-production-readiness) — **No-Go** until Backend/Docs PRs merge.

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

## AI workspace search 1.2.0 → 1.3.0

After migrate (`2026_08_31_200000_bump_ai_module_version_to_1_3_0`):

1. Confirm catalog `ai.version` is **1.3.0** (migrate-only; do **not** `db:seed`).
2. Deploy SPA + Mobile **after** Backend — Search workspace starter + Wave A+B+C citations.
3. Smoke: Ask EloSync → **Search workspace** starter; confirm hits respect module entitlement and `*.view`; citations stay same-app.

Go-live: [AI workspace search production readiness](/deployment/ai-workspace-search-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Help Desk triage tools 1.3.0 → 1.4.0

After migrate (`2026_09_15_040000_bump_ai_module_version_to_1_4_0`):

1. Confirm catalog `ai.version` is **1.4.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `help-desk` → Ask EloSync open tickets → propose status/assign/note → Confirm; deny resolve without `help-desk.close`.

Go-live: [AI Help Desk triage production readiness](/deployment/ai-help-desk-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Task triage tools 1.4.0 → 1.5.0

After migrate (`2026_09_15_050000_bump_ai_module_version_to_1_5_0`):

1. Confirm catalog `ai.version` is **1.5.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` (Tasks is default-included) → Ask EloSync overdue/due-today tasks → propose status/assign/note → Confirm; deny complete without `tasks.complete`.

Go-live: [AI Task triage production readiness](/deployment/ai-task-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Opportunity triage tools 1.5.0 → 1.6.0

After migrate (`2026_09_15_060000_bump_ai_module_version_to_1_6_0`):

1. Confirm catalog `ai.version` is **1.6.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `opportunities` → Ask EloSync list stages / fetch opportunity → propose stage/assign/note → Confirm; deny stage without `opportunities.update`.

Go-live: [AI Opportunity triage production readiness](/deployment/ai-opportunity-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Invoice triage tools 1.6.0 → 1.7.0

After migrate (`2026_09_15_070000_bump_ai_module_version_to_1_7_0`):

1. Confirm catalog `ai.version` is **1.7.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `invoices` → Ask EloSync fetch invoice / overdue → propose status/assign/note → Confirm; Draft→Unpaid needs `invoices.send`; cancel needs `invoices.void`.

Go-live: [AI Invoice triage production readiness](/deployment/ai-invoice-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Expense triage tools 1.7.0 → 1.8.0

After migrate (`2026_09_15_080000_bump_ai_module_version_to_1_8_0`):

1. Confirm catalog `ai.version` is **1.8.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `expenses` → Ask EloSync fetch expense / pending approval → propose status/assign/note → Confirm; approve needs `expenses.approve`; reject needs `expenses.reject`; paid via status needs `expenses.pay` (and `paid_from_account_id` on the expense when Accounting is entitled).

Go-live: [AI Expense triage production readiness](/deployment/ai-expense-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Project triage tools 1.8.0 → 1.9.0

After migrate (`2026_09_15_090000_bump_ai_module_version_to_1_9_0`):

1. Confirm catalog `ai.version` is **1.9.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `projects` → Ask EloSync fetch project → propose status/assign/note → Confirm; status/note need `projects.update`; assign needs `projects.assign`.

Go-live: [AI Project triage production readiness](/deployment/ai-project-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Purchase Order triage tools 1.9.0 → 1.10.0

After migrate (`2026_09_15_100000_bump_ai_module_version_to_1_10_0`):

1. Confirm catalog `ai.version` is **1.10.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `purchase-orders` → Ask EloSync fetch PO → propose status/assign/note → Confirm; Draft→Sent needs `purchase-orders.send`; receive needs `purchase-orders.receive`; cancel needs `purchase-orders.cancel`.

Go-live: [AI Purchase Order triage production readiness](/deployment/ai-purchase-order-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Payment triage tools 1.10.0 → 1.11.0

After migrate (`2026_09_15_110000_bump_ai_module_version_to_1_11_0`):

1. Confirm catalog `ai.version` is **1.11.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `payments` → Ask EloSync fetch payment → propose post/void/assign/note → Confirm; Posted confirm calls `post()` (`payments.post`); Void confirm calls `void()` (`payments.void`); Draft target rejected.

Go-live: [AI Payment triage production readiness](/deployment/ai-payment-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Lead assign + note tools 1.11.0 → 1.12.0

After migrate (`2026_09_15_120000_bump_ai_module_version_to_1_12_0`):

1. Confirm catalog `ai.version` is **1.12.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `leads` → Ask EloSync fetch lead → propose assign/note → Confirm; assign needs `leads.assign`; note needs `leads.update`.

Go-live: [AI Lead assign + note production readiness](/deployment/ai-lead-assign-note-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Estimate triage tools 1.12.0 → 1.13.0

After migrate (`2026_09_16_010000_bump_ai_module_version_to_1_13_0`):

1. Confirm catalog `ai.version` is **1.13.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `estimates` → Ask EloSync fetch estimate → propose status/assign/note → Confirm; Sent needs `estimates.send`; Accepted needs `estimates.accept`.

Go-live: [AI Estimate triage production readiness](/deployment/ai-estimate-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Quotation triage tools 1.13.0 → 1.14.0

After migrate (`2026_09_16_020000_bump_ai_module_version_to_1_14_0`):

1. Confirm catalog `ai.version` is **1.14.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `quotations` → Ask EloSync fetch quotation → propose status/assign/note → Confirm; Sent needs `quotations.send`; Accepted needs `quotations.accept`.

Go-live: [AI Quotation triage production readiness](/deployment/ai-quotation-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Credit Note triage tools 1.14.0 → 1.15.0

After migrate (`2026_09_16_030000_bump_ai_module_version_to_1_15_0`):

1. Confirm catalog `ai.version` is **1.15.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `credit-notes` (Invoices required) → Ask EloSync fetch credit note → propose status/assign/note → Confirm; Issued needs `credit-notes.issue`; Draft target rejected.

Go-live: [AI Credit Note triage production readiness](/deployment/ai-credit-note-triage-production-readiness) · ops [AI deployment](/deployment/ai).

## AI Leave triage tools 1.15.0 → 1.16.0

After migrate (`2026_09_16_040000_bump_ai_module_version_to_1_16_0`):

1. Confirm catalog `ai.version` is **1.16.0** (migrate-only; do **not** `db:seed`).
2. No SPA/Mobile deploy required for this bump (confirm UI is tool-agnostic).
3. Smoke: entitle `ai` + `employees` + `leave-management` → Ask EloSync list pending / fetch leave → propose approve or reject → Confirm; both writes need `leave-management.approve`; reject requires review notes.

Go-live: [AI Leave triage production readiness](/deployment/ai-leave-triage-production-readiness) · ops [AI deployment](/deployment/ai).

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

## Contracts 1.6.0 → 1.7.0 — accept evidence

After migrate (`2026_09_24_020619_add_contract_acceptance_evidence_fields_to_contracts_table`):

1. Confirm catalog `contracts` version is `1.7.0`
2. Confirm nullable columns: `accepted_by_phone`, `acceptance_user_agent`, `acceptance_signature_path`, `acceptance_signature_method`, `acceptance_id_document_path`, `acceptance_id_document_type`, `acceptance_id_document_original_name`
3. Deploy the SPA **after** migrate — Settings toggles and guest accept multipart fields
4. Signature/ID Settings keys require Storage entitlement (phone does not); SPA switches stay disabled without Storage
5. Smoke public accept + staff signature/ID downloads + PDF signature embed + force-delete purge on staging

Do **not** ship the empty stub `2026_09_23_210611_add_contract_acceptance_evidence_fields_to_contracts_table` if it appears in a branch — only the `2026_09_24_020619_…` migration is valid.

Go-live: [Contracts 1.7.0 accept evidence production readiness](/deployment/contracts-1-7-0-production-readiness).

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
