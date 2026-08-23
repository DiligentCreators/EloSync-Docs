# Short Links — User Guide

## Install the module

**Short Links** is a free Marketplace module. Install it from **Marketplace → Operations** before creating links.

## Who can use Short Links

Your workspace must have the **Short Links** module installed. Your role needs the relevant permissions:

| Permission | Allows |
|------------|--------|
| `view` | List and open short links |
| `create` | Create new links |
| `update` | Edit links |
| `delete` / `restore` / `force.delete` | Trash lifecycle |
| `view_analytics` | Click stats on the record page |

## List

Open **Short Links** from the sidebar (Operations).

- Search by title or destination URL
- Filter by status (Active / Paused) and trash state when you can restore
- KPI cards show total links, active links, and total clicks
- Copy a short URL from the row menu

## Create & edit

1. Click **New short link** (shortcut: `n` when the list is focused and you have create permission)
2. Enter a destination URL (required) and optional title, status, expiry, and UTM parameters
3. Save — EloSync generates a public short URL on `https://go.elosync.com/r/{code}` (7-character code). Your operator may use a different short domain via `SHORT_LINK_BASE_URL`.

Edit from the row menu or the record page. Focus search with `Ctrl/⌘+F`.

## Record page

- **Details** — destination, status, expiry, copyable short URL
- **Analytics** (requires `view_analytics`) — total clicks, clicks by day, top referrers, device breakdown

## Status

| Status | Meaning |
|--------|---------|
| Active | Redirects visitors to the destination URL |
| Paused | Redirect returns not found; link remains editable |

Expired links (past **Expires at**) also stop redirecting.

## Public redirects

Visitors open the short URL without signing in. Clicks are recorded asynchronously (bots are redirected but not counted). UTM parameters configured on the link are appended to the destination URL on redirect.
