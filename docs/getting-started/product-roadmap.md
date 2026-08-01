# Product Roadmap

Long-term direction of the platform: evolution from a CRM into a complete SaaS ERP. Modules should be implemented in the order below unless business priorities require otherwise.

> **Architecture Policy**
>
> The platform foundation (authentication, tenancy, RBAC, billing, marketplace, settings, audit logging, and module licensing) is **frozen**. New functionality must be implemented as modules using the [Module Architecture](/architecture/module-architecture) convention and the [Module Development Standard](/developer-guide/module-development). Architectural changes should only be made for critical security issues, production defects, or platform-wide improvements.
>
> See [architecture/platform-freeze.md](/getting-started/platform-freeze).

---

## Phase 1 — CRM (Completed / In Progress)

The CRM is the foundation of the platform and is the first functional area delivered.

### Completed

| Module / capability | Status |
|---------------------|--------|
| [Leads](/user-guide/leads-overview) | ✅ Completed (Sprint 2 UX + inbound Custom Webhook + Meta Lead Ads ingest) |
| [Contacts](/user-guide/contacts-overview) | ✅ Completed (directory, assignment, notes/activity timeline; unlocks full lead convert) |
| [Companies](/user-guide/companies-overview) | ✅ Completed (organizations directory, assignment, notes/activity timeline; Contact `company_id` link) |
| [Tasks](/user-guide/tasks-overview) | ✅ Completed (Sprint 2 UX: board, KPIs, waiting status, due-date permission, comments/history) |
| [ToDos](/user-guide/todos-overview) | ✅ Completed (personal creator-scoped checklists; board + list; owner view-all; creator-only delete) |
| In-app notifications + Reverb | ✅ Completed (payload v1, NotificationBatch digests, Reverb/Echo, modular registry, browser toasts; poll fallback only) |
| Tenant dashboard widgets | ✅ Completed (module/permission/assignee scoped; includes Calendar upcoming when entitled) |
| [Communication Templates](/user-guide/communication-templates) | ✅ Completed (plain-text templates, placeholder registry, WhatsApp `wa.me` from Leads; migrate-only production registration) |
| [Calendar](/user-guide/calendar-overview) | ✅ Completed (Week/Day time grids + DnD, Month/Agenda, view_all oversight, upcoming widget) |
| [Meetings](/user-guide/meetings-overview) | ✅ Completed (host/invitees, Zoom/Google Meet OAuth, reminders, Calendar projection, completion) |
| [Activities](/user-guide/activities-overview) | ✅ Completed (loggable call/email/note/follow-up engagements; Contact/Company/Lead links; complete + timeline mirrors) |
| **Lead Source Driver Architecture** | ✅ Implemented ([standard](/developer-guide/lead-source-driver-architecture); Custom Webhook + Meta drivers shipped) |
| **Meta Lead Ads Integration** | ✅ Shipped ([Meta App Setup](/developer-guide/meta-app-setup) · [Meta Lead Ads](/developer-guide/meta-lead-ads-integration)) |

#### Calendar (shipped)

- Personal events; Week (default) / Day / Month / Agenda
- Drag-and-drop reschedule on Week/Day; workspace timezone-aware UI
- Upcoming events dashboard widget
- Org-wide view via `calendar.view_all` (no calendar assignment)

#### Meetings (shipped)

- Meetings scheduling with host + invitees (internal and external email guests)
- Workspace Zoom and Google Meet OAuth connections
- One reminder before start (in-app, web push, email) for creator, host, and invitees
- Projects onto Calendar via `CalendarEventService::upsertFromSource`

> **Dependency:** Meetings → Calendar (required). See [Module Dependencies](/architecture/module-dependencies) and [Meetings](/user-guide/meetings-overview).

#### Activities (shipped)

- Loggable CRM engagements: call, email, note, follow-up, other
- Link to Contact / Company / Lead (at least one; soft entitlement)
- Due date, complete action, assignee scoping, notes + timeline
- Mirrors create/complete onto related record timelines
- Recent Activities dashboard widget

### Planned

| Module / capability | Status |
|---------------------|--------|
| **WhatsApp Cloud Integration** | Planned (docs blueprint only — [Cloud API beyond `wa.me`](/developer-guide/whatsapp-cloud-integration)) |

