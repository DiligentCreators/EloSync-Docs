# Storage

Workspace content storage for chat attachments, feedback screenshots, and lead imports. Logos, favicons, and profile avatars stay on the app server and do **not** count toward this quota.

## Enable Storage

1. Open **Marketplace**
2. Find **Storage** (free) under the Storage category
3. Click **Install**

New workspaces start with **0 GB** of content storage until Storage is installed. Installing **Team Chat** also installs free Storage automatically so chat attachments keep working. Workspaces that already existed when Storage shipped were granted the free module automatically (grandfather migration).

Permission **View storage** (`storage.view`) opens Settings → Storage. Workspace admins get view + manage by default.

## Allowance

| SKU | Slug | Monthly (USD) | Yearly (USD) | Total allowance |
|-----|------|---------------|--------------|-----------------|
| Storage (free) | `storage` | $0 | $0 | **1 GB** |
| Storage 10 GB | `storage-10` | $4 | $40 | 10 GB |
| Storage 50 GB | `storage-50` | $12 | $120 | 50 GB |
| Storage 100 GB | `storage-100` | $20 | $200 | 100 GB |
| Storage 500 GB | `storage-500` | $75 | $750 | 500 GB |
| Storage 1000 GB | `storage-1000` | $120 | $1200 | 1000 GB |

Pack size is the **total** workspace allowance (not added on top of the free 1 GB). Only **one** capacity pack can be active at a time — cancel the current pack before purchasing another.

## Upgrade / change pack

1. If another pack is already active, open that pack in Marketplace and **Cancel subscription**
2. Purchase the new pack size (requires free Storage installed)
3. Gateway product mapping must exist for billable packs (Stripe / Creem) before checkout succeeds

Cancelling a pack returns the workspace to the free 1 GB (while `storage` remains installed). Cancelling free Storage while a pack is still active is blocked by the pack’s required dependency.

## What counts

**Included in quota**

- Team Chat message attachments
- Feedback screenshots / attachments
- Lead import source files (and generated error reports when present)

**Not included**

- Workspace / Central branding logos and favicons
- Profile avatars

## Settings

**Settings → Storage** shows used bytes, allowance, percent used, and the current pack (or Free 1 GB). Use **Upgrade storage** to open Marketplace.

## When uploads fail

| Situation | Message |
|-----------|---------|
| Storage not installed | Install the free Storage module (`STORAGE_REQUIRED`) |
| Over quota | Upgrade storage pack or free space (`STORAGE_QUOTA_EXCEEDED`) |
| Another pack already active | Cancel the current pack first (`STORAGE_PACK_CONFLICT`) |

## Related

- [Storage overview](/user-guide/storage-overview)
