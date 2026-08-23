# Documents — Developer Guide

Mirror of the [Assets developer guide](/developer-guide/assets) and Knowledge Base flat-category patterns. Prefer copying those patterns over inventing new ones. Uploads reuse `FileUploadService`; quota uses `WorkspaceStorageService`.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `app/Models/Document.php`, `DocumentCategory`, `DocumentLink` |
| Services | `app/Services/Tenant/DocumentService.php`, `DocumentCategoryService.php`, `DocumentLinkService.php` |
| Upload / quota | `app/Services/Storage/FileUploadService.php`, `WorkspaceStorageService.php` |
| Controllers | `app/Http/Controllers/Tenant/Api/V1/DocumentController.php`, `DocumentCategoryController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Document/*`, `DocumentCategory/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Document/*`, `DocumentCategory/*` |
| Policies | `app/Policies/DocumentPolicy.php`, `DocumentCategoryPolicy.php` |
| Events | `app/Events/DocumentCreated.php`, `DocumentUpdated.php`, `DocumentDeleted.php` |
| Subscriber | `app/Listeners/DocumentEventSubscriber.php` (platform audit) |
| Tests | `tests/Feature/Tenant/Document/DocumentTest.php` |

## Domain notes

- Flat library only — optional `category_id` FK (`nullOnDelete`); no folder tree.
- **Soft record links** via `document_links` polymorphic pivot (`DocumentLink` / `DocumentLinkService::sync` on create + update). Optional arrays: `lead_ids`, `contact_ids`, `company_ids`, `project_ids`, `employee_ids`, `asset_ids`, `task_ids`. Each id validated with the matching `Linkable*` rule (module entitlement + assignee / visibility scope). Omitted keys leave that link type unchanged; an empty array clears links for that type.
- Categories: `name`, auto `slug` (`Str::slug` when omitted), `sort_order`, `is_active`. Soft/force delete blocked while documents still reference the category.
- Create requires multipart `file` (max 51200 KB / 50 MB). `DocumentService::create` calls `WorkspaceStorageService::assertCanStore` then `FileUploadService::store` under `FileUploadService::tenantDirectory($tenantId, 'documents')` (`public: false`).
- Update may replace the file via `FileUploadService::replace`; quota check uses the positive size delta only.
- Soft delete does **not** remove the object until force delete or trash retention purge; `forceDeleting` deletes via `FileUploadService` (covers API + `trash:purge-expired`).
- **Ownership:** `DocumentPolicy::delete` / `forceDelete` require the Spatie permission **and** (`created_by === actor` **or** workspace owner / `superadmin` role). Bulk endpoints use the same Gate checks per id.
- Restore calls `assertCanStore` for the document's `size_bytes` before un-trashed bytes count again.
- Bulk: `DocumentService::bulkDelete` / `bulkForceDelete` (max 100 ids) with per-id failure reporting; force requires soft-deleted rows (single + bulk).
- File replace: prefer `POST /documents/{id}` (named `documents.update.post`); JSON metadata-only updates may use `PUT`. PHP does not populate multipart files on true HTTP PUT.
- `Document` / `DocumentCategory` are registered in `TrashPurgeRegistry` (workspace `trash.retention_days`).
- `WorkspaceStorageService::usedBytes()` sums non-trashed `documents.size_bytes` with chat/feedback/lead-import usage.
- Spatie activity log name `documents` / `document-categories` (path/disk excluded from document attribute logs).
- Platform audit events: `document_created`, `document_updated`, `document_deleted`, `document_restored`, `document_force_deleted`.
- `documents.force.delete` is not granted to default roles — owner/superadmin only, matching Vendors / Assets.
- Production readiness: [Documents production readiness](/deployment/documents-production-readiness).
- Catalog version **1.3.0**

## Permissions

`config/tenant-permissions.php`:

```
documents.view | create | update | delete | restore | force.delete
```

Routes use `module:documents` then `can:documents.*` / policies. Category CRUD reuses the same `documents.*` permissions (no separate category permission family).

## Catalog

- Slug `documents`, category `operations`, `sort_order` 85, icon `file-text`
- `is_default_included = false`, `is_billable = false`, version **1.3.0**
- Hard `module_dependencies` row: **documents → storage** (`is_optional = false`)
- Registered via migrate-only `DefaultModuleRegistrar::ensureModule` (no seeder in production)

### Making billable later

Flip catalog flags with the existing Central **Update Module** API (Central → Modules → Documents): set `is_billable = true` and monthly/yearly prices. Do **not** invent a new Central UI surface.

## Storage integration

| Concern | Behavior |
|---------|----------|
| Install gate | `ModuleSubscriptionService` rejects Documents without entitled Storage |
| Upload gate | `assertCanStore` before store/replace |
| Used bytes | Active `documents.size_bytes` included in quota |
| Soft delete | Excluded from `usedBytes`; object remains until force delete or trash purge |
| Force delete / trash purge | Object removed from disk in `forceDeleting` |

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-documents.md](/api/tenant-v1-documents).

| Method | Path | Permission |
|--------|------|------------|
| GET | `/documents` | view |
| GET | `/documents/stats` | view |
| GET | `/documents/{document}` | view |
| GET | `/documents/{document}/download` | view |
| POST | `/documents` | create |
| PUT | `/documents/{document}` | update |
| DELETE | `/documents/{document}` | delete |
| POST | `/documents/{document}/restore` | restore |
| DELETE | `/documents/{document}/force` | force.delete |
| GET | `/document-categories` | view |
| GET | `/document-categories/{documentCategory}` | view |
| POST | `/document-categories` | create |
| PUT | `/document-categories/{documentCategory}` | update |
| DELETE | `/document-categories/{documentCategory}` | delete |
| POST | `/document-categories/{documentCategory}/restore` | restore |
| DELETE | `/document-categories/{documentCategory}/force` | force.delete |

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/documents/documents-page.tsx` |
| Form | `document-form.tsx`, `document-form-page.tsx` (optional related-record pickers when entitled modules + view permissions are present) |
| View | `document-view-page.tsx` (Related records cards from `links`) |
| Service | `documentService` / `documentCategoryService` in `src/api/services.ts` |
| Nav | `permission: documents.view`, `module: 'documents'` |

## Tests

```bash
# Backend
php artisan test --compact --filter=Document

# Frontend
npm run test:e2e:documents
```
