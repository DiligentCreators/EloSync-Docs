# Product Roadmap

Canonical delivery status for EloSync modules and platform capabilities. Keep this page aligned with [module dependencies](/architecture/module-dependencies), [changelog](/changelog/), user-guide overviews, and the marketing site roadmap.

**Legend:** Shipped = available in product; Deferred = documented later work; Demand-driven = only when beta tenants ask.

---

## Phase 1 — CRM Foundation (shipped)

| Capability | Status |
|------------|--------|
| [Leads](/user-guide/leads-overview), [Tasks](/user-guide/tasks-overview), [ToDos](/user-guide/todos-overview) | Shipped (default-included; Leads **1.8.0** real-time board sync; **1.7.0** convert opportunity gates; Tasks **1.5.0** milestone link + dependencies) |
| [Contacts](/user-guide/contacts-overview), [Companies](/user-guide/companies-overview) | Shipped (Contacts **1.7.0** / Companies **1.4.0** follow-ups + import/export) |
| [Calendar](/user-guide/calendar-overview), [Meetings](/user-guide/meetings-overview) | Shipped (Meetings requires Calendar; Calendar **1.1.0** overlays; **1.2.0** invitee view ACL; **1.3.0** event shares; **1.4.0** Google/Outlook sync — Phase 1 one-way push) |
| [Activities](/user-guide/activities-overview), [Communication Templates](/user-guide/communication-templates) | Shipped |
| Module Marketplace | Shipped |
| Meta Lead Ads / inbound webhooks | Shipped |
| [WhatsApp Cloud](/user-guide/whatsapp-cloud-overview) | Shipped (billable; media + Automation triggers + interactive buttons/lists **1.4.0**) |

### Planned / deferred after Phase 1 MVP

- Calendar: named team calendars / department auto-share; two-way (inbound) Google/Outlook sync; pushing meeting/task/lead overlays to providers
- WhatsApp: alternate BSPs, AI WhatsApp features

**Shipped depth (CRM):** Calendar Task/Lead overlays (**calendar 1.1.0**); meeting invitee Calendar ACL (**calendar 1.2.0**); Lead convert polish (**leads 1.5.0**); Lead **created_by / updated_by** filters and columns (**leads 1.6.0**); Lead convert opportunity settings (**leads 1.7.0**); Lead real-time board sync (**leads 1.8.0**); Calendar Google/Outlook sync Phase 1 — per-user OAuth connect, one-way push for manual events (**calendar 1.4.0**).

---

## Phase 2 — Sales Expansion (shipped)

| Capability | Status |
|------------|--------|
| [Opportunities](/user-guide/opportunities-overview) (pipeline + Kanban) | Shipped (**1.3.0** real-time board sync) |
| [Quotations](/user-guide/quotations-overview) | Shipped (requires Opportunities; customer e-signature accept links **1.9.0**) |
| [Contracts](/user-guide/contracts-overview) | Shipped (requires Opportunities; PDF + e-signature **1.5.0**; renewal reminders **1.6.0**; accept evidence toggles **1.7.0**; auto-renew **1.8.0**) |
| [Resellers](/user-guide/resellers-overview) / [Reseller Payouts](/user-guide/reseller-payouts-overview) | Shipped (free Sales opt-ins; Payments → Resellers → Payouts chain) |

### Deferred

- Quotation multi-signer / third-party e-sign providers; multi-currency; approval workflows beyond status enums
- Contract multi-signer / third-party e-sign providers
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
| [Purchase Orders](/user-guide/purchase-orders-overview) | Shipped (requires Vendors; PDF + email; per-line partial receive **1.5.0**) |
| [Expenses](/user-guide/expenses-overview) | Shipped (soft Vendor / PO links; convert-from-PO) |

### Deferred

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
| [Payroll](/user-guide/payroll-overview) | Shipped (requires Employees; Accounting Mark paid Paid-from + optional draft accrual; own pay slips) |

### Deferred

- Org chart; employee self-service portal; leave accrual engines; biometric / geofencing; tax engines / bank file export

---

