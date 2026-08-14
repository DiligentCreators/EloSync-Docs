# Knowledge Base — Production Guide

## Licensing

- Catalog slug: `knowledge-base`, version **1.0.0**
- Category: Operations (`operations`, category sort `40`), module sort `60`, icon `book-open`
- **Not** default-included; **not** billable (Marketplace free install; prices `$0`)
- No hard module dependencies
- Deactivate via Central/Marketplace subscription tools to revoke access without dropping data

## Bootstrap

New workspaces do **not** get Knowledge Base until Marketplace install.

1. Run create-table migrations (`knowledge_base_categories`, `knowledge_base_articles`, `knowledge_base_article_notes`, `knowledge_base_article_activities`)
2. Run `register_knowledge_base_module` + `add_knowledge_base_permissions` data migrations
3. Deploy frontend (`src/pages/knowledge-base/`, tour `knowledge-base`)
4. Install module on the workspace; refresh SPA session for entitlements

## Permissions rollout

Permissions for existing workspaces ship via `TenantPermissionSynchronizer::grantMissingDefaultRolePermissions` (additive):

- admin: view / create / update / delete / restore (not `force.delete`)
- manager: view / create / update
- staff: view

`force.delete` remains owner/custom grant only unless explicitly assigned.

## Monitoring

Platform audit events: `knowledge_base_article_created`, `knowledge_base_article_updated`, `knowledge_base_article_deleted`, `knowledge_base_article_note_added`.

Spatie activity log name: `knowledge-base`. Domain timeline: `knowledge_base_article_activities`.

## Deploy checklist

1. Migrate schema + catalog + permissions
2. Deploy backend (routes under `/api/tenant/v1/knowledge-base*` and `/knowledge-base-categories*`)
3. Deploy SPA
4. Smoke: Marketplace install → create category → create draft article → publish → staff with view-only sees published only → editor sees drafts/trash → soft delete / restore → confirm category delete blocked while articles use it
5. Confirm routes return 403 when module not installed
6. Optional: Playwright `npm run test:e2e:knowledge-base`
