# Leads — User Guide

## Who can use Leads

Your workspace must have the **Leads** module installed (included by default on new workspaces). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `export`, `import`, `convert` as needed).

Without **assign**, you only see leads assigned to you.

## Page tour

Use the **help** icon in the Leads page header to walk through KPIs, filters, create actions, and the board/table. The first visit may open this tour automatically once; you can re-run it anytime from the same icon.

## Board & table

Open **Leads** from the sidebar. The default view is the **Kanban board** (columns = pipeline stages). Switch to **Table** when you prefer a list.

- Search by name, email, phone, or company
- Filter by stage, status, priority, tag, assignee, and lead value range
- KPI cards summarize totals, pipeline value, follow-ups, and conversion metrics for your scope
- Table and board both show **tags**, the **latest note**, and **next follow-up**; hover a truncated preview to read the full note or follow-up details
- **Manage tags** (requires update) opens the workspace tag catalog — create, edit, reorder, delete. Seeded tags include Not Contacted (default), Contacted, No Response (auto follow-up after N days), Invalid Number, Not Interested, Not Applied, and Follow Up Later (forces a follow-up when applied)
- Users with **restore** (workspace **admin** by default, plus owner) can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted lead from the row menu
- **Delete permanently** (force delete) requires `leads.force.delete` — granted to the workspace **owner** by default (or any role you assign it to)

## Create & edit

1. Click **New lead**, or press `N` when not typing in a field (requires **create**; browsers reserve `Ctrl+N` for a new window)
2. Enter name (required) and optional contact / company / source / **lead value** / priority / status
3. Optionally set stage, tags, and assignee (assignee requires **assign**). Applying Follow Up Later requires a follow-up title and due date
4. Save

Press `⌘F` / `Ctrl+F` to focus the Leads search box (filters this list only). Edit from the row menu or the detail drawer.

## High Priority (dashboard)

With **update** permission, open a lead’s detail drawer and click the **High Priority** chip on Overview. That sets priority to **High**; click again to clear it (back to **Medium**). The Dashboard **High Priority** widget lists open-pipeline leads with priority High only (Urgent uses the normal priority field/filter, not that widget).

## Pipeline vs status vs tags

- **Stage** — where the lead sits in the sales pipeline (New … Won / Lost). Drag a card on the board to move stages — the change saves immediately (no drawer). You can also change stage from the detail drawer and **Save**.
- **Status** — lifecycle state managed separately: Active, Waiting, On hold, Closed, Archived. Changing stage does **not** automatically change status.
- **Tags** — multi-select disposition labels. Applying tags never changes stage or status. No Response schedules an auto follow-up using the tag’s day count (workspace timezone).

## Assignment

Users with **assign** can set or clear the assignee. Assignment changes are recorded in **Assignment history**. The assignee receives an in-app realtime notification when someone else assigns them. Lead-assignment email is disabled in v1.

**Eligible assignees** exclude:

- Workspace owners (`superadmin`)
- Suspended users
- Users flagged **Exclude from lead assignment** in Administration → Users (create/edit)

Those users do not appear in lead assignee pickers and are skipped by import auto-distribute and bulk equal distribute. A lead already assigned to someone who is later flagged can still be kept or cleared from the lead drawer.

## Notes & follow-ups

- **Notes** — free-form history on the lead. Type `@` to mention a teammate; they get an in-app notification (and optional email if **Settings → Notifications → Mentioned in a lead note** is on)
- **Follow-ups** — titled reminders with due dates in the workspace **Timezone** (Settings → General); edit/reschedule or complete when done
- Assignees receive notifications when a follow-up is created for them (by someone else) and when due/overdue reminders run (workspace-local “today”)

## WhatsApp (Communication Templates)

When the **Communication Templates** module is installed and you have **use** permission:

1. Open a lead that has a phone number
2. Click **WhatsApp** next to the phone
3. Choose a template, preview the filled message, then **Open WhatsApp**

WhatsApp opens with the message pre-filled. EloSync does not send the message for you. See [Communication Templates](/user-guide/communication-templates).

## Convert

Users with **convert** (and the Contacts module installed) can convert a lead into a contact from lead fields—no separate contact create form. The new contact defaults to **On Boarded Clients** lifecycle. The lead is stamped with `converted_at`, status becomes Closed, and activity is recorded. Use **View contact** from the lead drawer toast/link after convert.

If Contacts is not installed, convert still closes the lead (`converted_at` / Closed) without creating a contact.

Lifecycle on contacts is independent of soft-delete (trash). See [Contacts](/user-guide/contacts).

## Export

Users with **export** can download the current filtered set as **CSV** or **XLSX**.

## Import

Users with **import** can bulk-load leads from **CSV** or **XLSX**:

1. Open **Import** and download a sample template if needed (**CSV** or **XLSX** — both include a **Note** column with a sample value)
2. Upload a file (drag & drop or browse)
3. Map spreadsheet columns to lead fields (Name is required; optional **Note** creates a first note on create, or appends a note on **Update existing**)
4. Choose unique fields (**Email** / **Phone**) and duplicate behavior (**Skip**, **Update existing**, or **Keep duplicate**)
5. Preview counts and validation errors (nothing is written yet)
6. Start the import — it runs in the background; watch progress until complete

**Update existing** also requires the **update** permission.

Use **Import history** to review past imports, download the original file, **failed_records.csv**, or **error_report.csv**. Fix failed rows and upload again.

## Activity timeline

The **Activity** tab shows create, update, stage, assignment, note, follow-up, convert, and related events.
