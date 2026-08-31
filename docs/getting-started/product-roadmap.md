# Product Roadmap

Canonical delivery status for EloSync modules and platform capabilities. Keep this page aligned with [module dependencies](/architecture/module-dependencies), [changelog](/changelog/), user-guide overviews, and the marketing site roadmap.

**Legend:** Shipped = available in product; Deferred = documented later work; Demand-driven = only when beta tenants ask.

---

## Phase 1 — CRM Foundation (shipped)

| Capability | Status |
|------------|--------|
| [Leads](/user-guide/leads-overview), [Tasks](/user-guide/tasks-overview), [ToDos](/user-guide/todos-overview) | Shipped (default-included) |
| [Contacts](/user-guide/contacts-overview), [Companies](/user-guide/companies-overview) | Shipped |
| [Calendar](/user-guide/calendar-overview), [Meetings](/user-guide/meetings-overview) | Shipped (Meetings requires Calendar) |
| [Activities](/user-guide/activities-overview), [Communication Templates](/user-guide/communication-templates) | Shipped |
| Module Marketplace | Shipped |
| Meta Lead Ads / inbound webhooks | Shipped |
| [WhatsApp Cloud](/user-guide/whatsapp-cloud-overview) | Shipped (billable; media + Automation triggers shipped; interactive buttons/lists deferred) |

### Planned / deferred after Phase 1 MVP

- Calendar: team calendars / shared ACL, Google/Outlook sync, Task/Lead overlays
- Meetings: invitee Calendar ACL for projected events
- Leads: conversion to Companies; real-time board sync
- WhatsApp: interactive buttons/lists, alternate BSPs, AI WhatsApp features

---

## Phase 2 — Sales Expansion (shipped)

| Capability | Status |
|------------|--------|
| [Opportunities](/user-guide/opportunities-overview) (pipeline + Kanban) | Shipped |
| [Quotations](/user-guide/quotations-overview) | Shipped (requires Opportunities) |
| [Contracts](/user-guide/contracts-overview) | Shipped (requires Opportunities) |
| [Resellers](/user-guide/resellers-overview) / [Reseller Payouts](/user-guide/reseller-payouts-overview) | Shipped (free Sales opt-ins; Payments → Resellers → Payouts chain) |

### Deferred

- Quotation e-signature; multi-currency; approval workflows beyond status enums
- Contract PDF / e-signature; renewal reminders
- Reseller cross-workspace identity; reseller portal; automated bank disbursement

---

## Phase 3 — Billing (shipped)

Tenant customer billing — not a redesign of Central Marketplace billing.

| Capability | Status |
|------------|--------|
| [Invoices](/user-guide/invoices-overview) | Shipped |
| [Estimates](/user-guide/estimates-overview) | Shipped (requires Invoices) |
| [Credit Notes](/user-guide/credit-notes-overview) | Shipped **1.2.0** (requires Invoices; PDF + email; applied refund) |
| [Payments](/user-guide/payments-overview) | Shipped (requires Invoices; receipt PDF + email shipped) |

### Deferred

- Credit Notes: standalone notes not tied to an invoice; multi-currency
- Payments: partial refunds; payment-gateway capture
- Invoices / Estimates: multi-currency conversion

---

## Phase 4 — Purchasing (shipped)

| Capability | Status |
|------------|--------|
| [Vendors](/user-guide/vendors-overview) | Shipped |
| [Purchase Orders](/user-guide/purchase-orders-overview) | Shipped (requires Vendors; PDF + email vendor shipped) |
| [Expenses](/user-guide/expenses-overview) | Shipped (soft Vendor / PO links; convert-from-PO) |

### Deferred

- PO partial-quantity receiving per line
- Vendor portal / scorecards
- Expense reimbursement workflows beyond `paid`; multi-line expenses

---

## Phase 5 — Inventory (shipped)

| Capability | Status |
|------------|--------|
| Products & categories | Shipped |
| [Warehouses](/user-guide/warehouses) & [Inventory](/user-guide/inventory) | Shipped (Inventory requires Products) |
| PO receipt → stock-in (soft) | Shipped |

### Deferred

- Serial/lot control, valuation, COGS jobs

---

## Phase 6 — Finance (shipped)

| Capability | Status |
|------------|--------|
| [Accounting](/user-guide/accounting-overview) (CoA, journals, GL) | Shipped |
| [Financial Reports](/user-guide/financial-reports) (TB, P&L, BS) | Shipped (requires Accounting) |
| Soft cash movements from Payments / Expenses / transfers | Shipped |

