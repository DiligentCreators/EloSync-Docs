# Tenant Application — User Guide

The Tenant Application is your workspace home. It uses the same layout as the Central admin console so navigation, headers, and page structure feel familiar.

## Tenant navigation

The left sidebar includes:

| Item | Purpose |
|------|---------|
| **Dashboard** | Workspace overview with module widgets |
| **Leads** | CRM pipeline (Kanban/table, notes, follow-ups) |
| **Tasks** | Work items (board/list, status, priority, comments) |
| **Templates** | Communication Templates (plain-text messages, WhatsApp from Leads) |
| **Settings** | Workspace preferences |
| **Profile** | Your name, email, and password |

Header actions match Central:

- Collapse / expand the sidebar
- Breadcrumbs
- Search (⌘K / Ctrl+K)
- Theme toggle
- **Notifications** — realtime in-app list and unread badge, with polling fallback when the live connection is unavailable
- Settings shortcut
- Account menu (Profile, Settings, Log out)

Only modules available to every workspace are listed today. Additional purchased modules will appear in the sidebar when they are installed.

## Marketplace (add / remove modules)

Open **Settings → Marketplace → Open Marketplace**, or go to `/#/marketplace` when Marketplace is enabled.

| Action | Who | Notes |
|--------|-----|-------|
| **Install** / **Subscribe** | `marketplace.purchase` | Free modules activate immediately; paid modules go through checkout |
| **Remove** / **Cancel subscription** | `marketplace.purchase` | Opt-in modules only — not core Leads/Tasks. Remove **dependents** first when prompted (modules that need this one) |
| **Browse** | `marketplace.view` | Catalog search, filter chips (**Installed** / **Available** / **Paid** / **Free**), and module details. Badges: **Installed**, **Available** (free), **Billable** (paid), or **Pending** |

When a module requires another module that is not installed yet, the detail drawer lists the dependency with its fee (**Free** or subscription price) and an **Install** / **Subscribe** action. Enable required modules first; the parent module’s Install/Subscribe unlocks afterward.

### Catalog pricing (current)

| Tier | Modules | Price |
|------|---------|-------|
| **Included free** | Leads, Tasks | Auto-installed on every workspace |
| **Free to install** | Contacts, Companies, Calendar, Meetings, Activities, Opportunities, Quotations, Contracts, Communication Templates | $0 — install from Marketplace |
| **Paid** | Branded | **$29/month** or **$290/year** (USD catalog) |

Marketplace shows paid prices in your **workspace currency** (Settings → General) as an approximate conversion from the USD catalog. **Checkout is still billed in the catalog currency (USD)** via the payment provider. Commercial flags live on the Central `modules` catalog. Full table: [Entitlements](/developer-guide/entitlements).

## Dashboard overview

`GET /dashboard` returns workspace info plus a **widget registry**. You may see:

- **Pipeline / sources / revenue** — when Leads is installed and you can view leads
- **Today’s / overdue follow-ups** and deals closing soon — Leads-scoped
- **Upcoming / overdue tasks** — when Tasks is installed and you can view tasks
- **Upcoming events** — when Calendar is installed and you can view calendar
- **Activity feed**, **notifications** preview, and **quick actions**

Widget data respects module licensing, your permissions, and assignee scope (without assign permission you only see your own leads/tasks; Calendar uses `calendar.view_all` for org vs mine).

## Switching apps

| App | Typical entry |
|-----|----------------|
| Tenant (workspace) | `/login` → `/dashboard` |
| Central (platform admin) | `/central/login` → `/central/dashboard` |

Sessions are isolated. Logging into one app does not automatically sign you into the other.
