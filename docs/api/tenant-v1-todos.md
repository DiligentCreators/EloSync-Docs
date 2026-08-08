# Tenant API v1 — ToDos

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:todos`, plus permission middleware / policies.

**Creator scoping:** without the workspace owner role (`superadmin`), list/board/show only include to-dos where `created_by` is the current user. The owner sees all tenant to-dos.

**Mutation rule:** update and delete require the matching permission **and** `created_by ===` authenticated user (owners cannot mutate others’ to-dos).

## Tags

### GET `/todo-tags`

List workspace to-do tags. Permission: `todos.view`.

### POST `/todo-tags`

Create a tag. Body: `name` (required), optional `slug`, `color`, `sort_order`. Permission: `todos.create`.

## Board

### GET `/todos/board`

One column per status (`open`, `in_progress`, `completed`, `cancelled`): `status`, `label`, `todo_count`, `todos[]`. Honors the same filters as list (`search`, `status`, `priority`, `tag_id`, `my_todos`, `overdue`).

## ToDos CRUD

### GET `/todos`

Query: `search`, `status`, `priority`, `tag_id`, `my_todos`, `overdue`, `sort`, `direction`, `page`, `per_page`.

Status values: `open`, `in_progress`, `completed`, `cancelled`.  
Priority values: `low`, `medium`, `high`, `urgent`.

`overdue=true` returns open / in-progress to-dos with `due_at` in the past. When `overdue` is set, `status` is ignored.

List/board items include `tags[]` when loaded.

### POST `/todos`

Body: `title` (required), `description`, `status`, `priority`, `due_at`, `tag_ids[]`.

`created_by` is set to the authenticated user.

### GET `/todos/{id}`

Includes creator and `tags`. Forbidden for non-owners who are not the creator.

### PUT `/todos/{id}`

Partial update of todo fields (including `status` / `priority` / `due_at` / `tag_ids[]`). Creator-only.

### PUT `/todos/{id}/tags`

Sync tags. Body: `{ "tag_ids": number[] }`. Permission: `todos.update` + creator-only.

Setting status to `completed` sets `completed_at`; leaving completed clears it.

### DELETE `/todos/{id}`

Soft delete. Permission: `todos.delete` **and** creator.
