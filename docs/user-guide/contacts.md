# Contacts — User Guide

## Who can use Contacts

Your workspace must have the **Contacts** module installed. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign` as needed).

Without **assign**, you only see contacts assigned to you.

## List

Open **Contacts** from the sidebar under **CRM**.

- Search by name, email, phone, company (legacy string), or job title
- Filter by company, assignee, lifecycle (**On Boarded Clients** / **Off Boarded Clients**), or toggle **My Contacts**
- When a contact is linked to a [Company](/user-guide/companies), the table shows the linked company name (falls back to the legacy company string)
- KPI cards summarize total contacts, my contacts, unassigned, on boarded / off boarded clients, with email, and created this week
- The table shows the **latest note**; hover a truncated preview to read the full note
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted contact from the row menu — this trash filter is **not** the same as lifecycle On/Off Boarded
- **Delete permanently** (force delete) requires `contacts.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New contact**
2. Enter name (required) and optional email, phone, job title, lifecycle, and assignee
3. Optionally pick a **Company** (when the Companies module is installed and you can view companies). Selecting a Company links `company_id` and syncs the legacy company text to that organization name. Leaving the picker empty keeps any existing free-text company value on edit; clearing a previously linked Company removes the link
4. When Companies is installed and you have **companies.create**, use **New** next to the Company picker to create a company in a dialog — after save, that company is selected automatically
5. Save

Edit from the row menu or the record page.

## Related sales documents

On a contact record page (when the matching module is installed and you have create permission), use:

- **New quotation** → opens Quotation create with this contact preselected (`?contact=`; `?company=` when a company is linked)
- **New invoice** → same for Invoices
- **New payment** → same for Payments

You finish the document on that module’s create page (quotations still require an opportunity).

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form.

## Notes & activity

- **Notes** — free-form notes on the contact
- **Activity** — timeline of create, update, assignment, note, and delete/restore events

## Converting a Lead to a Contact

When your workspace has both **Leads** and **Contacts** installed, converting a Lead (from the Lead record page) creates a linked Contact with lifecycle **On Boarded Clients**. If **Companies** is also installed and the lead has a company name, convert creates or reuses that Company and links it on the Contact. You can optionally create an **Opportunity** in the same step when Opportunities is installed. After conversion, the Lead record page shows **View contact** (and company / opportunity links when applicable).