**Goal:** Provide a complete customer relationship management experience with lead tracking, task management, customer records, scheduling, meetings, and activity history.

---

## Phase 2 — Sales

Once CRM is complete, extend it into a full sales workflow.

| Module | Status |
|--------|--------|
| [Opportunities](/user-guide/opportunities-overview) | ✅ Completed (deals, stages, Kanban board + table, soft Contact/Company/Lead links; free Sales opt-in) |
| Sales Pipeline | ✅ Delivered with Opportunities (stages + board inside the module — **not** a separate Marketplace SKU) |
| [Quotations](/user-guide/quotations-overview) | ✅ Completed (line items with computed totals, status workflow, required Opportunity link; free Sales opt-in) |
| [Contracts](/user-guide/contracts-overview) | ✅ Completed (agreement tracking, status workflow, required Opportunity link, optional Quotation link; free Sales opt-in) |

#### Opportunities (shipped)

- Deal amount / currency / probability / expected close date
- Seeded pipeline: Prospecting → Qualification → Proposal → Negotiation → Won / Lost
- Kanban board + table; KPIs (pipeline value, weighted, conversion)
- Soft optional links to Contacts, Companies, Leads
- Notes, assignment, domain timeline; free Marketplace opt-in under category `sales`

#### Quotations (shipped)

- Required Opportunity link; optional Contact/Company links
- Line items (description, quantity, unit price, tax rate) with server-computed subtotal / tax / total
- Status workflow: `draft → sent → accepted|rejected|expired`
- Notes, assignment, domain timeline; **hard dependency** on Opportunities; free Marketplace opt-in under category `sales`

#### Contracts (shipped)

- Required Opportunity link; optional Quotation link (only when Quotations is entitled)
- Party name, start/end dates, value/currency
- Status workflow: `draft → active → expired|terminated`
- Notes, assignment, domain timeline; **hard dependency** on Opportunities; free Marketplace opt-in under category `sales`

**Goal:** Manage the entire sales lifecycle from opportunity creation through quotation, negotiation, and contract execution. ✅ **Achieved** — Opportunities, Quotations, and Contracts are all shipped.

---

## Phase 3 — Billing

Build a comprehensive billing and invoicing solution that integrates with the existing Marketplace and subscription platform.

| Module | Status |
|--------|--------|
| [Invoices](/user-guide/invoices-overview) | ✅ Completed (line items with computed totals, status workflow, optional Contact/Company/Quotation links; free Billing opt-in) |
| [Estimates](/user-guide/estimates-overview) | ✅ Completed (pre-sale cost estimates, line items, status workflow, convert-to-invoice; free Billing opt-in, requires Invoices) |
| [Credit Notes](/user-guide/credit-notes-overview) | ✅ Completed (credit notes against invoices, line items, issue/apply/void workflow, apply credits `amount_credited` + `balance_due`; free Billing opt-in, requires Invoices) |
| [Payments](/user-guide/payments-overview) | ✅ Completed (record customer payments, allocate to invoices, post/void drives invoice balance + status; free Billing opt-in, requires Invoices) |

#### Invoices (shipped)

- No hard `module_dependencies` row — installs standalone (unlike Quotations/Contracts, which require Opportunities)
- Optional Contact/Company links and optional Quotation link (only when their module is entitled)
- Line items (description, quantity, unit price, tax rate) with server-computed subtotal / tax / total
- Balance fields (`amount_paid`, `amount_credited`, `balance_due`) driven by the Payments module — read-only via this API
- Status workflow: `draft → sent → partial|paid → void` (`send` / `void` / `status` actions)
- Notes, assignment, domain timeline; free Marketplace opt-in under category `billing`

#### Payments (shipped)

- **Hard `module_dependencies` row on Invoices** — the first Phase 3 module to require another; Marketplace blocks install until Invoices is entitled
- Payment fields (amount, currency, method, paid-at, reference, notes) plus allocations against one or more invoices
- Status workflow: `draft → posted → void` — posting applies allocations to invoice `amount_paid` and recalculates invoice balance/status; voiding reverses them
- Optional Contact/Company links, assignment, notes, domain timeline; free Marketplace opt-in under category `billing`
- `amount_credited` is not touched by Payments — see Credit Notes below

