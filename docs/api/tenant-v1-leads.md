# Tenant API v1 — Leads

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:leads`, plus permission middleware / policies.

Assignee scoping: without `leads.assign` (and not superadmin), list/board/stats/export only include leads where `assigned_to` is the current user.

## Lead stages

### GET `/lead-stages`

Returns seeded pipeline stages for the workspace (New … Won / Lost).

## Lead tags

### GET `/lead-tags`

Returns the workspace tag catalog (seeded on first use). Includes `behavior` (`none` | `auto_follow_up` | `force_follow_up`), `auto_follow_up_days`, `is_default`, `sort_order`, `color`.

### POST `/lead-tags`

Create a tag. Requires `leads.create`. Body: `name` (required), optional `slug`, `color`, `sort_order`, `is_default`, `behavior`, `auto_follow_up_days` (required when behavior is `auto_follow_up`).

### PUT `/lead-tags/{leadTag}`

Update a tag. Requires `leads.update`.

### DELETE `/lead-tags/{leadTag}`

Hard-delete a tag and detach it from all leads. Requires `leads.delete`.

### POST `/lead-tags/reorder`

Body: `{ "ordered_ids": number[] }`. Requires `leads.update`.

### PUT `/leads/{lead}/tags`

Sync tags on a lead. Body: `{ "tag_ids": number[], "follow_up"?: { title, due_at, notes?, assigned_to? } }`. Requires `leads.update`. Newly added `force_follow_up` tags require `follow_up`. Newly added `auto_follow_up` tags create a pending follow-up due in `auto_follow_up_days` (workspace timezone) unless one already exists for that lead+tag (`lead_follow_ups.lead_tag_id`). Applying tags never changes stage or status.

## Stats & board

### GET `/leads/stats`

Same filters as list (minus pagination/sort). Payload includes:

`total_leads`, `my_leads`, `pipeline_value`, `todays_follow_ups`, `overdue_follow_ups`, `won_this_month`, `average_lead_value`, `conversion_rate`, `scope` (`org`|`mine`).

Pipeline / won metrics use stage `is_won` / `is_lost` flags, not lead status.

### GET `/leads/board`

Columns per stage: `stage`, `lead_count`, `total_lead_value`, `leads[]`. Honors the same filters as list.

## Leads CRUD

### GET `/leads`

Query: `search`, `status`, `stage_id`, `tag_id`, `tag_ids` (comma-separated), `priority`, `assigned_to` (`unassigned` or user id), `lead_value_min`, `lead_value_max`, `trashed`, `sort`, `direction`, `page`, `per_page`.

Status values: `active`, `waiting`, `on_hold`, `closed`, `archived`.

List and board lead cards include:

- `tags` — applied tag objects (`id`, `name`, `slug`, `color`, `behavior`, …)
- `latest_note` — most recent note (`id`, `body`, `author`, timestamps) or `null`
- `next_follow_up` — earliest pending follow-up (`id`, `title`, `notes`, `due_at`, `status`, `assignee`, …) or `null`
- `next_follow_up_at` — denormalized due timestamp for the next pending follow-up (unchanged)

### POST `/leads`

Body: `name` (required), `lead_type` (required: `direct` | `company`), `email`, `phone`, `company`, `job_title`, `source`, `lead_value` (or legacy alias `estimated_value`), `priority`, `status`, `stage_id`, `assigned_to`, optional `tag_ids` (defaults to workspace default tags; type tags are merged automatically), optional `follow_up` when creating with a force-follow-up tag.

### GET `/leads/{id}`

Includes stage, assignee, tags, notes, follow-ups, activities, assignment histories. Exposes `converted_at` / `is_converted`.

### PUT `/leads/{id}`

Partial update of lead fields (including `lead_type`, `stage_id`, `status`, `priority`, `lead_value`, `assigned_to`). Changing `lead_type` swaps the exclusive Direct Lead / Company Lead system tags. Stage change does **not** sync status.

### DELETE `/leads/{id}`

Soft delete. Permission: `leads.delete`.

### POST `/leads/{id}/restore`

Restore a soft-deleted lead. Permission: `leads.restore` (admin + owner by default).

### DELETE `/leads/{id}/force`

Permanently delete a soft-deleted lead (must already be trashed). Permission: `leads.force.delete` (owner by default).

## Export

### GET `/leads/export`

Permission: `leads.export`.

Query: same filters as list, plus `format` = `csv` (default) or `xlsx`. Streams a download of the filtered set.

## Import

Permission for all import routes: `leads.import` (+ `module:leads`).

Duplicate mode `update` also requires `leads.update`.

### GET `/leads/import/template`

Query: `format` = `csv` (default) or `xlsx`. Downloads a sample template with all mappable columns (including optional **Note**) and one sample row.

### GET `/leads/imports`

Paginated import history (status, user, file name, row counts, timestamps).

### POST `/leads/imports`

Multipart: `file` (CSV/XLSX). Stores the upload, returns import record + `context` (headers, sample rows, suggested mapping, fields). Status: `uploaded`.

### PUT `/leads/imports/{uuid}`

Body: `{ "mapping": { "name": "Name", "email": "Email", "note": "Note", ... } }`. Status → `mapped`.

Mappable system fields include lead attributes plus optional `note` (max 5000 chars). A non-empty note creates a lead note authored by the importer after create; on duplicate mode `update` it appends a note. Empty note cells are ignored.

### PUT `/leads/imports/{uuid}/options`

Body: `{ "unique_fields": ["email","phone"], "duplicate_mode": "skip"|"update"|"keep", "assignment_mode": "none"|"equal" }`.

`duplicate_mode=update` requires `leads.update`. `assignment_mode=equal` requires `leads.assign` **and** that the actor is `manager_id` on at least one active department; newly created leads are distributed equally among eligible members of those managed department(s).

Same-day duplicate detection (workspace timezone): when a row matches email/phone on a lead created today, the **Duplicate** tag is applied and `lead.duplicate_detected` notifications are sent — regardless of duplicate mode (including **skip**).

### POST `/leads/imports/{uuid}/preview`

Validates rows without writing leads. Returns preview counts + sample validation errors.

### POST `/leads/imports/{uuid}/run`

Queues `ProcessLeadImportJob` on the `imports` queue. Status → `queued` → `processing` → `completed`|`failed`. Poll `GET /leads/imports/{uuid}`.

### GET `/leads/imports/{uuid}`

Status + statistics for polling (`processed_rows` / `total_rows`, imported/updated/skipped/duplicate/failed counts).

### GET `/leads/imports/{uuid}/file`

Download the original uploaded file.

### GET `/leads/imports/{uuid}/failed-records`

Download `failed_records.csv` (original row + reason + validation errors).

### GET `/leads/imports/{uuid}/error-report`

Download `error_report.csv` (technical/processing exceptions).

## Actions

### POST `/leads/{id}/assign`

`{ "assigned_to": number|null, "reason"?: string }` — records assignment history.

`assigned_to` must be an **eligible** assignee (not suspended, not workspace owner, not `exclude_from_lead_auto_assign`), or `null` to unassign.

### POST `/leads/{id}/stage`

`{ "stage_id": number }` — updates stage only (status unchanged).

### POST `/leads/{id}/convert`

Permission: `leads.convert` (assignee-scoped like update unless the actor has `leads.assign` / owner). Creating related records also requires the matching create permission when that module is entitled:

| Related create / link | Permission |
|----------------|-------|
| Contact | `contacts.create` |
| Company (new name only) | `companies.create` |
| Opportunity (`create_opportunity: true`) | `opportunities.create` |
| Link existing stub opportunity on contact backfill | `opportunities.update` |

Optional body:

```json
{
  "notes": "string|null",
  "create_opportunity": false,
  "opportunity": {
    "name": "required when create_opportunity is true",
    "amount": null,
    "currency": "USD",
    "probability": null,
    "expected_close_date": null,
    "stage_id": null
  }
}
```

Sets `converted_at`, `conversion_meta`, status `closed`, and a converted activity. When the workspace has the **Contacts** module installed, this also creates (or reuses) a real `Contact`, links it via `contact_id`/`contact`, preserves the lead assignee, and sets `conversion_meta.stub = false`. When **Companies** is installed and the lead has a company name, creates or reuses a Company (case-insensitive name) and stores `conversion_meta.company_id` (and Contact `company_id`). When **Opportunities** is installed and `create_opportunity` is true, creates an Opportunity linked to the lead/contact/company and stores `conversion_meta.opportunity_id`. Stub converts without a `contact_id` may call convert again after Contacts is installed to backfill the contact. Without Contacts installed, conversion remains status-only for contacts (`conversion_meta.stub = true`) but may still create company/opportunity. See [tenant-v1-contacts.md](/api/tenant-v1-contacts), [tenant-v1-companies.md](/api/tenant-v1-companies), [tenant-v1-opportunities.md](/api/tenant-v1-opportunities).

### POST `/leads/{id}/notes`

`{ "body": string }`

### POST `/leads/{id}/follow-ups`

`{ "title", "due_at", "notes?", "assigned_to?" }`

### PUT `/leads/{id}/follow-ups/{followUpId}`

Partial update (`title`, `due_at`, `notes`, `assigned_to`). Changing `due_at` is treated as a reschedule in the activity timeline.

### POST `/leads/{id}/follow-ups/{followUpId}/complete`

Marks follow-up completed.

### GET `/leads/{id}/timeline`

CRM activity timeline entries.

### GET `/leads/{id}/assignment-history`

Ordered assignment change rows (`old_user`, `new_user`, `changed_by`, `reason`, timestamps).

## Integrations (`leads.manage_integrations`)

### Webhooks

- `GET/POST /leads/integrations/webhooks`
- `PUT /leads/integrations/webhooks/{id}`
- `POST /leads/integrations/webhooks/{id}/rotate`
- `DELETE /leads/integrations/webhooks/{id}`

Create/rotate responses include plaintext `api_key` and `signing_secret` once. Public ingress: `POST /webhooks/leads/custom/{uuid}` (Bearer or `X-EloSync-Signature`). Endpoint fields include `assign_to_website_recipients` (boolean, default `false`). See [Custom Lead Webhook](/developer-guide/custom-lead-webhook).

### Meta Lead Ads

- `GET/PATCH /leads/integrations/meta` — includes `available_pages` when connected
- `GET /leads/integrations/meta/pages` — refresh candidate Pages (id/name only)
- `GET /leads/integrations/meta/oauth/redirect`
- `POST /leads/integrations/meta/pages` — body `{ page_ids: string[] }` (empty clears subscriptions)
- `POST /leads/integrations/meta/disconnect` — force-deletes page rows so IDs can be reclaimed

OAuth callback: `GET /api/oauth/leads/meta/callback`. Shared webhook: `GET/POST /webhooks/leads/meta`. Operator setup: [Meta App Setup](/developer-guide/meta-app-setup). Architecture: [Meta Lead Ads](/developer-guide/meta-lead-ads-integration).