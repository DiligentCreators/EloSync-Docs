# ToDos — Developer Guide

Mirror of the [Tasks](/developer-guide/tasks) / [Leads](/developer-guide/leads) module shape, with **creator** scoping instead of assignee scoping. Do not reuse the `Task` model.

## Backend layout

| Piece | Path |
|-------|------|
| Model | `app/Models/Todo.php`, `TodoTag` |
| Enums | `app/Enums/Tenant/TodoStatusEnum`, `TodoPriorityEnum` |
| Scoping | `app/Services/Tenant/Concerns/ScopesToCreator.php` |
| Service | `app/Services/Tenant/TodoService.php`, `TodoTagService.php` |
| Controller | `app/Http/Controllers/Tenant/Api/V1/TodoController.php`, `TodoTagController.php` |
| Requests | `app/Http/Requests/Tenant/Api/V1/Todo/*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/Todo/*` |
| Policy | `app/Policies/TodoPolicy.php`, `TodoTagPolicy.php` |
| Events | `app/Events/TodoCreated.php`, `TodoUpdated`, `TodoDeleted`, `TodoTagCreated`, `TodoTagsSynced` |
| Subscriber | `app/Listeners/TodoEventSubscriber.php` (platform audit) |
| Tests | `tests/Feature/Tenant/Todo/TodoTest.php`, `TodoTagTest.php` |

## Domain notes

- List/board/show scoped via `ScopesToCreator`: org-wide only when `$actor->hasRole('superadmin')` (`TenantAuthorizationProvisioningService::OWNER_ROLE`); otherwise `where created_by = actor.id`.
- **Update and delete** require permission **and** `created_by === actor.id` (owner may view others but cannot mutate).
- Board columns are one per `TodoStatusEnum` case (`open`, `in_progress`, `completed`, `cancelled`).
- Soft deletes only (no restore / force-delete routes in v1).

## Permissions

`config/tenant-permissions.php`:

```
todos.view | create | update | delete
```

Default role map grants all four to admin, manager, and staff. Routes use `module:todos` then `can:todos.*` / policies.

## API (tenant)

Base: `/api/tenant/v1` — full reference [tenant-v1-todos.md](/api/tenant-v1-todos).

| Method | Path | Permission / policy |
|--------|------|---------------------|
| GET | `/todos` | view (+ creator scope) |
| GET | `/todos/board` | view (+ creator scope) |
| POST | `/todos` | create |
| GET | `/todos/{todo}` | view (creator or owner) |
| PUT | `/todos/{todo}` | update **and** creator |
| DELETE | `/todos/{todo}` | delete **and** creator |
| GET | `/todo-tags` | view |
| POST | `/todo-tags` | create |
| PUT | `/todos/{todo}/tags` | update **and** creator |

Colored tags are **create-only** for MVP (no tag update/delete/reorder routes). Assign via `tag_ids[]` or `PUT …/tags`; filter with `tag_id`.

## Frontend

| Piece | Path |
|-------|------|
| Page | `src/pages/todos/todos-page.tsx` (board default + list) |
| Form | `todo-form-dialog.tsx` |
| Detail | `todo-detail-sheet.tsx` (overview; edit/delete gated to creator; board DnD auto-saves status on the list page) |
| Shared board | `src/components/crm/kanban-board.tsx` |
| Service | `todoService` in `src/api/services.ts` |
| Nav | `permission: todos.view`, `module: 'todos'` |

## Tests

```bash
# Backend
php artisan test --compact tests/Feature/Tenant/Todo/TodoTest.php
php artisan test --compact tests/Feature/Tenant/Todo/TodoTagTest.php

# Frontend E2E
npm run test:e2e:todos
```

## Logging

- Spatie `LogsActivity` on `Todo` (log name `todos`)
- `PlatformAuditService` via `TodoEventSubscriber` (`todo_created`, `todo_updated`, `todo_deleted`, `todo_tag_created`, `todo_tags_synced`)

## Intentional differences from Tasks

| Tasks | ToDos |
|-------|--------|
| `ScopesToAssignee` + `tasks.assign` | `ScopesToCreator` + owner role only |
| Delete by permission alone | Delete by permission + creator |
| Notes, digests, KPIs, restore/force | Deferred |
| Status includes `waiting` | Four statuses only |
