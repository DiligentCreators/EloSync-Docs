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
| `lead_ids` | optional array of lead ids (requires entitled **Leads** + `LinkableLead` scope) |
| `contact_ids` | optional array of contact ids (requires entitled **Contacts** + `LinkableContact` scope) |
| `company_ids` | optional array of company ids (requires entitled **Companies** + `LinkableCompany` scope) |
| `project_ids` | optional array of project ids (requires entitled **Projects** + `LinkableProject` scope) |
| `employee_ids` | optional array of employee ids (requires entitled **Employees** + `LinkableEmployee` scope) |
| `asset_ids` | optional array of asset ids (requires entitled **Assets** + `LinkableAsset` scope) |
| `task_ids` | optional array of task ids (requires entitled **Tasks** + `LinkableTask` scope) |
| `file` | required file, max **51200** KB (50 MB); mimes: `pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,rtf,odt,ods,odp,jpg,jpeg,png,gif,webp,zip,rar,7z` |

Stores under the tenant Documents directory on the uploads disk. Counts toward Storage used bytes.

### GET `/documents/{id}`

Permission: `documents.view`. Soft-deleted rows return not found on show.

Includes category, creator, and `links` (with `label` per linkable) when loaded. Does **not** expose `path` / `disk`.

### PUT `/documents/{id}`

Permission: `documents.update`

JSON body (partial): `title`, `description`, `category_id`, and any of the optional `*_ids` link arrays above. Omitted link arrays leave that type unchanged; send `[]` to clear links for a type.

### POST `/documents/{id}`

Permission: `documents.update` (named route `documents.update.post`)

`multipart/form-data` (partial): `title`, `description`, `category_id`, optional link arrays (`lead_ids[]`, …), optional `file` (same mime/size rules as create). Replacing a larger file checks quota on the positive size delta only.

**File replace:** use this `POST` twin — PHP does not populate uploaded files on a true HTTP `PUT`. The official SPA posts FormData here (no `_method` spoofing required). Method-spoofed `POST` + `_method=PUT` also works.

### POST `/documents/bulk-delete`

Permission: `documents.delete`

Body: `{ "ids": [1, 2, …] }` — required array, 1–100 distinct positive integers.

Soft-deletes active documents the actor is allowed to delete (uploader or workspace owner). Already-trashed / missing / unauthorized ids are listed under `failed`. Response data: `processed` (int), `failed` (`[{ id, message }]`). Returns `422` when `processed === 0`.

### POST `/documents/bulk-force-delete`

Permission: `documents.force.delete`

Body: same `ids` shape as bulk-delete.

Permanently deletes **soft-deleted** documents the actor is allowed to force-delete (uploader or workspace owner) and removes objects from storage. Active documents are reported in `failed` (must soft-delete first). Returns `422` when `processed === 0`.

### DELETE `/documents/{id}`

Soft delete. Permission: `documents.delete`, and the actor must be the **uploader** (`created_by`) or the **workspace owner**. Soft-deleted bytes stop counting toward Storage used. Objects remain on disk until force delete or workspace trash retention purge (`trash:purge-expired`). Already-trashed rows return not found.

### POST `/documents/{id}/restore`

Restore a soft-deleted document. Permission: `documents.restore`. Re-checks Storage quota for the document's `size_bytes` (soft-deleted rows are excluded from used bytes until restored). Returns `422` with `STORAGE_QUOTA_EXCEEDED` when restore would exceed allowance.

### DELETE `/documents/{id}/force`

Permanently delete a **soft-deleted** document and remove the object from storage. Permission: `documents.force.delete`, and the actor must be the **uploader** or the **workspace owner**. Active documents return `400` (must soft-delete first).

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