## Phase 8 — Operations (shipped)

| Capability | Status |
|------------|--------|
| [Help Desk](/user-guide/help-desk-overview) | Shipped **1.10.0** (SLA + IMAP; @mentions; status Kanban; soft Communication Templates; shell File a complaint) |
| [Projects](/user-guide/projects-overview) | Shipped (workload heatmap **1.6.0**; portfolio Gantt **1.5.0**; milestones **1.4.0**; soft Task `project_id` + dependencies **tasks 1.5.0**; Automation `create_project` via **automation 1.4.0**) |
| [Knowledge Base](/user-guide/knowledge-base-overview) | Shipped (internal articles) |
| [Assets](/user-guide/assets-overview) | Shipped |
| [Documents](/user-guide/documents-overview) | Shipped (requires Storage) |
| [Reports / Analytics](/user-guide/analytics-overview) | Shipped |
| [Announcements](/user-guide/announcements-overview) | Shipped |
| [Live Chat](/user-guide/live-chat-overview) | Shipped **1.5.2** (send soft-fail on Reverb outage; inbound bell broadcast; cross-surface typing; embed error Retry + send lock; snippet `?v=` cache-bust; `/` canned filter) |

### Help Desk deferred

- Multi-channel intake beyond shared IMAP (chat, social)
- Customer portal (external submit / track)

### Other Operations deferred

- Knowledge Base: public URLs, nested categories
- Documents: nested folders, versioning, soft record links (on demand)
- Assets: depreciation journals; Product/Inventory FKs; maintenance → Help Desk
- Automation: Marketing campaigns / email campaigns (separate SKUs); branching; `generate_order` action; auto-send generated documents (drafts only — see **automation 1.5.0**)

---

## Platform add-ons (shipped)

| Capability | Status |
|------------|--------|
| [Branded](/user-guide/branded) (white-label) | Shipped (billable) |
| [Automation](/user-guide/automation-overview) | Shipped (billable; **1.4.0** `create_project` action) |
| [AI Assistant](/user-guide/ai-assistant) | Shipped (billable; Lead Copilot + workspace search **1.3.0** + Help Desk triage **1.4.0** + Task triage **1.5.0** + Opportunity triage **1.6.0** + Invoice triage **1.7.0** + Expense triage **1.8.0** + Project triage **1.9.0** + PO triage **1.10.0** + Payment triage **1.11.0** + Lead assign/note **1.12.0** + Estimate triage **1.13.0** + Quotation triage **1.14.0** + Credit Note triage **1.15.0** + Leave triage **1.16.0** + Contract triage **1.17.0** + Contact triage **1.18.0** + Company triage **1.19.0** + product guidance **1.20.0** + confirmed writes) |
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

Help Desk AI triage shipped (**ai 1.4.0**): `get_help_desk_ticket` plus confirmed writes for status, assign, and notes (mirrors Help Desk API authz including close/reopen).

Task AI triage shipped (**ai 1.5.0**): `get_task` plus confirmed writes for status, assign, and notes (mirrors Task API authz including complete/reopen).

Opportunity AI triage shipped (**ai 1.6.0**): `get_opportunity` and `get_opportunity_stages` plus confirmed writes for stage, assign, and notes (mirrors Opportunity API authz; stage via `stage_id`).

Invoice AI triage shipped (**ai 1.7.0**): `get_invoice` plus confirmed writes for status, assign, and notes (mirrors Invoice HTTP `/status` authz including send/void gates; overdue list returns assignee id).

Expense AI triage shipped (**ai 1.8.0**): `get_expense` plus confirmed writes for status, assign, and notes (mirrors Expense HTTP `/status` authz including submit/approve/reject/pay/cancel gates; pending-approval list returns assignee id).

Project AI triage shipped (**ai 1.9.0**): confirmed writes for status, assign, and notes on existing project reads (mirrors Project HTTP `/status`; get returns assignee id).

Purchase Order AI triage shipped (**ai 1.10.0**): `get_purchase_order` plus confirmed writes for status, assign, and notes (mirrors PO HTTP `/status` authz including send/receive/cancel gates).

