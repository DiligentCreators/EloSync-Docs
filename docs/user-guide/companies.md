# Companies — User Guide

## Who can use Companies

Your workspace must have the **Companies** module installed. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `export`, `import` as needed).

Without **assign**, you only see companies assigned to you.

## List

Open **Companies** from the sidebar under **CRM** (between Leads and Contacts).

- Search by name, email, phone, website, or industry
- Filter by industry and assignee, or toggle **My Companies**
- KPI cards summarize total companies, my companies, unassigned, with email, and created this week
- The table shows the **latest note**; hover a truncated preview to read the full note
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted company from the row menu
- **Delete permanently** (force delete) requires `companies.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New company**
2. Enter name (required) and optional email, phone, website, industry, address, source, and assignee
3. Save

Edit from the row menu or the record page.

## Related sales documents

On a company record page (when the matching module is installed and you have create permission), use **New quotation**, **New invoice**, or **New payment** — create opens with `?company=` preselected.

## Billing hub & statement

When **Invoices** and/or **Payments** are installed, the company record shows invoiced / paid / remaining totals, recent documents (including credit notes when installed), deep links to `/invoices?company=` and `/payments?company=`, and a **Statement** page with opening/closing balance for the selected date range (PDF when available).

## Related opportunities, tickets, projects & documents

When those modules are installed and you can view them, the company record also lists recent **opportunities**, **help desk tickets**, **projects**, and **documents** linked to this company. **View all** opens the module list filtered with `?company=`.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form.

## Notes & activity

- **Notes** — free-form notes on the company
- **Activity** — timeline of create, update, assignment, note, and delete/restore events

## Linking Contacts

On a Contact create/edit form, when Companies is installed and you have `companies.view`, pick a **Company** from the picker. Use **New** (requires `companies.create`) to create a company in a dialog without leaving the contact form — the new company is selected automatically. The contact’s legacy company text field is kept in sync with the linked Company’s name. The company record page lists linked contacts.

## Follow-ups (1.4.0)

Open a company record page and use the **Follow-ups** section:

1. Enter a **Title** and **Due at** (workspace **Timezone**, Settings → General), optional notes/assignee — requires `companies.update`
2. **Create follow-up** saves it as **pending**. The company's **Next follow-up** field (shown on the record header, table, and list sheet peek) always reflects the earliest pending follow-up
3. **Reschedule** loads a follow-up back into the form so you can change its due date, title, or notes, then **Save follow-up**
4. **Complete** marks a follow-up done — it drops out of Next follow-up and no longer triggers due/overdue reminders

When **Calendar** is installed, each company's next pending follow-up is projected onto the assignee's calendar as a 1-hour event (source **Company**); completing or clearing the last pending follow-up removes that projection automatically.

**Due / overdue reminders:** the assignee (falling back to the company's assignee) gets an in-app notification when a follow-up's due date arrives or has passed, sent by the same daily `crm:send-due-notifications` job that runs Lead, Contact, Task, and Contract reminders — one notification per follow-up per day.

## Import (1.4.0)

Users with **import** can bulk-load companies from **CSV** or **XLSX**:

1. Open **Import** and download a sample template if needed (CSV or XLSX)
2. Upload a file (drag & drop or browse)
3. Map spreadsheet columns to company fields (**Name** is required; Email, Phone, Website, Industry, Source, and Assigned To are optional)
4. Choose unique fields (**Email** / **Phone**) and duplicate behavior (**Skip**, **Update existing**, or **Keep duplicate**)
5. Preview counts and validation errors (nothing is written yet)
6. Start the import — it runs in the background; watch progress until complete

**Update existing** also requires the **update** permission. Like Contacts, Company import has **no equal-distribute assignment mode** — an **Assigned To** column (matched by user email) sets the assignee directly, or rows default the same way manual create does.

Use **Import history** to review past imports, download the original file, **failed_records.csv**, or **error_report.csv**.

## Export (1.4.0)

Users with **export** can download the current filtered set as **CSV** or **XLSX**, including industry, assignee, creator, and next follow-up.
