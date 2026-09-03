# Documents — User Guide

## Who can use Documents

Your workspace must have **Storage** and **Documents** installed. Documents cannot install without Storage. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete` as needed).

## Install

1. Open **Marketplace**
2. Install free **Storage** first (if not already entitled — Team Chat may have installed it for you)
3. Install free **Documents** under Operations
4. Open **Documents** from the sidebar

Without Storage, Marketplace blocks Documents install. Uploads also require remaining Storage quota.

## List

Open **Documents** from the sidebar (Operations area).

- Search by title, description, or original file name
- Filter by category, or toggle trash filters (**Active / Include deleted / Deleted only**) when you have **restore**
- KPI cards summarize total, categorized, and uncategorized counts
- **Delete permanently** requires `documents.force.delete` (not on default role maps — same posture as Vendors / Assets)

## Upload

1. Click **New document** (shortcut: `n` when the list is focused and you have create permission)
2. Enter a title (required). Optionally add a description and category
3. Optionally link a **Contact**, **Company**, or **Lead** when those modules are installed — use **New** beside a picker to create and select inline when you have create permission
4. Choose a file (required on create). Allowed types include common office docs, images, text/CSV, and archives; max **50 MB** per file
5. Save — the file is stored on the workspace uploads disk under the tenant Documents directory

Focus search with `Ctrl/⌘+F`.

## Categories

Categories are a flat list (no nested folders).

- Create / edit categories from the Documents UI (permissions reuse `documents.create` / `update` / `delete` / `restore` / `force.delete`)
- Assign a category when uploading or editing a document
- You cannot soft-delete a category that still has documents; clear or reassign them first

## Download

Open a document and use **Download**, or call the download endpoint. Download requires `documents.view`. Soft-deleted files are not downloadable until restored.

## Edit & replace file

Edit metadata (title, description, category) from the row menu or the document page. Optionally replace the file on update — the new size must fit remaining Storage quota (only the delta counts when the new file is larger).

## Soft delete & restore

- **Delete** soft-deletes the document row; the file remains on disk but **stops counting** toward Storage used bytes
- Only the **uploader** or the **workspace owner** can delete or permanently delete a document (having delete permission alone is not enough for someone else’s files)
- Select multiple active documents you own (or all, if you are the owner) and use **Delete (N)** for bulk soft delete
- **Restore** brings it back into the library and quota (blocked if restoring would exceed Storage allowance)
- **Delete permanently** removes the row and deletes the object from storage (trash / Deleted only) — same ownership rule
- In **Deleted only**, select rows and use **Delete permanently (N)** for bulk permanent delete
- Soft-deleted documents older than your workspace **trash retention** (Settings → General) are purged automatically — including the file on disk (`trash:purge-expired`). Retention `0` keeps trash forever.

## Permissions

| Permission | Typical use |
|------------|-------------|
| `documents.view` | List, open, download, stats, browse categories |
| `documents.create` | Upload documents; create categories |
| `documents.update` | Edit metadata / replace file; update categories |
| `documents.delete` | Soft delete documents and empty categories |
| `documents.restore` | Restore soft-deleted rows; trash filters |
| `documents.force.delete` | Permanently delete (owner/superadmin only by default) |

## Storage quota

Every active document’s `size_bytes` counts toward the workspace Storage allowance (along with Team Chat attachments, feedback screenshots, and lead imports). Soft-deleted documents are excluded from used bytes. If upload fails with a quota error, free space or upgrade a Storage pack — see [Storage](/user-guide/storage).

## Related

- [Documents overview](/user-guide/documents-overview)
- [Storage](/user-guide/storage)