Payment AI triage shipped (**ai 1.11.0**): `get_payment` plus confirmed writes for status, assign, and notes (Posted→`post()`, Void→`void()`; Draft target rejected).

Lead assign + note shipped (**ai 1.12.0**): confirmed `assign_lead` / `add_lead_note` alongside existing Lead reads and status write.

Estimate AI triage shipped (**ai 1.13.0**): `get_estimate` plus confirmed writes for status, assign, and notes (mirrors Estimate HTTP `/status` authz including send/accept gates).

Quotation AI triage shipped (**ai 1.14.0**): `get_quotation` plus confirmed writes for status, assign, and notes (mirrors Quotation HTTP `/status` authz including send/accept gates; title only — no number field; assign uses `EligibleOpportunityAssignee`).

Credit Note AI triage shipped (**ai 1.15.0**): `get_credit_note` plus confirmed writes for status, assign, and notes (Issued→`issue()`, Applied→`apply()`, Void→`void()`, Refunded→`refund()`; Draft target rejected; assign uses `EligibleCreditNoteAssignee`).

Leave AI triage shipped (**ai 1.16.0**): `get_leave_request` + `get_pending_leave_requests` plus confirmed `approve_leave_request` / `reject_leave_request` (mirrors Leave HTTP approve/reject; no assign/notes; self-approve blocked for non-admin).

Contract AI triage shipped (**ai 1.17.0**): `get_contract` plus confirmed writes for status, assign, and notes (Sent→`send()` with acceptance token; Active from Sent→`accept()`; other targets→`changeStatus` with `update`; assign uses `EligibleOpportunityAssignee`).

Contact AI triage shipped (**ai 1.18.0**): `get_contact` plus confirmed writes for lifecycle status (`on_boarded`/`off_boarded`), assign, and notes (`EligibleContactAssignee`).

Company AI triage shipped (**ai 1.19.0**): `get_company` plus confirmed writes for assign and notes (`EligibleCompanyAssignee`; companies have no lifecycle status).

Automation `create_project` shipped (**automation 1.4.0**): creates a Planned project with soft opportunity/company/contact links from the trigger and a note on the related record; template `opportunity_stage_create_project`.

Contract PDF + e-signature shipped (**contracts 1.5.0**): branded PDF download, send-for-signature, customer accept links (reuse Quotation accept pattern), staff activate from sent, email with optional PDF + sign link.

**Phased depth Steps 1–4 + convert polish (2026-09-16):** Projects milestones (**projects 1.4.0**) + task dependencies / `milestone_id` (**tasks 1.5.0**); contract renewal reminders via `crm:send-due-notifications` + `contract_renewal_notice_days` (**contracts 1.6.0**); PO per-line partial quantity receive (**purchase-orders 1.5.0**); Calendar Task/Lead overlays (**calendar 1.1.0**); Lead convert polish — `LeadConverted` / Automation `lead.converted`, company activity `ConvertedFromLead`, optional `company_id`/`company_name`, `conversion_meta` names (**leads 1.5.0**).

**Projects portfolio Gantt (2026-09-29):** `GET /projects/gantt` + SPA Gantt view — catalog **projects 1.5.0**.

**Projects workload heatmap (2026-09-29):** `GET /projects/heatmap` + SPA Heatmap view — catalog **projects 1.6.0**.

**Workspace record cohesion (2026-09-29):** Contact/Company related hubs (opportunities, help desk, projects, documents); Email CRM links UI (**email 1.4.0**); Documents reverse list filter (**documents 1.6.0**); catalog **contacts 1.6.0** / **companies 1.3.0**. Go-live: [production readiness](/deployment/workspace-record-cohesion-production-readiness) (**Go**).