#### Credit Notes (shipped)

- **Hard `module_dependencies` row on Invoices** — same pattern as Payments; Marketplace blocks install until Invoices is entitled
- Credit note fields (title, notes, currency, issue date) plus line items (description, quantity, unit price, tax rate) with server-computed subtotal / tax / total
- Status workflow: `draft → issued → applied`, with `void` available from `draft` or `issued` — applying adds the credit note's total to the invoice's `amount_credited` and recalculates `balance_due` (does not change invoice `status`)
- Optional Contact/Company links, assignment, notes, domain timeline; free Marketplace opt-in under category `billing`

#### Estimates (shipped)

- **Hard `module_dependencies` row on Invoices** — same pattern as Payments/Credit Notes; Marketplace blocks install until Invoices is entitled
- Estimate fields (title, notes, currency, valid-until) plus line items (description, quantity, unit price, tax rate) with server-computed subtotal / tax / total
- Optional Contact/Company links, plus optional Opportunity/Quotation links (each validated only when that module is entitled)
- Status workflow: `draft → sent → accepted|rejected|expired` (identical shape to Quotations)
- **Convert to invoice** (`POST /estimates/{id}/convert`) — creates a draft `CustomerInvoice` with a copy of the estimate's lines, links it back via `customer_invoices.estimate_id`, and marks the estimate `accepted`; one-way and one-time per estimate
- Assignment, notes, domain timeline; free Marketplace opt-in under category `billing`

**Goal:** Provide complete customer billing, payment tracking, and financial document management. ✅ **Achieved** — Invoices, Payments, Credit Notes, and Estimates are all shipped, completing Phase 3.

> **Note:** Platform billing (module subscriptions, consolidated billing, gateway abstraction) already exists under Central. Phase 3 modules are **tenant product billing** (customer-facing invoices/payments), not a redesign of the Marketplace billing engine.

---

## Phase 4 — Purchasing

Introduce purchasing and vendor management. New category: `purchasing` (**Purchasing**), `category_sort_order = 40`. ✅ **Achieved** — Vendors, Purchase Orders, and Expenses are all shipped, completing Phase 4.

| Module | Status |
|--------|--------|
| [Vendors](/user-guide/vendors-overview) | ✅ Completed (supplier directory, assignment, notes/activity timeline, status; free Purchasing opt-in) |
| [Purchase Orders](/user-guide/purchase-orders-overview) | ✅ Completed (header + lines, required vendor link, status workflow, assignment, notes/activity timeline, convert to expense; free Purchasing opt-in) |
| [Expenses](/user-guide/expenses-overview) | ✅ Completed (single-amount MVP, optional vendor/PO links, status workflow, assignment, notes/activity timeline; free Purchasing opt-in) |

#### Vendors (shipped)

- Name, email, phone, website, address, tax ID, payment terms, currency, status (`active`/`inactive`)
- No `contacts` relationship — first-class, standalone supplier record (unlike Companies)
- Assignment, notes, domain timeline; free Marketplace opt-in under category `purchasing`
- KPIs: total, my vendors, unassigned, active, inactive

#### Purchase Orders (shipped)

- Required Vendor link (**hard dependency** — Marketplace blocks install until Vendors is entitled)
- Line items (description, quantity, unit price, tax rate) with server-computed subtotal / tax / total
- Status workflow: `draft → sent → partially_received|received|cancelled` (also `sent → cancelled`, `partially_received → received|cancelled`)
- `partially_received` is acknowledgement-only; a fully received PO posts stock-in for product-linked stock-tracked lines when Products and Inventory are entitled
- Convert to Expense (`POST /purchase-orders/{id}/convert`) — one-way, one-time, gated by a **soft** (call-time) check that the Expenses module is entitled, not a hard `module_dependencies` row
- Notes, assignment, domain timeline; free Marketplace opt-in under category `purchasing`

#### Expenses (shipped)

