# Payments — User Guide

## Who can use Payments

Your workspace must have **Invoices** installed first, then the **Payments** module (both free from Marketplace). Marketplace blocks installing Payments until Invoices is entitled. Your role must include the relevant permissions (`view`, `create`, `update`, `delete`, `restore`, `force.delete`, `assign`, `post`, `void` as needed).

Without **assign**, you only see payments assigned to you.

> **Not the same as Central Billing → Payments.** This module tracks money your workspace receives *from your own customers*. The platform's own **Central → Billing → Payments** area (in the platform admin, not here) tracks what your workspace pays the platform for its module subscriptions.

## List & table

Open **Payments** from the sidebar (**Billing**, under Invoices). Search by payment number or reference, filter by status or method, toggle **My payments**, and switch KPI cards (My Payments, Draft, Posted, Void, Posted total) to quick-filter the table.

- Users with **restore** can filter **Active / Include deleted / Deleted only**, then **Restore** a soft-deleted payment from the row menu
- **Delete permanently** requires `payments.force.delete` — granted to the workspace **owner** by default

## Record a payment

1. Click **New payment**
2. Enter the amount, currency, method (Cash, Bank Transfer, Cheque, Card (manual), Other), date paid, reference, and notes
3. Add one or more **allocations** — pick an outstanding invoice and the amount of this payment to apply to it. The invoice picker shows **contact name · company · invoice number — balance due**, and you can search by contact name, company name, or invoice number. Choosing an invoice auto-fills **Contact**, **Company**, and **Assignee** from that invoice when those fields are set on the invoice (you can still change them). You can allocate to several invoices, or leave the payment unallocated and add allocations later while still in Draft
4. Optionally adjust the contact, company, or assignee (Contacts/Companies when installed; assignee requires **assign**)
5. Save with **Create** (returns to the list), **Create & View**, or **Post** (creates then posts when you have permission)

You can also start recording a payment from an invoice's detail view — the **Related payments** link jumps you to the Payments module.

Edit from the row menu or the record page while the payment is still **Draft**. Editing replaces the full allocation list. After **Post**, content is locked; use **Void** and assignment instead.

## Status workflow

A payment starts in **Draft**. Move it forward with:

- **Post** (`draft → posted`) — applies every allocation to its invoice's balance: the invoice's amount paid increases and its status advances (e.g. `sent → partial` or `sent → paid`, depending on how much of the invoice is now covered). Posting is all-or-nothing: it's rejected if any allocated invoice has been deleted, is not currently Sent or Partial, or if the allocated amount would exceed that invoice's balance due
- **Void** (`posted → void`) — reverses every allocation, rolling the linked invoices' balances and statuses back, even if an invoice has since been fully paid off by another payment or deleted

Invalid transitions (e.g. voiding a draft payment, or posting an already-posted payment) are rejected with a validation error.

## Assignment

Users with **assign** can set or clear the assignee from the record page or the create/edit form. The assignee receives an in-app notification when someone else assigns them.

## Notes & activity

- **Notes** — free-form notes on the payment
- **Activity** — timeline of create, update, assignment, post, void, note, and delete/restore events

## What's not here yet

Partial refunds of a posted payment, payment receipt PDFs/e-mail delivery, and online payment-gateway capture are planned but not part of this module yet — see the [Product Roadmap](/getting-started/product-roadmap).

To credit an invoice directly (independent of a payment), see [Credit Notes](/user-guide/credit-notes).
