# Documents Module

Operations module on the frozen platform. A workspace **file library** — upload shared files, organize them with flat categories and nested folders, keep prior file versions on replace, optionally link them to CRM/HR/project records, and download them — built on the free **Storage** quota. Documents is a **free Marketplace opt-in** with a **hard dependency on Storage**.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [documents.md](/user-guide/documents) |
| Engineers | [documents.md](/developer-guide/documents) |
| Production / ops | [documents.md](/deployment/documents) · [baseline readiness](/deployment/documents-production-readiness) · [folders + versions 1.7.0 readiness](/deployment/documents-folders-versions-1-7-0-production-readiness) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [assets-overview.md](/user-guide/assets-overview) |
| Tenant API | [../api/tenant-v1-documents.md](/api/tenant-v1-documents) |

## Capabilities

- Upload workspace files (title, optional description, optional category, optional folder, file blob)
- Flat categories (name/slug/sort/active)
- **Nested folders** (parent/child tree, max 5 levels) alongside categories — optional `folder_id` on each document
- **File version history** — replacing a file archives the previous blob; list / download / restore prior versions (no check-in/check-out)
- **Soft links** to entitled Leads, Contacts, Companies, Projects, Employees, Assets, and Tasks (optional; module + permission gated per record type)
- Download original file (and prior versions) by authenticated API
- Soft delete / restore; permanent delete removes the current file and all version blobs from disk
- Bulk soft delete (active list) and bulk permanent delete (Deleted only)
- Table view with search, category filter, folder filter, and trash filters
- KPIs via `GET /documents/stats` (total, categorized, uncategorized, in_folder, unfiled)
- Automation trigger `document.created` when Automation is entitled
- Current file bytes **plus** version bytes count toward the workspace **Storage** quota
- Module licensing (`module:documents`) + Spatie permissions — **free Marketplace opt-in**, **requires Storage**
- Audit logging on create / update / soft delete / restore / force delete
- Soft-deleted files purged with workspace trash retention (`trash:purge-expired`)

## Permissions

`documents.view` · `create` · `update` · `delete` · `restore` · `force.delete`

**Delete / force delete ownership:** users may only soft-delete or permanently delete documents they uploaded (`created_by`), even when they hold `documents.delete` / `documents.force.delete`. The workspace owner (`superadmin` role) may delete any document. View / create / update / restore are unchanged permission gates. Folders reuse the same `documents.*` permissions (no separate Spatie abilities).

Default roles: **admin** = all except `force.delete`; **manager** = view / create / update; **staff** = view.

## Catalog

Enable Documents from Marketplace (free). Catalog: slug `documents`, category `operations` (Operations), `is_default_included = false`, `is_billable = false`, `sort_order = 85`, version **1.7.0**.

**Hard dependency:** Storage (`storage`) must be entitled first. Install fails without it.

To make Documents billable later, use Central → **Modules** → Documents and set `is_billable` plus prices via the existing **Update Module** API — no new Central UI.

## Storage quota

Uploaded document bytes and archived version bytes are included in `WorkspaceStorageService::usedBytes()`. Soft-deleted documents (and their versions) drop out of the sum until restored; force-delete removes all related objects from object storage.

See [Storage](/user-guide/storage).

## Explicitly deferred

- Check-in / check-out locking
- Preview / in-browser viewers
- Dashboard widget
- Recursive “include descendants” folder list filters