- No hard `module_dependencies` — installs standalone; optional Vendor and Purchase Order links are **soft dependencies**, validated only when those modules are entitled
- Single-amount MVP — no line items, receipts, reimbursements, or GL posting
- Fields: number (`EXP-` prefix), title, category (`travel`/`office`/`software`/`utilities`/`other`), amount, tax amount, currency, expense date, notes
- Status workflow: `draft → submitted → approved|rejected`, `approved → paid`, `draft|submitted → cancelled`
- Draft-only field edits; workflow actions (`submit`/`approve`/`reject`/`pay`/`cancel`) available regardless of edit-lock
- Notes, assignment, domain timeline; free Marketplace opt-in under category `purchasing`

**Goal:** Manage supplier relationships, procurement workflows, and operational expenses. ✅ **Achieved.**

---

## Phase 5 — Inventory

Implement inventory and warehouse management. ✅ **Achieved** — Products, Warehouses, and Inventory are all shipped.

| Module | Status |
|--------|--------|
| [Products](/user-guide/products-overview) (including Categories) | ✅ Completed (catalog, categories, stock-tracking settings, notes/activity; free Inventory opt-in) |
| [Warehouses](/user-guide/warehouses-overview) | ✅ Completed (locations, default `MAIN`, notes/activity; free Inventory opt-in) |
| [Inventory](/user-guide/inventory-overview) — Stock Management | ✅ Completed (levels, movement ledger, controlled in/out/adjust changes; hard-depends on Products) |
| [Inventory](/user-guide/inventory-overview) — Stock Transfers | ✅ Completed (draft → in transit → completed/cancelled; posts stock on completion) |

#### Products (shipped)

- SKU catalog with categories, unit/cost/price/currency, status, optional reorder level, and stock-tracking flag
- Optional `product_id` on Purchase Order lines; only stock-tracked linked products post receipt stock
- Notes, domain activity, soft delete/restore; free Marketplace opt-in under category `inventory`

#### Warehouses (shipped)

- Tenant locations with active/default status; `ensureDefaultWarehouse()` provides `MAIN` when required
- The sole default warehouse cannot be deleted
- Notes, domain activity, soft delete/restore; free Marketplace opt-in under category `inventory`

#### Inventory (shipped)

- Per-product/per-warehouse levels, movement history, low-stock visibility, and non-negative transactional posting
- Adjustments (`in`, `out`, `adjust`) and transfers (`draft → in_transit → completed|cancelled`)
- Completing a transfer posts paired movements; a received Purchase Order posts stock-in once for product-linked stock-tracked lines when Products and Inventory are entitled

**Goal:** Provide inventory control, stock tracking, warehouse operations, and product management. ✅ **Achieved.**

---

## Phase 6 — Finance

Expand into accounting and financial reporting.

| Marketplace SKU | Status |
|-----------------|--------|
| [Accounting](/user-guide/accounting-overview) | ✅ Completed (CoA, journals draft/post/void, GL inquiry; free Finance opt-in) |
| [Financial Reports](/user-guide/financial-reports-overview) | ✅ Completed (Trial Balance, P&L, Balance Sheet; hard-depends on Accounting) |

#### Capabilities (inside the SKUs — not separate Marketplace modules)

| Capability | Lives in |
|------------|----------|
| Accounts (chart of accounts) | Accounting |
| Journals | Accounting |
| General Ledger inquiry | Accounting |
| Financial Reports (TB / P&L / BS) | Financial Reports |

**Goal:** Provide the financial backbone required for a complete ERP solution. ✅ **Achieved** for the manual double-entry MVP (single currency; no auto-post from Billing/Purchasing/Inventory yet).

---

## Phase 7 — Human Resources

Implement workforce management.

| Module | Status |
|--------|--------|
| Employees | Planned |
| Attendance | Planned |
| Leave Management | Planned |
| Payroll | Planned |

**Goal:** Provide employee management, attendance tracking, leave workflows, and payroll processing.

---

## Future Expansion

The platform architecture supports additional modules without requiring architectural refactoring. Candidates include:

