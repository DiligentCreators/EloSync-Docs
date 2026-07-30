# Tenant API v1 — Opportunities

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:opportunities`, plus permission middleware / policies.

Assignee scoping: without `opportunities.assign` (and not superadmin), list/stats/board/view/update only include opportunities where `assigned_to` is the current user.

## Stages

### GET `/opportunity-stages`

Permission: `opportunities.view`. Returns seeded pipeline stages for the workspace (Prospecting … Won / Lost), ensuring defaults exist if the tenant has none.

## Stats

### GET `/opportunities/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_opportunities`, `my_opportunities`, `open`, `won`, `lost`, `pipeline_value`, `weighted_pipeline_value`, `won_value`, `conversion_rate`, `scope` (`org`|`mine`).

Open = stages that are neither won nor lost. Weighted pipeline sums `amount * (probability / 100)` for open deals with both fields set. Conversion rate = won / (won + lost) when there is at least one closed (won or lost) deal.

## Board

### GET `/opportunities/board`

Same filters as list (minus pagination). Query: `per_column` (default 50, max 100).

Returns one column per stage: `stage`, `opportunity_count`, `total_amount`, `opportunities` (limited list).

## Opportunities CRUD

### GET `/opportunities`

Query: `search`, `stage_id`, `assigned_to` (`unassigned` or user id), `my_opportunities`, `contact_id`, `company_id`, `lead_id`, `trashed`, `sort`, `direction`, `page`, `per_page`.

List items include `stage`, assignee/creator refs, related `contact` / `company` / `lead` when loaded, and `latest_note`.

### POST `/opportunities`

Body: `name` (required), `amount`, `currency` (3-letter, default `USD`), `probability` (0–100), `expected_close_date`, `stage_id` (defaults to the workspace default stage), `contact_id`, `company_id`, `lead_id`, `assigned_to`.

Related FKs are optional. Each FK requires the corresponding module to be entitled when set.

### GET `/opportunities/{id}`

Includes stage, assignee, creator, notes, timeline activities, and related refs.

### PUT `/opportunities/{id}`

Partial update.

### DELETE `/opportunities/{id}`

Soft delete. Permission: `opportunities.delete`.

### POST `/opportunities/{id}/restore`

Permission: `opportunities.restore`.

### DELETE `/opportunities/{id}/force`

Permanently delete a soft-deleted opportunity. Permission: `opportunities.force.delete`.

## Actions

### POST `/opportunities/{id}/assign`

`{ "assigned_to": number|null }`

Permission: `opportunities.assign`.

### POST `/opportunities/{id}/stage`

`{ "stage_id": number }`

Permission: `opportunities.update`. Records a `stage_changed` timeline entry.

### POST `/opportunities/{id}/notes`

`{ "body": string }`

Permission: `opportunities.update`.

### GET `/opportunities/{id}/timeline`

Domain timeline entries for the deal (`created`, `updated`, `assigned`, `stage_changed`, `note_added`, `deleted`, `restored`).
