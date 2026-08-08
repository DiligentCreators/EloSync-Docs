# Leads — User Guide

## Who can use Leads

Your workspace must have the **Leads** module installed (included by default on new workspaces). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `export`, `import`, `convert` as needed).

Without **assign**, you only see leads assigned to you.

## Page tour

Use the **help** icon in the Leads page header to walk through KPIs, filters, create actions, and the board/table. The first visit may open this tour automatically once; you can re-run it anytime from the same icon.

## Board & table

Open **Leads** from the sidebar. The default view is the **Kanban board** (columns = pipeline stages). Switch to **Table** when you prefer a list.

- Search by name, email, phone, or company
- Each stage column header and its cards use that stage’s color; Stage badges in the table and detail drawer use the same colors
- Filter by stage, status, priority, tag, assignee, and lead value range
- KPI cards summarize totals, pipeline value, follow-ups, and conversion metrics for your scope
- Table and board both show **lead type**, **tags**, the **latest note**, and **next follow-up**; hover a truncated preview to read the full note or follow-up details
- **Manage tags** (requires update) opens the workspace tag catalog — create, edit, reorder, delete. Seeded tags include Direct Lead / Company Lead (synced from lead type), Not Contacted (default), Contacted, No Response (auto follow-up after N days), Invalid Number, Not Interested, Not Applied, and Follow Up Later (forces a follow-up when applied)
- Users with **restore** (workspace **admin** by default, plus owner) can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted lead from the row menu
- **Delete permanently** (force delete) requires `leads.force.delete` — granted to the workspace **owner** by default (or any role you assign it to)

## Create & edit

1. Click **New lead**, or press `N` when not typing in a field (requires **create**; browsers reserve `Ctrl+N` for a new window)
2. Enter name (required), **lead type** (Direct or Company), and optional contact / company / source / **lead value** / priority / status
3. Optionally set stage, tags, and assignee (assignee requires **assign**). Applying Follow Up Later requires a follow-up title and due date
4. Save

Press `⌘F` / `Ctrl+F` to focus the Leads search box (filters this list only). Edit from the row menu or the detail drawer.

## High Priority (dashboard)

With **update** permission, open a lead’s detail drawer and click **Mark High Priority** on Overview. That sets priority to **High**; click again to clear it. If you marked High from another priority in this browser tab, clear **restores that previous priority** (for example Urgent → High → Urgent). If High was set elsewhere and no restore value is known, clear falls back to **Medium**.

The Dashboard **High Priority** widget lists open-pipeline leads with priority **High** only. **Urgent is intentionally excluded** from that widget (use the Leads priority filter for Urgent). Existing Urgent open deals that previously appeared on the widget will leave the card after this change until marked High.

## Pipeline vs status vs tags

- **Stage** — where the lead sits in the sales pipeline (New … Won / Lost). Drag a card on the board to move stages — the change saves immediately (no drawer). You can also change stage from the detail drawer and **Save**.
- **Status** — lifecycle state managed separately: Active, Waiting, On hold, Closed, Archived. Changing stage does **not** automatically change status.
- **Tags** — multi-select disposition labels. Applying tags never changes stage or status. No Response schedules an auto follow-up using the tag’s day count (workspace timezone).
- **Lead type** — Direct or Company. Saved on the lead and mirrored by the system tags Direct Lead / Company Lead (only one type tag at a time).

## Assignment

Users with **assign** can set or clear the assignee. Assignment changes are recorded in **Assignment history**. The assignee receives an in-app realtime notification when someone else assigns them. Lead-assignment email is disabled in v1.

**Eligible assignees** exclude:

- Workspace owners (`superadmin`)
- Suspended users
- Users flagged **Exclude from lead assignment** in Administration → Users (create/edit)

Those users do not appear in lead assignee pickers and are skipped by import auto-distribute and bulk equal distribute. A lead already assigned to someone who is later flagged can still be kept or cleared from the lead drawer.

**Receive website leads** is a separate opt-in for the custom webhook website-recipient pool when an endpoint has automatic assignment enabled. It does **not** remove users from assignee pickers or equal distribute.

When a lead is assigned or reassigned, the assignee’s **Default lead commission %** (set in Administration → Users) is copied onto the lead as a read-only **Commission rate** for reporting. Unassign clears it. This is display/export only — EloSync does not calculate payouts.

## Notes & follow-ups

