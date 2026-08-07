# Announcements — Production Guide

## Licensing

- Catalog slug: `announcements`
- **Not** default-included; **not** billable (Marketplace free install)
- Deactivate via Central/Marketplace subscription tools to revoke access without dropping data

## Bootstrap

New workspaces do **not** get Announcements until Marketplace install.

1. Run create-table migrations (`announcements`, `announcement_reads`)
2. Run `register_announcements_module` + `add_announcements_permissions` data migrations
3. Deploy frontend (dialog, dashboard section, `/announcements`)
4. Install module on the workspace; refresh SPA session for entitlements

## Permissions rollout

Mutation permissions for existing workspaces ship via `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions` (admin defaults). No `announcements.view` permission exists.

## Monitoring

Platform audit events: `announcement_created`, `announcement_updated`, `announcement_deleted`, `announcement_published`.

## Deploy checklist

1. Migrate schema + catalog + permissions
2. Deploy backend (notification job + dashboard widget)
3. Deploy SPA
4. Smoke: Marketplace install → create published announcement as admin → second user sees login dialog → Mark as read → readers list for admin → dashboard unread card disappears after mark-as-read (history remains under Announcements nav)
5. Confirm routes return 403 when module not installed
6. Confirm queue workers are running so publish notifications are delivered
7. Optional: set workspace timezone ≠ UTC and verify `expires_at` matches Settings → General wall clock
