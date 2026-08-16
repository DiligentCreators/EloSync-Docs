# Documents — Production Guide

Full go-live audit / checklist: [Documents production readiness](./documents-production-readiness).

## Licensing

- Catalog slug: `documents`
- Category: `operations` (**Operations**), `category_sort_order = 40`
- **Free Marketplace opt-in** module (not auto-installed)
- Catalog flags: `is_default_included = false`, `is_billable = false`, price `0`, `sort_order = 85`, version **1.1.0**
- **Hard** `module_dependencies` row: Documents → Storage (`is_optional = false`)
- New workspaces receive only **Leads** + **Tasks** (+ ToDos) by default; enable Storage, then Documents from Marketplace
- To flip billable later: Central → Modules → Documents → set `is_billable` + prices via existing Update Module API (no new Central UI)

## Bootstrap

On **new workspace** create (Central tenant create or public register):

1. `installDefaultModules()` installs published `is_default_included` modules (**Leads**, **Tasks**, **ToDos**)
2. Operators enable **Storage** from Marketplace (or receive it via Team Chat companion install / grandfather)
3. Operators enable **Documents** from Marketplace (free / non-billable; install blocked without Storage)
4. Tenant permissions include `documents.*` via `config/tenant-permissions.php` / default role maps

No stage seeder — categories are tenant-managed. Files land on `FILESYSTEM_UPLOADS_DISK` under `tenants/{id}/documents/…`.

## Permissions rollout

New Documents permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])`. Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

On large tenant fleets, run migrate in a maintenance window (or raise PHP `max_execution_time`). The synchronizer grants missing links only and swallows concurrent `role_has_permissions` unique races.

## Monitoring

- Platform audit events: `document_created`, `document_updated`, `document_deleted`, `document_restored`, `document_force_deleted`
- Spatie activity log names: `documents`, `document-categories`
- Storage used bytes include active `documents.size_bytes`
- Soft-deleted document objects remain on disk until **force delete** or workspace **trash retention** purge (`trash:purge-expired`, Settings → General → trash retention)

## Deploy checklist

1. Migrate tables (`document_categories`, `documents`)
2. Register the `documents` catalog module (migration, not seeder) as free opt-in under `operations`
3. Register hard dependency Documents → Storage (`module_dependencies`)
4. Confirm `module:documents` + `documents.*` permissions on target roles (permission sync migration)
5. Confirm catalog version **1.1.0** (`110000` bump)
6. Confirm Storage is entitled before Documents smoke
7. Confirm `trash:purge-expired` is scheduled (removes expired soft-deleted documents **and** disk objects)
8. Deploy frontend (Documents nav item, list/form/categories; multipart update via POST; bulk delete toolbar)
9. Smoke:
   - Create a **new** workspace → install Storage → install Documents
   - Confirm Documents install fails when Storage is missing
   - Upload / categorize / download a file
   - Soft delete → used bytes drop → restore → used bytes return
   - Restore blocked when over quota
   - Bulk soft delete on Active list; bulk force delete on Deleted only
   - Force delete removes the object
   - Soft-delete category blocked while documents still use it

## Roadmap context

Documents ships as free Operations Marketplace opt-in **v1.1.0** (shipped) with hard Storage dependency. Soft record links and nested folders remain deferred — see [module-dependencies.md](/architecture/module-dependencies) and [product-roadmap.md](/getting-started/product-roadmap).
