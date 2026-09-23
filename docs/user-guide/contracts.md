# Contracts — User Guide

## Who can use Contracts

Your workspace must have the **Opportunities** module installed, then the **Contracts** module (free from Marketplace — not auto-installed). Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `send`, `accept`, `convert` as needed).

Without **assign**, you only see contracts assigned to you.

## List & table

Open **Contracts** from the sidebar (Sales). Search by title, filter by status, opportunity, or assignee, or toggle **My Contracts**. The table shows the **latest note**; hover a truncated preview to read the full note.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted contract from the row menu
- **Delete permanently** requires `contracts.force.delete` — granted to the workspace **owner** by default

## Create & edit

1. Click **New contract**
2. Choose the related **Opportunity** (required) — use **New** to create one inline when you have `opportunities.create`. Selecting an opportunity auto-fills **Title** (when empty), **Party name** (from the opportunity contact or company), **Value**, **Currency**, and **Assignee** when the opportunity assignee is eligible (workspace owners are not listed). You can still change the fields afterward. End date must be on or after start date.
3. Optionally link a **Quotation** (only shown when the Quotations module is installed). If the opportunity has exactly one quotation, it is selected automatically; with multiple quotations, pick one or leave none
4. Enter a start date (required), optional end date, and optional rich-text **Description** and **Notes** (headings, lists, bold/italic/underline)
5. Optionally set an assignee (requires **assign**)
6. Save

Edit from the row menu or the record page while the contract is still **Draft**. After **Send for signature** or **Activate**, content fields are locked; use status actions and assignment instead.

## Status workflow

A contract starts in **Draft**. Move it forward with:

- **Send for signature** (`draft → sent`) — marks the contract as sent for signature (does not email the customer by itself). Also issues a customer **accept link** (regenerated when you copy the link or email the customer).
- **Activate** (`sent → active`) from the CRM, or let the customer sign via the public link
- **Activate without signature** (`draft → active`) — internal activation without a customer link (`contracts.update`)
- **Expire** (`active → expired` or `sent → expired`) or **Terminate** (`draft` / `sent` / `active → terminated`)

Invalid transitions are rejected with a validation error. Expiring or terminating clears any outstanding accept link.

## Customer acceptance (e-signature)

When a contract is **Sent**, staff with `contracts.send` can **Copy accept link**. Emailing a Sent contract also appends the link to the message.

Customers open `/#/accept/contracts/{token}` (no login), review the contract summary, enter their name and email, and confirm. That marks the contract **Active**, records signer name/email/IP on the record, and invalidates the link. Regenerating or re-emailing creates a new link and invalidates the previous one. Links expire at the earlier of **end date** (end of day) or 30 days.

Optional workspace toggles under **Settings → General** (Contracts installed) can require extra proof on the same accept page:

| Setting | Customer must provide |
|---------|------------------------|
| **Require phone on contract accept** | Mobile number |
| **Require signature image on contract accept** | Drawn signature or uploaded image |
| **Require ID document on contract accept** | National ID / passport / other upload |

Staff see phone, IP, signature method, and download buttons for the signature image and ID file on the contract record. Signature and ID uploads require the free **Storage** module — Settings disables those two toggles (and the API rejects enabling them) until Storage is installed. Phone-only does not need Storage. Soft-deleting a contract keeps evidence files; **Delete permanently** removes the signature and ID files from storage. Staff downloads are recorded on the contract timeline.

This is a lightweight accept page — not a full customer portal. Multi-signer and third-party e-sign providers remain deferred.

## Create invoice

Once a contract is **Active** and **Invoices** is installed, use **Create invoice** from the record page or row menu (`contracts.convert`):

- Creates a new **draft** invoice. Line items come from the linked quotation when it has lines; otherwise a single line uses the contract **value**
- The invoice is linked via `contract_id` (and `quotation_id` when a quotation is linked)
- You can create **more than one** invoice from the same contract (progress billing). The table shows a **Billed** badge after the first invoice
- If the linked quotation already has an invoice, the confirm dialog warns you — the API still allows the extra invoice
- Without Invoices installed, the action is hidden; the API returns a validation error if called directly

## Download PDF

**Download PDF** is on the contract record page. It generates a branded PDF using your **Settings → Branding** button color, logo (when uploaded), and company profile — plus party, dates, value, description, and notes. After a customer accepts via the public link, the PDF includes signer details and the signature image when one was captured (ID documents stay on the record download only, not embedded in the PDF).

## Email customer

After you **Send for signature** (status is no longer **Draft**), use **Email customer** on the record page (`contracts.send`). The dialog pre-fills the opportunity’s contact or company email when available; you can add CC recipients, edit the subject and message, and choose whether to attach the PDF. When the contract is still **Sent**, the message also includes a customer sign link. Delivery uses your workspace email configuration and appears in **Settings → Email logs**.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Renewal reminders

For **Active** contracts with an end date, EloSync sends an in-app **Contract renewal due** notification to the assignee (or creator) once per day while the end date falls within the workspace **Contract renewal notice (days)** window (Settings → General, default 30 days). There is no auto-renew toggle — renewals stay manual.

## Notes & activity

- **Description** and **Notes** — rich-text memos on the contract (shown on the overview; also printed on the PDF)
- **Notes tab** — free-form comments on the contract
- **Activity** — timeline of create, update, assignment, status change, invoice creation, note, email, signature request, signed, acceptance evidence download, and delete/restore events
