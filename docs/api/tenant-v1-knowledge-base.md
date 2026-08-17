# Tenant API v1 — Knowledge Base

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:knowledge-base`.

All listed routes also require the stated `knowledge-base.*` Spatie permission.

Absolute datetimes serialize as UTC ISO-8601 (`...Z`). `published_at` is stored/cast as `UtcDateTime`.

## Articles

### GET `/knowledge-base/stats`

Permission: `knowledge-base.view`

KPI counts (`total`, `draft`, `published`, `archived`) over the same visibility/filter set as list (view-only actors count published only).

### GET `/knowledge-base`

Permission: `knowledge-base.view`

Query:

- `search` — title, excerpt, body
- `category_id`
- `sort` — `title` | `status` | `published_at` | `created_at` | `updated_at` (default `created_at`)
- `direction` — `asc` | `desc`
- `page`, `per_page`

Editors with `knowledge-base.update` may also pass:

- `status` — `draft` | `published` | `archived`
- `trashed` — `only` | `true` | `with`

View-only: published audience only (no draft/archived/trash).

### POST `/knowledge-base`

Permission: `knowledge-base.create`

Body: `title` (required), `body` (required TipTap HTML); optional `slug`, `excerpt`, `category_id`, `status` (default `draft`).

Publishing on create sets `published_at`.

### GET `/knowledge-base/{id}`

Permission: `knowledge-base.view` (policy enforces published-only for non-editors). Soft-deleted rows return not found on show.

Includes category, creator, notes, and activities when loaded. Embedded `notes` and timeline/domain `activities` are **newest-first** (`created_at` DESC, then `id` DESC).

### PUT `/knowledge-base/{id}`

Permission: `knowledge-base.update`

Body (partial): `title`, `slug`, `excerpt`, `body`, `category_id`, `status`.

Transition into `published` sets `published_at` when missing; transition to `draft` clears `published_at`. No publish notification fan-out in v1.

### DELETE `/knowledge-base/{id}`

Permission: `knowledge-base.delete` — soft delete.

### POST `/knowledge-base/{id}/restore`

Permission: `knowledge-base.restore`

### DELETE `/knowledge-base/{id}/force`

Permission: `knowledge-base.force.delete` — article must already be soft-deleted.

### POST `/knowledge-base/{id}/notes`

Permission: `knowledge-base.update`

Body: `{ "body": "string" }`

### GET `/knowledge-base/{id}/timeline`

Permission: `knowledge-base.view`

Domain activity entries (`type`, `description`, `properties`, actor).

## Categories

Same module gate and `knowledge-base.*` permissions.

### GET `/knowledge-base-categories`

Permission: `knowledge-base.view` — ordered by `sort_order`, then name.

### POST `/knowledge-base-categories`

Permission: `knowledge-base.create`

Body: `name` (required); optional `slug`, `sort_order`, `is_active`.

### GET|PUT|DELETE `/knowledge-base-categories/{id}`

View (`knowledge-base.view`), update (`update`), soft-delete (`delete`).

Soft delete fails with validation if any articles still reference the category.

### POST `/knowledge-base-categories/{id}/restore`

Permission: `knowledge-base.restore`

### DELETE `/knowledge-base-categories/{id}/force`

Permission: `knowledge-base.force.delete` — blocked while any articles (including soft-deleted) still reference the category.