- Assets
- Projects
- Help Desk
- Knowledge Base
- Documents
- Manufacturing
- Quality Assurance
- Recruitment
- Customer Portal
- Vendor Portal
- Business Intelligence & Analytics
- Workflow Automation
- Marketing Automation
- Email Campaigns
- SMS & WhatsApp provider integrations (Cloud API / Twilio) — templates + `wa.me` MVP already shipped; Cloud API blueprint: [WhatsApp Cloud Integration](/developer-guide/whatsapp-cloud-integration)
- API & Webhooks
- **AI Integration (Planning)** — optional integrations with Leads, Tasks, CRM, and other domain modules
- Multi-Branch Management
- Multi-Currency Accounting
- POS (Point of Sale)
- E-Commerce Integrations

### AI

| Capability | Status |
|------------|--------|
| AI Integration (Planning) | Planned |

AI is documented as a future cross-cutting capability. Integrations with Leads, Tasks, CRM, and similar modules should be **optional**. See [Module Dependencies](/architecture/module-dependencies).

These modules will follow the same [Module Architecture](/architecture/module-architecture) and [Module Development Standard](/developer-guide/module-development) established by Leads and Tasks.

---

## Multi-Provider Email Delivery

Platform-wide capability (Central + Tenant). Today outgoing mail is **SMTP-centric** (Central defaults with optional tenant SMTP override). The roadmap evolves that into a **provider-agnostic delivery architecture** so SMTP is one driver among many — not the core design.

This is a **platform infrastructure** improvement (settings, mail transport, logging, ops), not a Marketplace-licensed business module. Implementation must extend the existing settings hierarchy and runtime config overlay; it must not redesign the frozen foundation.

| Status label | Meaning |
|--------------|---------|
| **Shipped** | Implemented in the platform |
| **Future** | Follow-on reliability, observability, and provider-specific features |
| **Enterprise** | Advanced multi-provider routing and ops for large deployments |

### Email transport abstraction (Shipped)

`EmailManager` resolves an `EmailDriverInterface` implementation from the active configuration. Application code (notifications, mailables, invites, password resets, digests) continues to send through Laravel Mail — the manager applies the active provider at runtime.

| Capability | Status |
|------------|--------|
| `EmailManager` + `EmailDriverInterface` | Shipped |
| SMTP driver | Shipped |
| Postmark API driver | Shipped |
| Mailgun API driver | Shipped |
| Amazon SES driver | Future |
| Resend driver | Future |
| SendGrid driver | Future |
| Brevo driver | Future |
| SparkPost driver | Future |
| MailerSend driver | Future |

New providers must be addable by registering a driver — without scattering provider-specific logic through Controllers, Notifications, or settings UIs.

### Central email provider (Shipped)

Central administrators select the **default outgoing email provider** for the platform (and for tenants that inherit Central mail).

| Capability | Status |
|------------|--------|
| Provider selection: SMTP, Postmark API, Mailgun API | Shipped |
| Secure credential storage (encrypted secrets at rest) | Shipped |
| From identity (name / address) retained alongside provider config | Shipped |
| Additional providers via the same Central settings surface | Future |

### Tenant email provider (Shipped)

Every tenant has two configuration modes:

1. **Use Central / System Email Provider** — inherit platform delivery (default).
2. **Use Custom Email Provider** — tenant-owned white-label delivery.

When using a custom provider, the tenant may configure **SMTP**, **Postmark API**, or **Mailgun API** (same initial driver set as Central). Credentials remain tenant-scoped, encrypted, and never returned in clear text from admin APIs.

| Capability | Status |
|------------|--------|
| Inherit Central / System provider | Shipped |
| Custom tenant provider (SMTP / Postmark / Mailgun) | Shipped |
| Encrypted tenant secrets + runtime resolution | Shipped |

### Email logs (Shipped)

Comprehensive, **isolated** email logs for Central and for each Tenant.

Typical fields:

- Subject, Recipient, CC, BCC
- Provider, Driver, Message ID
- Status, Sent Timestamp, Failure Reason
- Queue Job ID
- Notification / Mailable type

Filtering:

| Filter | Scope |
|--------|--------|
| Status, Provider, Date, User | Central and Tenant |
| Tenant | Central only |

| Capability | Status |
|------------|--------|
| Central email log store + UI filters | Shipped |
| Tenant email log store + UI filters (tenant-isolated) | Shipped |

### Queue & retry (Partial / Future)

