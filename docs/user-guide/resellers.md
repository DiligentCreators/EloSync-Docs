# Resellers — User Guide

## Who can use Resellers

Your workspace must have the **Resellers** module installed (requires **Payments** first). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `invite` as needed).

Without **assign**, you only see resellers assigned to you, plus the reseller record linked to your own login (`user_id`).

A dedicated **reseller** role exists for invited partner logins. That role can view their own reseller record and their commission entries (when Reseller Payouts is installed) — not create or manage other resellers.

## List

Open **Resellers** from the sidebar under the **Sales** group (when the SPA nav ships; Phase 1 exposes the tenant API).

- Search by name, email, phone, or company name
- Filter by status (Active / Inactive) and assignee, or toggle **My resellers**
- KPI cards summarize total, my resellers, unassigned, active, and inactive
- Users with **restore** can filter trash and restore soft-deleted resellers
- **Delete permanently** requires `resellers.force.delete` — not on default admin/manager/staff maps (owner/superadmin)

## Create & edit

1. Create a reseller with **name** (required)
2. Optionally set email, phone, company name, notes, status, commission rate, owner commission rate, and assignee
3. Save

Commission rates are percentages from 0 to 100. They are snapshotted onto commission ledger rows when a linked invoice becomes fully **Paid** (see [Reseller Payouts](/user-guide/reseller-payouts)).

## Assignment

Users with **assign** can set or clear the assignee. The assignee is the workspace “owner” party for the second commission tier (`owner_commission_rate`).

## Detail sheet

Open a reseller from the list to see four tabs:

- **Overview** — profile fields, commission rates, assignee, and **profile notes** (the optional notes field on create/edit)
- **Notes** — threaded team notes (separate from profile notes). Users with **update** can add notes
- **Activity** — domain timeline (created, updated, assigned, note added, login invited, deleted/restored)
- **Access** — linked login status and invite-login (requires **invite**)

## Invite login

Users with **invite** can invite a **same-workspace** login for a reseller who does not already have `user_id` set:

1. Provide a password (required); email and name default from the reseller record when omitted
2. The API creates a tenant user with **only** the `reseller` role and links it
3. Email must be unique in the workspace

This is intentionally **not** cross-workspace identity — each workspace manages its own reseller logins.

## Link on invoices

When creating or editing a customer invoice, you may set optional `reseller_id` if Resellers is installed. Without **assign**, you may only link resellers assigned to you.

## Related modules

- **Payments** — required install dependency; invoice must reach status **Paid** before commission accrues
- **Reseller Payouts** — commission ledger, approve / pay / void workflow
