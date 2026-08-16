# Tenant API v1 — Documents

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:documents`, plus permission middleware / policies.

Workspace must also be entitled to **Storage**. Uploads enforce Storage quota via `WorkspaceStorageService::assertCanStore`.

## Stats

### GET `/documents/stats`

Permission: `documents.view`

Same filters as list (minus pagination/sort). Payload:

`total`, `categorized`, `uncategorized`.

## Documents CRUD

### GET `/documents`

Permission: `documents.view`

Query: `search` (title, description, original_name), `category_id`, `trashed` (`only` | `true` | `with`), `sort` (`title` | `original_name` | `size_bytes` | `created_at` | `updated_at`, default `created_at`), `direction`, `page`, `per_page`.

List items include nested `category` / `creator` when loaded, plus `original_name`, `mime`, `size_bytes`.

### POST `/documents`

Permission: `documents.create`

`multipart/form-data`:

| Field | Rules |
|-------|--------|
| `title` | required, string, max 255 |
| `description` | optional string, max 5000 |
| `category_id` | optional; must exist in tenant `document_categories` and not soft-deleted |
| `file` | required file, max **51200** KB (50 MB); mimes: `pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,rtf,odt,ods,odp,jpg,jpeg,png,gif,webp,zip,rar,7z` |

Stores under the tenant Documents directory on the uploads disk. Counts toward Storage used bytes.

### GET `/documents/{id}`

Permission: `documents.view`. Soft-deleted rows return not found on show.

Includes category and creator when loaded. Does **not** expose `path` / `disk`.

### PUT `/documents/{id}`

Permission: `documents.update`

`multipart/form-data` (partial): `title`, `description`, `category_id`, optional `file` (same mime/size rules as create). Replacing a larger file checks quota on the positive size delta only.

### DELETE `/documents/{id}`

Soft delete. Permission: `documents.delete`. Soft-deleted bytes stop counting toward Storage used.

### POST `/documents/{id}/restore`

Restore a soft-deleted document. Permission: `documents.restore`.

### DELETE `/documents/{id}/force`

Permanently delete a soft-deleted document and remove the object from storage. Permission: `documents.force.delete`.

### GET `/documents/{id}/download`

Permission: `documents.view` (policy `download`). Streams the original file (`Content-Disposition` attachment using `original_name`). Soft-deleted or missing objects → 404.

## Document categories

### GET `/document-categories`

Permission: `documents.view`

Paginated list ordered by `sort_order`, then `name`.

### POST `/document-categories`

Permission: `documents.create`

Body:

| Field | Rules |
|-------|--------|
| `name` | required, string, max 255 |
| `slug` | optional; unique per tenant; defaults to `Str::slug(name)` |
| `sort_order` | optional integer (default 0) |
| `is_active` | optional boolean (default true) |

### GET `/document-categories/{id}`

Permission: `documents.view`

### PUT `/document-categories/{id}`

Permission: `documents.update`

Partial update of `name`, `slug`, `sort_order`, `is_active`. Changing `name` without `slug` regenerates the slug.

### DELETE `/document-categories/{id}`

Soft delete. Permission: `documents.delete`. Fails with 422 if the category still has documents.

### POST `/document-categories/{id}/restore`

Permission: `documents.restore`

### DELETE `/document-categories/{id}/force`

Permanent delete. Permission: `documents.force.delete`. Fails with 422 if any documents (including soft-deleted) still reference the category.