| Capability | Status |
|------------|--------|
| Queued email delivery (`emails` queue + runtime re-apply) | Shipped |
| Retry policies + exponential backoff (`email.queue.*`) | Shipped (basic) |
| Dead-letter handling | Future |
| Manual resend from logs | Shipped |
| Priority queues | Future |

### Provider capabilities (Future)

Optional **driver capabilities** — not required of every provider. Drivers advertise what they support; the platform enables features only when the active driver implements them.

| Capability | Status |
|------------|--------|
| Delivery events | Shipped (webhook-driven) |
| Bounce detection | Shipped (webhook-driven) |
| Spam complaints | Shipped (webhook-driven) |
| Open tracking | Shipped (selectable webhook event) |
| Click tracking | Shipped (selectable webhook event) |
| Webhook processing | Shipped |
| Suppression lists | Future |

### Email analytics (Future)

Dashboards for Central and Tenant (each scoped to its own mail traffic):

- Total Sent, Failed, Delivery Rate, Bounce Rate
- Queue Size, Provider Usage
- Daily Volume, Monthly Volume

| Capability | Status |
|------------|--------|
| Central email analytics dashboard | Future |
| Tenant email analytics dashboard | Future |

### Test email (Shipped)

**Send Test Email** validates provider configuration before (or immediately after) saving credentials. Report:

- Authentication failures
- SMTP / API connectivity
- DNS / configuration issues (where applicable)
- Success / failure response
- Response time

| Capability | Status |
|------------|--------|
| Send Test Email for Central provider config | Shipped |
| Send Test Email for Tenant custom / system provider config | Shipped |

### Enterprise enhancements (Enterprise)

| Capability | Status |
|------------|--------|
| Multiple providers per tenant | Enterprise |
| Automatic provider failover | Enterprise |
| Provider priority | Enterprise |
| Cost-aware routing | Enterprise |
| Regional routing | Enterprise |
| Per-notification provider selection | Enterprise |
| Per-domain provider selection | Enterprise |
| Rate limiting | Enterprise |
| Provider health monitoring | Enterprise |

**Goal:** Production-grade, extensible email delivery for Central and Tenant applications — provider-agnostic at the core, with SMTP as one interchangeable driver, white-label tenant providers, durable logs, and a clear path to reliability, analytics, and enterprise routing without redesigning the platform.

---

## Development Principles

Every module must:

- Follow the established [Module Architecture](/architecture/module-architecture) and [platform freeze](/getting-started/platform-freeze)
- Be self-contained, own its resources, and declare [dependencies](/architecture/module-dependencies) when required
- Remain compatible with independent [module licensing](/architecture/module-licensing) and Marketplace activation
- Enforce RBAC permissions
- Maintain tenant isolation
- Integrate with the shared settings framework where applicable
- Generate audit and activity logs where applicable
- Include automated testing (Pest and Playwright)
- Pass manual browser QA
- Update the Developer Guide, User Guide, API documentation, database documentation, testing documentation, and [CHANGELOG](/changelog/) before being considered complete — see [Documentation Governance](/developer-guide/documentation-governance) (same-PR rule)

Full checklist: [Module Development Standard](/developer-guide/module-development).

---

## Long-Term Vision

Evolve the platform into a modular, enterprise-grade SaaS ERP where organizations subscribe only to the modules they require. Each module integrates with the shared platform foundation while remaining independently licensable, maintainable, and scalable.

## Related

- [Architecture](/architecture/)
- [Module Architecture](/architecture/module-architecture)
- [Module Dependencies](/architecture/module-dependencies)
- [Module Licensing](/architecture/module-licensing)
- [Platform Architecture Freeze](/getting-started/platform-freeze)
- [Module Development Standard](/developer-guide/module-development)
- [Entitlements](/developer-guide/entitlements)
- [Leads](/user-guide/leads-overview) · [Contacts](/user-guide/contacts-overview) · [Companies](/user-guide/companies-overview) · [Tasks](/user-guide/tasks-overview) · [ToDos](/user-guide/todos-overview) · [Vendors](/user-guide/vendors-overview) · [Purchase Orders](/user-guide/purchase-orders-overview) · [Expenses](/user-guide/expenses-overview)