**Contact/Company follow-ups + import/export (2026-09-30):** Follow-ups CRUD + complete on Contacts and Companies (`next_follow_up_at`, Calendar projection, daily due/overdue reminders via `crm:send-due-notifications`); CSV/XLSX import wizard (upload → map → options → preview → run, no equal-distribute assignment mode) and CSV/XLSX export. Catalog **contacts 1.6.0 → 1.7.0**, **companies 1.3.0 → 1.4.0**. Closes the "Contact/Company follow-ups / import-export" residual noted in [workspace record cohesion readiness](/deployment/workspace-record-cohesion-production-readiness). Go-live: [production readiness](/deployment/contacts-companies-follow-ups-import-export-production-readiness).

**Leads real-time board sync (2026-09-30):** Private Reverb channel `tenant.{id}.leads.board` (auth: same tenant + `leads.view`, mirrors the Live Chat inbox channel) broadcasts `LeadCreated` / `LeadUpdated` / `LeadStageChanged` / `LeadAssigned` / `LeadDeleted` from `LeadEventSubscriber`; SPA `useLeadsBoardRealtime` hook debounce-invalidates `leads/board` + `leads/stats` while the Kanban view is open. Catalog **leads 1.7.0 → 1.8.0**. Closes the "Leads: real-time board sync" deferred item above. Go-live: [production readiness](/deployment/leads-realtime-board-sync-1-8-0-production-readiness).

**Opportunities real-time board sync (2026-10-04):** Private Reverb channel `tenant.{id}.opportunities.board` (auth: same tenant + `opportunities.view`, mirrors Leads 1.8.0) broadcasts `OpportunityCreated` / `OpportunityUpdated` / `OpportunityStageChanged` / `OpportunityAssigned` / `OpportunityDeleted` from `OpportunityEventSubscriber`; SPA `useOpportunitiesBoardRealtime` hook debounce-invalidates `opportunities/board` + `opportunities/stats` while the Kanban view is open. Catalog **opportunities 1.2.0 → 1.3.0**. Closes the Opportunities deferred "Real-time board sync" item. Go-live: [production readiness](/deployment/opportunities-realtime-board-sync-1-3-0-production-readiness).

**Automation WhatsApp interactive + document draft actions (2026-10-01):** Actions `send_whatsapp_interactive` (module `whatsapp-cloud`, wraps `queueInteractive`), `generate_quotation` (module `quotations`, requires `opportunity_id`, draft only), and `generate_invoice` (module `invoices`, draft only, soft-links from the trigger) via `ActionRunner`; starter templates `opportunity_stage_generate_quotation` and `whatsapp_inbound_quick_replies`. Catalog **automation 1.4.0 → 1.5.0** (no `whatsapp-cloud` bump). Closes the "Automation interactive send" and "generate quote/invoice" deferred items above (`generate_order` and auto-send remain deferred). Go-live: [production readiness](/deployment/automation-whatsapp-interactive-document-actions-1-5-0-production-readiness).

**Calendar Google/Outlook sync Phase 1 (2026-09-30):** Per-user OAuth connect (platform-wide Google + Microsoft OAuth apps, env client id/secret) with token storage + refresh + disconnect (`calendar_provider_connections`). One-way EloSync → provider push (create/update/cancel) for **manual** calendar events only, queued via `PushCalendarEventToProviderJob` with safe soft-fail (a broken integration never blocks calendar writes). External event ID mapping on `calendar_events` (`external_provider` / `external_event_id`). New permission `calendar.manage_integrations`. Catalog **calendar 1.3.0 → 1.4.0**. Closes the "Calendar: Google/Outlook sync" deferred item above — two-way sync, named team calendars, and pushing meeting/task/lead overlays remain deferred. Go-live: [production readiness](/deployment/calendar-google-outlook-sync-1-4-0-production-readiness).

Still deferred: named team calendars; two-way (inbound) Google/Outlook sync + pushing meeting/task/lead overlays; Customer Portal; multi-currency; PO/Vendor portals; Automation `generate_order` action + auto-send.

Next when prioritized: demand-driven items below (broader AI tools continue lightly).

---

## Demand-driven / parked

| Item | Notes |
|------|--------|
| Customer Portal | External Help Desk submit/track — when beta demand is clear |
| Recruitment | HR expansion — on demand |
| Documents nested folders / versioning | Soft record links shipped (create + reverse list); folders/versioning on demand |
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