### Deferred

- Auto-post from POs / Inventory (AP/COGS)
- Multi-currency accounting / FX; budgets

---

## Phase 7 — HR (shipped)

| Capability | Status |
|------------|--------|
| [Employees](/user-guide/employees-overview) | Shipped |
| [Leave Management](/user-guide/leave-management-overview) | Shipped (requires Employees) |
| [Attendance](/user-guide/attendance-overview) | Shipped (requires Employees; check-in/out timer) |
| [Payroll](/user-guide/payroll-overview) | Shipped (requires Employees; optional Accounting post; own pay slips) |

### Deferred

- Org chart; employee self-service portal; leave accrual engines; biometric / geofencing; tax engines / bank file export

---

## Phase 8 — Operations (shipped)

| Capability | Status |
|------------|--------|
| [Help Desk](/user-guide/help-desk-overview) | Shipped **1.7.0** (SLA + IMAP; @mentions; status Kanban; soft Communication Templates) |
| [Projects](/user-guide/projects-overview) | Shipped (lean v1; soft Task `project_id`) |
| [Knowledge Base](/user-guide/knowledge-base-overview) | Shipped (internal articles) |
| [Assets](/user-guide/assets-overview) | Shipped |
| [Documents](/user-guide/documents-overview) | Shipped (requires Storage) |
| [Reports / Analytics](/user-guide/analytics-overview) | Shipped |
| [Announcements](/user-guide/announcements-overview) | Shipped |

### Help Desk deferred

- Multi-channel intake beyond shared IMAP (chat, social)
- Customer portal (external submit / track)

### Other Operations deferred

- Projects: Gantt, milestones, task dependencies, workload heatmaps, Automation `create_project`
- Knowledge Base: public URLs, nested categories, Automation triggers
- Documents: nested folders, versioning, soft record links (on demand)
- Assets: depreciation journals; Product/Inventory FKs; maintenance → Help Desk

---

## Platform add-ons (shipped)

| Capability | Status |
|------------|--------|
| [Branded](/user-guide/branded) (white-label) | Shipped (billable) |
| [Automation](/user-guide/automation-overview) | Shipped (billable) |
| [AI Assistant](/user-guide/ai-assistant) | Shipped (billable; Lead Copilot + workspace search **1.3.0** + confirmed writes; broader tools continue) |
| [Storage](/user-guide/storage-overview) | Shipped (free packs / quota) |
| [Tenant API & Webhooks](/developer-guide/tenant-api-webhooks) | Shipped (Settings → Developers; payment / Help Desk / credit-note events + endpoint edit) |
| Desktop wake push | Shipped (**FCM only**) |

---

## EloSync Mobile

Native iOS/Android tenant app (Expo SDK 57). Broad module coverage shipped PR-by-PR (CRM, sales, billing, purchasing, HR, Ops, AI, Branded, Storage, etc.). Remaining gaps are module-specific (stats KPIs, trash, some PDF/settings panels remain web-only on mobile v1). See [mobile user guide](/user-guide/elosync-mobile).

---

## Near-term depth

Depth program **0 → 3c** complete (2026-08-31): webhooks event catalog + Developers edit; Credit Notes applied refund (**1.2.0**); Help Desk `@mentions` **1.5.0**, Kanban **1.6.0**, Communication Template replies **1.7.0**.

AI workspace search shipped (**ai 1.3.0**): `search_workspace` fans out across entitled Wave A+B+C modules (CRM/sales/billing/purchasing/ops docs & calendar records).

Next when prioritized: further AI tools; WhatsApp interactive messages; demand-driven items below.

---

## Demand-driven / parked

| Item | Notes |
|------|--------|
| Customer Portal | External Help Desk submit/track — when beta demand is clear |
| Recruitment | HR expansion — on demand |
| Documents soft record links | On demand |
| Marketing campaigns / email campaigns | Separate SKUs; Automation deferred |
| Vendor Portal | Parked |
| Multi-currency / multi-branch | Parked |
| Report builder depth | Parked |
| Manufacturing, QA, POS, e-commerce | Out of active scope unless demanded |

---

## Related

- [Module dependencies](/architecture/module-dependencies)
- [Changelog](/changelog/)
- [Module development guide](/developer-guide/module-development-guide)
- [Platform freeze](/getting-started/platform-freeze)
