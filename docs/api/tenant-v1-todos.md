# Tenant API v1 — ToDos

Base path: `/api/tenant/v1`

Middleware: `auth:tenant-api`, `tenant.user`, `verified`, `module:todos`, plus permission middleware / policies.

**Creator scoping:** without the workspace owner role (`superadmin`), list/board/show only include to-dos where `created_by` is the current user. The owner sees all tenant to-dos.

**Mutation rule:** update and delete require the matching permission **and** `created_by ===` authenticated user (owners cannot mutate others’ to-dos).

## Board

### GET `/todos/board`

One column per status (`open`, `in_progress`, `completed`, `cancelled`): `status`, `label`, `todo_count`, `todos[]`. Honors the same filters as list (`search`, `status`, `priority`, `my_todos`).

## ToDos CRUD

### GET `/todos`

Query: `search`, `status`, `priority`, `my_todos`, `sort`, `direction`, `page`, `per_page`.

Status values: `open`, `in_progress`, `completed`, `cancelled`.  
Priority values: `low`, `medium`, `high`, `urgent`.

### POST `/todos`

Body: `title` (required), `description`, `status`, `priority`, `due_at`.

`created_by` is set to the authenticated user.

### GET `/todos/{id}`

Includes creator. Forbidden for non-owners who are not the creator.

### PUT `/todos/{id}`

Partial update of todo fields (including `status` / `priority` / `due_at`). Creator-only.

Setting status to `completed` sets `completed_at`; leaving completed clears it.

### DELETE `/todos/{id}`

Soft delete. Permission: `todos.delete` **and** creator.
