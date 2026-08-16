# Tenant API v1 — Assets

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:assets`, plus permission middleware / policies.

Assignee scoping: without `assets.assign` (and not superadmin), list/stats/view/update only include assets where `assigned_to` is the current user.

## Stats

### GET `/assets/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_assets`, `my_assets`, `unassigned`, `active`, `in_repair`, `retired`, `disposed`, `scope` (`org`|`mine`).

## Assets CRUD

### GET `/assets`

Query: `search` (name, number, serial_number, manufacturer, model, location), `status`, `category`, `assigned_to` (`unassigned` or user id), `my_assets`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `latest_note` and nested `assignee` / `creator` / optional `vendor` / optional `employee`.

### POST `/assets`

Body:

| Field | Rules |
|-------|--------|
| `name` | required, string |
| `status` | `active` \| `in_repair` \| `retired` \| `disposed` (default `active`) |
| `category` | `equipment` \| `furniture` \| `vehicle` \| `electronics` \| `software_license` \| `other` |
| `manufacturer`, `model`, `serial_number`, `location` | optional strings |
| `purchased_at`, `warranty_ends_at` | optional dates |
| `purchase_cost` | optional numeric |
| `currency` | optional, max 3 chars |
| `assigned_to` | optional user id (`EligibleAssetAssignee`) |
| `vendor_id` | optional; requires Vendors entitled (`LinkableVendor`) |
| `employee_id` | optional; requires Employees entitled (`LinkableEmployee`) |

`number` is server-generated (`AST-` + sequence; prefix from `assets_number_prefix`).

### GET `/assets/{id}`

Includes assignee, creator, vendor, employee, notes, and activities.

### PUT `/assets/{id}`

Partial update of asset fields (including soft FKs and `assigned_to`).

### DELETE `/assets/{id}`

Soft delete. Permission: `assets.delete`.

### POST `/assets/{id}/restore`

Restore a soft-deleted asset. Permission: `assets.restore`.

### DELETE `/assets/{id}/force`

Permanently delete a soft-deleted asset. Permission: `assets.force.delete`.

## Actions

### POST `/assets/{id}/assign`

`{ "assigned_to": number|null }`

### POST `/assets/{id}/notes`

`{ "body": string }`

### GET `/assets/{id}/timeline`

Asset activity timeline entries.
