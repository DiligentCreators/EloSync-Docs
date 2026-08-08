# ToDos — Production Guide

## Licensing

- Catalog slug: `todos`
- Default-included, non-billable for new workspaces
- Deactivate via Central module subscription tools to revoke access without dropping data

## Bootstrap

On workspace provision:

1. Default modules installed (includes ToDos alongside Leads and Tasks)
2. Tenant permissions include `todos.*` via `config/tenant-permissions.php` / default role maps

Status/priority are enums on the todo row (no stage seeder).

## Permissions rollout

New ToDos permissions for **existing** workspaces ship as an additive **data migration** using `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions([...])` (`2026_07_31_030300_add_todos_permissions`). Do **not** re-seed roles or rely on login/dashboard to repair RBAC.

Catalog registration + install for workspaces missing the module: `2026_07_31_030200_register_todos_module` (`DefaultModuleRegistrar::ensureModule` + `installForWorkspacesMissingModule`).

## Monitoring

- Platform audit events: `todo_created`, `todo_updated`, `todo_deleted`, `todo_tag_created`, `todo_tags_synced`
- No due digests or assignment notifications in v1

## Deploy checklist

1. Migrate `todos`, `todo_tags`, `todo_todo_tag`; catalog bump **todos → 1.1.0** (colored tags)
2. Run register + permissions data migrations
3. Deploy frontend (board/list, creator-gated edit/delete, inline tags)
4. Confirm `module:todos` + `todos.*` permissions
5. Smoke: register/login → ToDos board → create (with tag) → list → delete own item; second user cannot see first user’s to-do; owner can view but not delete others’
