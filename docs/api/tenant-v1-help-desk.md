# Tenant API v1 — Help Desk

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `not.suspended`, `verified`, `module:help-desk`, plus permission middleware / policies.

No hard `module_dependencies` — Help Desk installs standalone. `contact_id` and `company_id` are optional; supplying either requires the corresponding module (`contacts` / `companies`) to be entitled on the workspace, enforced by `LinkableContact` / `LinkableCompany`.

Assignee scoping: without `help-desk.assign` (and not superadmin), list/stats/view/update/**close**/**reopen** only include tickets where `assigned_to` is the current user.

## Stats

### GET `/help-desk/stats`

Same filters as list (minus pagination/sort). Response:

```json
{
  "total_tickets": 0,
  "my_tickets": 0,
  "open": 0,
  "in_progress": 0,
  "waiting": 0,
  "resolved": 0,
  "closed": 0,
  "overdue": 0,
  "scope": "org | mine"
}
```

`overdue` counts tickets in `open`, `in_progress`, or `waiting` with `due_at` before now (UTC instant comparison).

## Tickets CRUD

### GET `/help-desk`

Query: `search` (matches `subject`, `number`, or `description`), `status` (`open`\|`in_progress`\|`waiting`\|`resolved`\|`closed`), `priority` (`low`\|`medium`\|`high`\|`urgent`), `category_id`, `contact_id`, `company_id`, `assigned_to` (`unassigned` or user id), `my_tickets`, `overdue`, `trashed` (`true`\|`only`), `sort`, `direction`, `page`, `per_page`.

List items include `status`, `priority`, `category_id`, embedded `category` (`{ id, name, slug }` when loaded), `due_at`, contact/company refs (when linked), assignee/creator refs, and `latest_note`.

### POST `/help-desk`

Body: `subject` (required), `description` (optional), `priority` (optional, default `medium`), `category_id` (optional — tenant `help_desk_categories` id, must be active; defaults to seeded **Other**), `contact_id` (optional — Contacts module must be entitled), `company_id` (optional — Companies module must be entitled), `due_at` (optional ISO datetime), `assigned_to` (optional — requires actor to hold `help-desk.assign`; otherwise defaults to creator).

Status always starts at `open`; `number` is auto-generated (`HD-00001`, configurable via `help_desk_number_prefix` tenant setting).

### GET `/help-desk/{id}`

Includes category, contact, company, assignee, creator, notes, and timeline activities.

### PUT `/help-desk/{id}`

Partial update of non-**closed** tickets only. Closed tickets return 422 (`Closed tickets cannot be edited.`). Assignment after create uses `POST /help-desk/{id}/assign`.

### DELETE `/help-desk/{id}`

Soft delete. Permission: `help-desk.delete`.

### POST `/help-desk/{id}/restore`

Permission: `help-desk.restore`.

### DELETE `/help-desk/{id}/force`

Permanently delete a soft-deleted ticket. Permission: `help-desk.force.delete` (owner/superadmin only by default).

## Actions

### POST `/help-desk/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `help-desk.assign`.

### POST `/help-desk/{id}/close`

Transitions to `closed` from `open`, `in_progress`, `waiting`, or `resolved`. Permission: `help-desk.close` (assignee-scoped unless the actor has `help-desk.assign` or is superadmin).

### POST `/help-desk/{id}/reopen`

Transitions to `open` from `resolved` or `closed`. Permission: `help-desk.reopen` (assignee-scoped unless the actor has `help-desk.assign` or is superadmin).

### POST `/help-desk/{id}/status`

`{ "status": "open"|"in_progress"|"waiting"|"resolved"|"closed" }`

Permission: `help-desk.update`. Rejects disallowed transitions with a 422 validation error on `status`. Records a `status_changed` timeline entry. Prefer explicit `close` / `reopen` when those semantics apply (they use dedicated permissions).

### POST `/help-desk/{id}/notes`

`{ "body": string }`

Permission: `help-desk.update`.

### GET `/help-desk/{id}/timeline`

Domain timeline entries (`created`, `updated`, `assigned`, `status_changed`, `note_added`, `deleted`, `restored`).

## Help desk categories

Categories use the same `module:help-desk` gate and `help-desk.*` permissions (no separate permission family). Listing lazy-seeds General / Technical / Billing / Account / Other when missing. Starter slugs (`general|technical|billing|account|other`) are not changed on rename. Listing does not restore a soft-deleted starter except **Other**.

- `GET /help-desk-categories` — list (`help-desk.view`)
- `POST /help-desk-categories` — create (`help-desk.create`). Body: `name` (required); optional `slug`, `sort_order`, `is_active`
- `GET|PUT|DELETE /help-desk-categories/{helpDeskCategory}` — view, update, soft-delete (`view` / `update` / `delete`)
- `POST /help-desk-categories/{helpDeskCategory}/restore` — restore (`help-desk.restore`)
- `DELETE /help-desk-categories/{helpDeskCategory}/force` — permanently delete a soft-deleted category (`help-desk.force.delete`)

Delete and force-delete return 422 if the category slug is `other`, or if any tickets (including trashed, for force) still reference the category.
