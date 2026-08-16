# Documents Module

Operations module on the frozen platform. A workspace **flat file library** — upload shared files, organize them with flat categories, and download them — built on the free **Storage** quota. Documents is a **free Marketplace opt-in** with a **hard dependency on Storage**. Soft links to CRM/HR records and nested folders are **not** in v1.

## Guides

| Audience | Document |
|----------|----------|
| Operators / workspace users | [documents.md](/user-guide/documents) |
| Engineers | [documents.md](/developer-guide/documents) |
| Production / ops | [documents.md](/deployment/documents) |
| Module Development Standard | [module-development.md](/developer-guide/module-development) |
| Reference blueprint | [assets-overview.md](/user-guide/assets-overview) |
| Tenant API | [../api/tenant-v1-documents.md](/api/tenant-v1-documents) |

## Capabilities

- Upload workspace files (title, optional description, optional category, file blob)
- Flat categories (name/slug/sort/active) — no nested folders
- Download original file by authenticated API
- Soft delete / restore; permanent delete removes the object from disk
- Table view with search, category filter, and trash filters
- KPIs via `GET /documents/stats` (total, categorized, uncategorized)
- File bytes count toward the workspace **Storage** quota (`documents.size_bytes`)
- Module licensing (`module:documents`) + Spatie permissions — **free Marketplace opt-in**, **requires Storage**
- Audit logging on create / update / soft delete

## Permissions

`documents.view` · `create` · `update` · `delete` · `restore` · `force.delete`

Default roles: **admin** = all except `force.delete`; **manager** = view / create / update; **staff** = view.

## Catalog

Enable Documents from Marketplace (free). Catalog: slug `documents`, category `operations` (Operations), `is_default_included = false`, `is_billable = false`, `sort_order = 85`, version **1.0.0**.

**Hard dependency:** Storage (`storage`) must be entitled first. Install fails without it.

To make Documents billable later, use Central → **Modules** → Documents and set `is_billable` plus prices via the existing **Update Module** API — no new Central UI.

## Storage quota

Uploaded document bytes are included in `WorkspaceStorageService::usedBytes()`. Soft-deleted documents drop out of the sum until restored; force-delete removes the file from object storage.

See [Storage](/user-guide/storage).

## Explicitly deferred

- Soft links to Leads / Contacts / Companies / Tasks / Projects / Assets / etc.
- Nested folders / directory trees
- Versioning / check-in / check-out
- Preview / in-browser viewers
- Dashboard widget
- Automation triggers
