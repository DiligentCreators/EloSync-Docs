# Vendors — User Guide

## Who can use Vendors

Your workspace must have the **Vendors** module installed. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign` as needed).

Without **assign**, you only see vendors assigned to you.

## List

Open **Vendors** from the sidebar, under the **Purchasing** group.

- Search by name, email, phone, website, address, or tax ID
- Filter by status (Active / Inactive) and assignee, or toggle **My Vendors**
- KPI cards summarize total vendors, my vendors, unassigned, active, and inactive
- The table shows the **latest note**; hover a truncated preview to read the full note
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted vendor from the row menu
- **Delete permanently** (force delete) requires `vendors.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New vendor**
2. Enter name (required) and optional email, phone, website, address, tax ID, payment terms, currency, status, and assignee
3. Save

Edit from the row menu or the vendor record page.

## Purchasing hub & statement

When **Purchase Orders** and/or **Expenses** are installed, the vendor record shows PO/expense counts and **spend / activity** totals (not an accounts-payable balance), recent documents, **New purchase order** / **New expense** shortcuts (`?vendor=`), list deep links (`/purchase-orders?vendor=` / `/expenses?vendor=`), and a **Statement** for the selected period (opening activity + cumulative activity; PDF not available yet for vendors).

## Assignment

Users with **assign** can set or clear the assignee from the vendor record page or the create/edit form.

## Notes & activity

- **Notes** — free-form notes on the vendor
- **Activity** — timeline of create, update, assignment, note, and delete/restore events

## Status

Vendors have a **status** of Active or Inactive (default Active). Inactive vendors remain in the directory but signal they are not currently used for procurement.
