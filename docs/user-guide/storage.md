# Storage — User Guide

**Storage** gives each workspace a content-file quota for Team Chat attachments, feedback screenshots, and lead import files. Logos, favicons, and profile avatars stay on the app server and do **not** count toward this quota.

## Pricing

| SKU | Slug | Monthly (USD) | Yearly (USD) | Total allowance |
|-----|------|---------------|--------------|-----------------|
| Storage (free) | `storage` | $0 | $0 | **1 GB** |
| Storage 10 GB | `storage-10` | $4 | $40 | 10 GB |
| Storage 50 GB | `storage-50` | $12 | $120 | 50 GB |
| Storage 100 GB | `storage-100` | $20 | $200 | 100 GB |
| Storage 500 GB | `storage-500` | $75 | $750 | 500 GB |
| Storage 1000 GB | `storage-1000` | $120 | $1200 | 1000 GB |

Pack sizes are **total** workspace allowance (they replace the free 1 GB, they do not add to it). Only **one** capacity pack can be active at a time — cancel the current pack before purchasing another.

Not default-included. Install free Storage from Marketplace; buy packs the same way.

## Who can use it

1. Install **Storage** from Marketplace (`module:storage`) — unlocks 1 GB.
2. Permission **View storage** (`storage.view`) to open Settings → Storage. Workspace admins get view + manage by default.

Installing **Team Chat** also installs free Storage automatically so chat attachments keep working.

## What counts

| Counts toward quota | Does not count |
|---------------------|----------------|
| Team Chat message attachments | Workspace / Central logos & favicons |
| Feedback screenshots | Profile avatars |
| Lead import source files (+ error/failed CSVs) | Temp / system paths outside those features |

## Check usage

**Settings → Storage** shows used vs allowance, the active pack (if any), and a link to Marketplace to upgrade.

When uploads exceed the allowance, the API returns `STORAGE_QUOTA_EXCEEDED` and the SPA shows an upgrade toast. Without Storage installed, content uploads return `STORAGE_REQUIRED`.

## Upgrade / downgrade

1. Open Marketplace → the pack you want (or Settings → Storage → Upgrade).
2. If another pack is already active, **Cancel** it first.
3. Subscribe to the new pack (requires free Storage installed).

Cancelling a pack returns the workspace to the free 1 GB (while `storage` remains installed). Cancelling free Storage while a pack is still active is blocked by the pack’s required dependency.
