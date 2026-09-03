# Opportunities — User Guide

## Who can use Opportunities

Your workspace must have the **Opportunities** module installed (free from Marketplace — not auto-installed). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign` as needed).

Without **assign**, you only see opportunities assigned to you.

## Board & table

Open **Opportunities** from the sidebar (Sales). The default view is the **Kanban board** (columns = pipeline stages). Switch to **Table** when you prefer a list.

- Search by deal name
- Each stage column header and its cards use that stage’s color; Stage badges in the table and record page use the same colors
- Filter by stage, assignee, **tag**, related Contact / Company / Lead, or toggle **My Opportunities**
- KPI cards summarize totals, open / won / lost, pipeline value, weighted pipeline, won value, and conversion rate for your scope
- Table and board show **tags** and the **latest note**; hover a truncated preview to read the full note
- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted opportunity from the row menu
- **Delete permanently** requires `opportunities.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New opportunity**
2. Enter name (required) and optional amount, currency, probability (0–100), and expected close date
3. Optionally set stage and assignee (assignee requires **assign**)
4. Optionally link a **Contact**, **Company**, and/or **Lead** (pickers appear when those modules are installed — use **New** beside a picker to create and select inline when you have that module’s create permission)
5. Optionally assign **tags** (colored labels). Create a new tag inline with a name and color, then tick it
6. Save

Edit from the row menu or the record page.

Tags are an **Opportunities-only** catalog (separate from Leads disposition tags and Tasks / ToDos tags). In this release you can **create and assign** tags inline; there is no Manage Tags screen to rename or delete them. The record page shows tag badges — change assignments from Edit.

## Sales pipeline (stages)

Pipeline stages are part of Opportunities — there is no separate “Sales Pipeline” product.

Seeded stages: **Prospecting** (default) → **Qualification** → **Proposal** → **Negotiation** → **Won** / **Lost**.

- Moving a card on the board auto-saves the stage change (same as [Leads](/user-guide/leads)); click a card to open the drawer for edits
- Won / Lost columns mark closed deals for KPIs (pipeline value excludes them)

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Notes** — free-form notes on the deal
- **Activity** — timeline of create, update, assignment, stage change, note, and delete/restore events
