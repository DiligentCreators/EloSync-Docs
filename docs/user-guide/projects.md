# Projects — User Guide

## Who can use Projects

Enable the **Projects** module from Marketplace (free) — no other modules are required first. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign` as needed).

Without **assign**, you only see projects where you are the **assignee**, a **member**, or the **creator**.

## Board & list

Open **Projects** from the sidebar under **Workspace** (after Tasks). The default view is the **Board** (columns by status). Switch to **List** for a table.

- Search by **title**
- Filter by status, Contact / Company / Opportunity (when those modules are installed), assignee, and **My Projects**
- KPI cards summarize totals, mine, by status, and **Overdue** for your scope
- Table and board show assignee, members, dates, optional CRM links, and the **latest note**
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted project from the row menu
- **Delete permanently** requires `projects.force.delete` — granted to the workspace **owner** by default

Status labels:

| Value | Label |
|-------|-------|
| `planned` | Planned |
| `active` | Active |
| `on_hold` | On Hold |
| `completed` | Completed |
| `cancelled` | Cancelled |

## Create & edit

1. Click **New project**
2. Enter a **title** (required) and optional description
3. Optionally set **starts on** / **ends on** dates
4. If Contacts, Companies, or Opportunities are installed, optionally link them
5. Optionally set an assignee and members (requires **assign**)
6. Save — new projects start as **Planned**; without assign permission the creator becomes the assignee

Edit from the row menu or the detail sheet. Status changes use the status action (not free-form field edits of status).

## Status workflow

Move a project with the status action:

- **Activate** (`planned → active`)
- **Put on hold** (`active → on_hold`) or **Resume** (`on_hold → active`)
- **Complete** (`active → completed`) — terminal
- **Cancel** (`planned|active|on_hold → cancelled`) — terminal

Invalid transitions (e.g. completing directly from Planned) are rejected with a validation error.

## Members & assignment

- **Assignee** is the primary owner of the project
- **Members** are additional teammates who can see and work the project (without **assign**, membership grants visibility)
- The assignee is **not** duplicated as a member
- Users with **assign** can set/clear the assignee (`Assign`) and sync members
- The assignee receives an in-app notification when someone else assigns them; newly added members are notified when they are added

## Optional CRM links

Contact, Company, and Opportunity links are **soft** — they only appear when the corresponding module is installed, and they are always optional. A project without links works the same as one with them.

## Tasks on a project

When Projects is enabled, Tasks can optionally set a **project** (`project_id`). The link is soft: Tasks still work without Projects; linking fails validation if Projects is not entitled or you cannot see that project. See [Tasks](/user-guide/tasks).

## Dates & overdue

`starts_on` / `ends_on` are **dates** (not date-times). **Overdue** means the project is still open (`planned`, `active`, or `on_hold`), has an end date, and that end date is **before today** in the workspace **Timezone** (Settings → General). A project ending today is not overdue.

## Notes & timeline

- **Notes** — free-form notes on the project
- **Timeline** — history of create, update, assignment, members sync, status change, note, and delete/restore events

## Dashboard

When Projects is entitled and you have `projects.view`, the dashboard can show **Active projects** and **Overdue projects** widgets (same visibility rules as the list).

## What's not here yet

Gantt charts, milestones, task dependencies, workload heatmaps, Calendar projection, Automation `create_project`, project tags, and `PRJ-` numbers are deferred — see the [Product Roadmap](/getting-started/product-roadmap).
