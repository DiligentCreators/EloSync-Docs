# Announcements — User Guide

Install **Announcements** from Marketplace (free Communication module). Until it is installed, announcements nav, dialog, and dashboard block stay hidden.

## Who can see announcements?

Each announcement has **Visible to** audiences:

- **Internal staff** — owners, admins, agents, and employees with a User login (inbox, dashboard, notifications). There is no separate “view announcements” permission.
- **Customer portal** — invited contacts in the customer portal (only when Customer Portal is installed). Toggle appears on create/edit when that module is entitled.
- **Vendor portal** — reserved for when Vendor Portal is available; the toggle appears only if that module is installed.

At least one audience is required. Employees without a linked login cannot open EloSync, so they cannot receive staff announcements.

## After login

When there are unread published announcements, a dialog opens after you land in the app. Choose **Mark as read** (records time + IP) or **View all**. Closing without marking as read does not clear the dialog for the next visit.

## Dashboard

On the workspace dashboard, an **Announcements** section appears under the welcome greeting only while you still have unread published announcements. Each item is labeled **Announcement** and includes **Mark as read**. After you mark them as read, the section hides. Use **Announcements** in the nav (or View all) for full history.

## Announcements page

Open **Announcements** from the sidebar under **Communication**.

- Everyone sees published (non-expired) history.
- Users with create/update/delete/restore/force-delete permissions can manage drafts, trash, and permanent delete.
- Open an announcement to read it and mark it as read again (updates last read time/IP).
- Users with **view who read** (`announcements.view_reads`) see the readers list with first/last read time and IP.

## Creating announcements

Requires `announcements.create`.

1. Click **New announcement**
2. Enter title and body in the rich text editor (headings, lists, links, text color — HTML stored on the server)
3. Set status to **Draft**, **Published**, or **Archived**
4. Optional expires-at (workspace timezone for display; stored as UTC)
5. Choose **Visible to** audiences (Internal staff and, when modules are installed, Customer portal / Vendor portal)

Publishing notifies other workspace users in the notification center only when **Internal staff** is selected.

## Permissions (mutations only)

| Permission | Ability |
|------------|---------|
| `announcements.create` | Create announcements |
| `announcements.update` | Edit / publish / archive |
| `announcements.delete` | Soft delete |
| `announcements.restore` | Restore from trash |
| `announcements.force.delete` | Permanently delete |
| `announcements.view_reads` | See who read an announcement |

Default role map grants these to **admin**. Workspace owners (`superadmin`) receive all permissions via provisioning.

## Related

- [Announcements overview](/user-guide/announcements-overview)
- [Tenant API](/api/tenant-v1-announcements)
- [Marketplace](/user-guide/tenant-application#marketplace-add--remove-modules)
