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
- KPI cards show total links, active links, total clicks, and clicks in the last 7 days
- **Short URL** column shows each link with a copy icon; you can also copy from the row menu

## Create & edit

1. Click **New short link** (shortcut: `n` when the list is focused and you have create permission)
2. Enter a destination URL (required) and optional title, status, expiry, and UTM parameters
3. Choose a **Type**: Redirect (immediate), Splash page (branded interstitial then continue), or Bio / link page (multiple outbound buttons)
4. For splash pages, set headline, body, CTA label, optional delay, and theme. For bio pages, add links as `Label | URL` lines.
5. Optionally set a **Custom slug** (e.g. `launch-2026`) for a vanity URL — leave blank for an auto-generated 7-character code. Slugs cannot be changed after creation.
6. Save — EloSync generates a public short URL on `https://go.elosync.com/r/{code}`. Your operator may use a different short domain via `SHORT_LINK_BASE_URL`.

Edit from the row menu or the record page. Focus search with `Ctrl/⌘+F`.

## Record page

- **Details** — slug, destination, status, expiry, copyable short URL (inline copy icon)
- **Analytics** (requires `view_analytics`) — total and unique clicks, optional date range, clicks-by-day and by-hour charts, top referrers, devices, browsers, operating systems, and CSV export

## Status

| Status | Meaning |
|--------|---------|
| Active | Redirects visitors to the destination URL |
| Paused | Redirect shows an EloSync-branded unavailable page; link remains editable |

Expired links (past **Expires at**) and deleted links also stop redirecting.

## Public redirects

Visitors open the short URL without signing in. Clicks are recorded asynchronously (bots are redirected but not counted). UTM parameters configured on the link are appended to the destination URL on redirect.

When a link is missing, paused, expired, or deleted, visitors see an **EloSync-branded page** with links to learn about EloSync and join the Founding Beta — not a plain browser error page.
