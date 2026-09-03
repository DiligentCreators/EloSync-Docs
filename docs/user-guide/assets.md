# Assets — User Guide

## Who can use Assets

Your workspace must have the **Assets** module installed. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign` as needed).

Without **assign**, you only see assets assigned to you.

## List

Open **Assets** from the sidebar (Operations area).

- Search by name, number, serial number, manufacturer, model, or location
- Filter by status, category, and assignee, or toggle **My Assets**
- KPI cards summarize total, my assets, unassigned, and counts by status
- The table shows the **latest note**; hover a truncated preview to read the full note
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted asset from the row menu
- **Delete permanently** requires `assets.force.delete` (same posture as Vendors — not on default role maps)

## Create & edit

1. Click **New asset** (shortcut: `n` when the list is focused and you have create permission)
2. Enter name (required). Optionally set status, category, manufacturer, model, serial number, location, purchase details, warranty end, assignee, and — when those modules are installed — vendor or employee custodian. When Vendors is installed, use **New** beside the vendor picker to create and select a vendor inline (`vendors.create`)
3. Save — EloSync assigns the next asset number (`AST-00001`, …)

Edit from the row menu or the asset page. Focus search with `Ctrl/⌘+F`.

## Assignment

Users with **assign** can set or clear the workspace assignee from the asset page or the create/edit form.

Assignees may be any **active** (non-suspended) workspace user, including workspace owners and users flagged **Exclude from lead assignment** (that flag is Leads-only). Suspended users are omitted from the picker. Clear assignee with **Unassigned**.

## Vendor & employee links

- **Vendor** appears only when the Vendors module is installed
- **Employee** (custodian) appears only when the Employees module is installed

These are optional context links — Assets works without either module.

## Notes & activity

- **Notes** — free-form notes on the asset
- **Activity** — timeline of create, update, assignment, note, and delete/restore events

## Status

| Status | Meaning |
|--------|---------|
| Active | In normal use |
| In repair | Temporarily unavailable |
| Retired | No longer in active use |
| Disposed | Written off / removed |
