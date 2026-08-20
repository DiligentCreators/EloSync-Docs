# AI Assistant — User Guide

## Who can use it

Your workspace must have the **AI Assistant** module installed from the Marketplace. Your role needs:

- **`ai.use`** — chat, Lead Copilot, credit balance
- **`ai.confirm`** — approve tasks or other suggested writes
- **`ai.manage`** — configure workspace AI settings (optional)

Without the module, AI menu items and API routes are hidden.

## What you can do

### Business chat

Ask EloSync about your permitted data — open tasks, stale leads, pipeline focus, and more. Answers respect your **module entitlements** and **permissions** (for example you only see leads you are allowed to view).

Write actions (such as creating a task) appear as **suggestions** first. Nothing is saved until you **confirm**.

### Lead Copilot

From a lead record, use Copilot actions:

- **Summarize** — status, urgency, and recent activity themes
- **Next action** — single best follow-up with rationale
- **Draft follow-up** — copy-ready message (general, email, or WhatsApp tone)

### Credits (Platform mode)

When your workspace uses **Platform AI** (default), each turn consumes credits from:

1. **Included monthly allowance** (from your AI subscription, prorated when you join mid-month)
2. **Prepaid packs** (optional Marketplace add-ons — they roll over)

Check **Settings → AI** or the credits panel for remaining balance. When credits run out, new messages return a payment-required notice until you add a pack or wait for the monthly refresh.

### Bring your own key (BYOK)

If your operator allows it, workspace admins can switch to **BYOK** mode and supply your own provider API key. Usage is billed by your provider directly; EloSync does not burn platform credits in BYOK mode.

## Tips

- Be specific — mention time ranges (“due today”, “stale 14 days”) for sharper tool use.
- Confirm write suggestions promptly; pending actions expire after 24 hours.
- Lead Copilot only accesses leads you can already open in the CRM.

## Related

- [Tenant settings — AI](/user-guide/tenant-settings)
- [Leads](/user-guide/leads-overview)
- [Tasks](/user-guide/tasks-overview)
