# Communication Templates

Create reusable **plain-text** messages for WhatsApp (and future channels). Templates support clickable placeholders such as lead or ticket fields, agent name, and workspace name.

EloSync does not send messages for you. WhatsApp opens in a new tab with the message pre-filled.

## Manage templates

1. Open **Templates** in the **CRM** sidebar section (requires the Communication Templates module and view permission).
2. Click **New template**.
3. Enter a name, choose context (e.g. Leads or Help Desk), channel (WhatsApp), optional category, and message body.
4. Click placeholder chips to insert tokens at the cursor (or replace selected text).
5. Save. Toggle **Active** off to hide a template from pickers without deleting it.

## Send via WhatsApp from a Lead

1. Open a lead that has a phone number.
2. Click **WhatsApp** next to the phone field.
3. Pick a template and review the preview, **or** open a blank chat if you have no templates (or do not want one).
4. WhatsApp Web (or the WhatsApp app) opens. Send from WhatsApp as usual.

## Send via WhatsApp from Help Desk

1. Install **Communication Templates** (Marketplace) and ensure you have use permission.
2. Open a ticket that has a linked contact with a phone number.
3. Click **WhatsApp** under related records.
4. Pick a Help Desk template (or open a blank chat). WhatsApp opens with the message pre-filled.

There is no outbound message history in this version.

## Permissions

| Action | Typical roles |
|--------|----------------|
| View / use templates | Admin, Manager, Staff |
| Create / update | Admin, Manager |
| Delete | Admin |

Workspace owners (superadmin) have full access.