- **Notes** — free-form history on the lead. Type `@` to mention a teammate (the composer shows their name; the system keeps the user id for notifications). They get an in-app notification (and optional email if **Settings → Notifications → Mentioned in a lead note** is on)
- **Follow-ups** — titled reminders with due dates in the workspace **Timezone** (Settings → General); edit/reschedule or complete when done
- Assignees receive notifications when a follow-up is created for them (by someone else) and when due/overdue reminders run (workspace-local “today”)
- **Inactivity alerts** — when an assigned open lead has no meaningful activity for the configured number of Mon–Sat working days (Settings → Leads; default 3), the assignee is notified. Department managers (or workspace owners if none) receive an escalation alert. Sundays do not count. Notes, follow-ups, stage/status changes, CRM activities, and tag changes reset the timer; assignment alone does not.

## WhatsApp (Communication Templates)

When the **Communication Templates** module is installed and you have **use** permission:

1. Open a lead that has a phone number
2. Click **WhatsApp** next to the phone
3. Choose a template, preview the filled message, then **Open WhatsApp**

WhatsApp opens with the message pre-filled. EloSync does not send the message for you. See [Communication Templates](/user-guide/communication-templates).

## Convert

Users with **convert** can convert a lead from the detail drawer. Behavior depends on which Marketplace modules are installed:

- **Contacts** — creates a linked Contact from lead fields (name, email, phone, job title) with lifecycle **On Boarded Clients**. Requires `contacts.create`. No separate contact form.
- **Companies** — when the lead has a company name, creates a Company or reuses an existing one (case-insensitive name match) and links it to the Contact. Requires `companies.create` when a new company must be created.
- **Opportunities** (optional) — check **Also create an opportunity**, enter a name (defaults to the lead name), and optionally an amount (defaults from lead value). Requires `opportunities.create`. The opportunity is linked to the lead, contact, and company when those exist.

The lead is stamped with `converted_at`, status becomes Closed, and activity is recorded. After convert, the drawer shows **View contact** / **View company** / **View opportunity** links when those records were created and you can view them.

If Contacts is not installed, convert still closes the lead (`converted_at` / Closed) without creating a contact. Company and opportunity can still be created when those modules are installed.

Lifecycle on contacts is independent of soft-delete (trash). See [Contacts](/user-guide/contacts).

## Export

Users with **export** can download the current filtered set as **CSV** or **XLSX** (includes **Commission Rate %** when the lead is assigned).

## Import

Users with **import** can bulk-load leads from **CSV** or **XLSX**:

1. Open **Import** and download a sample template if needed (**CSV** or **XLSX** — both include a **Note** column with a sample value)
2. Upload a file (drag & drop or browse)
3. Map spreadsheet columns to lead fields (Name is required; optional **Note** creates a first note on create, or appends a note on **Update existing**)
4. Choose unique fields (**Email** / **Phone**) and duplicate behavior (**Skip**, **Update existing**, or **Keep duplicate**)
5. Preview counts and validation errors (nothing is written yet)
6. Start the import — it runs in the background; watch progress until complete

When another lead with the same email or phone was already created **today** (workspace timezone from Settings → General), EloSync applies the **Duplicate** tag and notifies the existing lead’s assignee, creator, and the person importing — even if the row is skipped. Manual create and inbound webhooks follow the same same-day rule (manual create still adds the new lead).

**Update existing** also requires the **update** permission.

**Automatically distribute** (equal split) is available only when you have **assign** and you are a **department manager** of at least one active department. Newly created leads are shared equally among eligible members of your managed department(s) (owners and users marked **Exclude from lead assignment** are skipped). Non-managers cannot enable this mode.

Use **Import history** to review past imports, download the original file, **failed_records.csv**, or **error_report.csv**. Fix failed rows and upload again.

## Integrations (webhooks)

Users with **manage integrations** can open **Integrations** from the Leads page.

**Custom webhooks** — create endpoints for Zapier, website forms, etc. Each endpoint can enable **Assign to website recipients**. When on, new leads from that webhook are shared equally among users who are eligible assignees **and** have **Receive website leads** enabled in Administration → Users. If nobody is in that pool, the lead stays unassigned (ingest still succeeds). Meta Lead Ads does not use this pool.

## Activity timeline

The **Activity** tab shows create, update, stage, assignment, note, follow-up, convert, and related events.
