# Knowledge Base — User Guide

Install **Knowledge Base** from Marketplace (free **Operations** module). Until it is installed, the Knowledge Base nav stays hidden. This module is for **internal team** articles only — there is no public or customer portal in v1.0.0.

## Install

1. Open **Marketplace**
2. Find **Knowledge Base** under **Operations**
3. Install (free; not included by default)
4. Refresh the app session if the sidebar does not update immediately

## Categories

Requires `knowledge-base.create` (or update/delete as noted).

1. Open **Knowledge Base** → manage categories
2. Create a category with a name (slug is generated if omitted)
3. Optionally set sort order and active flag

Categories are **flat** (no nesting). You cannot delete a category while articles still use it — reassign or clear the category on those articles first.

## Create and publish an article

Requires `knowledge-base.create` to create; `knowledge-base.update` to edit and change status.

1. Click **New article**
2. Enter title (required), optional slug / excerpt / category
3. Write the body in the TipTap editor (HTML stored on the server)
4. Save as **Draft**, or set status to **Published** / **Archived**

Publishing sets `published_at` when it was empty. Returning to draft clears `published_at`. There is no publish notification fan-out in v1.

## Who sees what

| Role / permission | Visibility |
|-------------------|------------|
| `knowledge-base.view` only | **Published** articles only |
| Also has `knowledge-base.update` | Drafts, published, archived, and trash (with filters) |

## Search and filters

On the articles list, search matches title, excerpt, and body. Editors with update permission can filter by status and trash (`with` / `only`). View-only users always see the published audience set.

## Notes and activity

Open an article detail sheet to:

- Add **notes** (requires `knowledge-base.update`)
- Review the **activity** timeline (created, updated, status changed, note, deleted, restored)

## Permissions

| Permission | Ability |
|------------|---------|
| `knowledge-base.view` | List / open articles and categories (published-only without update) |
| `knowledge-base.create` | Create articles and categories |
| `knowledge-base.update` | Edit, publish / archive, add notes; see drafts / archived / trash |
| `knowledge-base.delete` | Soft delete |
| `knowledge-base.restore` | Restore from trash |
| `knowledge-base.force.delete` | Permanently delete (already soft-deleted) |

Default role map: **admin** gets all except `force.delete`; **manager** gets view / create / update; **staff** gets view. Workspace owners (`superadmin`) receive all permissions via provisioning.

## Explicitly deferred

- Public URLs and customer portal
- Help Desk links
- Attachments / image upload
- Nested categories
- Dashboard widget
- Automation triggers
- Publish fan-out notifications

## Related

- [Knowledge Base overview](/user-guide/knowledge-base-overview)
- [Tenant API](/api/tenant-v1-knowledge-base)
- [Marketplace](/user-guide/tenant-application#marketplace-add--remove-modules)
