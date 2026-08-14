# Module Dependencies

Modules may depend on other modules.

This document defines how dependency relationships are described for product design and implementation. Runtime enforcement is implemented via `module_dependencies`, `ModuleDependencyResolver`, and `ModuleSubscriptionService` (install blocks when required dependencies are missing).

## Categories

Dependencies should be categorized as:

| Category | Meaning |
|----------|---------|
| **Required** | The dependent module cannot function correctly without the dependency installed and available |
| **Optional** | The dependent module works alone; the dependency unlocks extra integrations or features |

## Commercial nature of a dependency

Independently of required vs optional, a dependency relationship may be:

| Nature | Meaning |
|--------|---------|
| **Free** | The dependency module is free (or included) for the workspace |
| **Billable** | The dependency module is (or may become) a paid marketplace module |

A required dependency can be free or billable. An optional dependency can be free or billable. Licensing of each module remains independent — see [Module Licensing](./module-licensing).

## Examples

These examples illustrate the intended design language. They are not a commitment that every example is already implemented.

### Meetings → Calendar (required)

```text
Meetings
  └── depends on Calendar   (required)
```

Meeting scheduling assumes calendar concepts (availability, time ranges, calendar views). Meetings should declare Calendar as a **required** dependency.

**Status:** [Calendar](/user-guide/calendar-overview) and [Meetings](/user-guide/meetings-overview) are shipped. Meetings projects onto `CalendarEvent` via `CalendarEventService::upsertFromSource` (`source=meeting`, morph alias `meeting`).

### Leads → Contacts (optional)

```text
Leads
  └── may depend on Contacts   (optional — unlocks full lead convert)
```

Leads works without Contacts. When Contacts is entitled, `POST /leads/{id}/convert` creates (or links) a Contact and sets `leads.contact_id`. Without Contacts, convert remains the status-oriented placeholder (`conversion_meta.stub = true`).

**Status:** [Contacts](/user-guide/contacts-overview) is shipped. No hard `module_dependencies` row — soft entitlement check in `LeadService::convert`.

### Contacts → Companies (optional)

```text
Contacts
  └── may depend on Companies   (optional — unlocks company picker / company_id)
```

Contacts works without Companies (legacy free-text `company` string only). When Companies is entitled, Contact create/update can set `company_id` and sync the legacy string from the Company name. No hard `module_dependencies` row — soft entitlement / SPA gating.

**Status:** [Companies](/user-guide/companies-overview) is shipped.

### Activities → Contacts / Companies / Leads (optional)

```text
Activities
  ├── may depend on Contacts   (optional — contact_id link)
  ├── may depend on Companies  (optional — company_id link)
  └── may depend on Leads      (optional — lead_id link)
```

Activities works as a licensed module on its own catalog row, but create/update requires at least one related FK. Each FK is validated only when that module is entitled (soft entitlement; no hard `module_dependencies` row).

**Status:** [Activities](/user-guide/activities-overview) is shipped.

### Opportunities → Contacts / Companies / Leads (optional)

```text
Opportunities
  ├── may depend on Contacts   (optional — contact_id link)
  ├── may depend on Companies  (optional — company_id link)
  └── may depend on Leads      (optional — lead_id link)
```

Opportunities works as a licensed Sales module on its own catalog row. Related FKs are optional; each is validated only when that module is entitled (soft entitlement; no hard `module_dependencies` row).

**Sales Pipeline** is not a separate module — stages and the Kanban board live inside Opportunities.

**Status:** [Opportunities](/user-guide/opportunities-overview) is shipped.

### Quotations / Contracts → Opportunities (required)

```text
Quotations
  └── depends on Opportunities   (required)

Contracts
  └── depends on Opportunities   (required)
```

Quotations and Contracts each declare Opportunities as a **required** hard dependency (`module_dependencies`) — Marketplace install blocks until Opportunities is entitled.

**Status:** [Quotations](/user-guide/quotations-overview) and [Contracts](/user-guide/contracts-overview) are shipped.

### Contracts → Quotations (optional)

```text
Contracts
  └── may depend on Quotations   (optional — unlocks quotation_id link)
```

Contracts works without Quotations. When Quotations is entitled, a Contract may optionally link `quotation_id`; validated by `LinkableQuotation` (soft entitlement + assignee scope). No hard `module_dependencies` row for this optional link.

### Invoices → Contacts / Companies / Quotations (optional)

```text
Invoices
  ├── may depend on Contacts     (optional — contact_id link)
  ├── may depend on Companies    (optional — company_id link)
  └── may depend on Quotations   (optional — quotation_id link)
```

Invoices works as a licensed Billing module on its own catalog row with **no required `module_dependencies` row** — unlike Quotations/Contracts, it does not require Opportunities. Contact and Company links are optional and only surfaced/validated when that module is entitled. `quotation_id` is a plain tenant-scoped existence check (not gated by a `LinkableQuotation`-style entitlement rule, unlike the Contracts → Quotations link above).

**Status:** [Invoices](/user-guide/invoices-overview) is shipped.

### Payments → Invoices (required)

```text
Payments
  └── depends on Invoices   (required)
```

Payments records amounts against an invoice's `amount_paid` and allocates them to one or more `CustomerInvoice` rows on **post**, declaring Invoices as a **required** hard dependency (`module_dependencies`) — the first Phase 3 module to require another. Marketplace blocks installing Payments on a workspace that doesn't already have Invoices entitled.

**Status:** [Payments](/user-guide/payments-overview) is shipped — see [Product Roadmap](/getting-started/product-roadmap) Phase 3.

### Resellers → Payments (required)

```text
Resellers
  └── depends on Payments   (required)
```

Reseller commission accrues only when a linked customer invoice becomes fully **Paid** via the Payments ledger. Resellers declares Payments as a **required** hard dependency (`module_dependencies`). Marketplace blocks installing Resellers until Payments is entitled.

**Status:** [Resellers](/user-guide/resellers-overview) Phase 1 is shipped (free Sales opt-in). Cross-workspace reseller identity is deferred.

### Reseller Payouts → Resellers (required)

```text
Reseller Payouts
  └── depends on Resellers   (required)
```

The commission ledger (`reseller_commission_entries`) always references a `Reseller`. Reseller Payouts declares Resellers as a **required** hard dependency (`module_dependencies`). Install chain: Payments → Resellers → Reseller Payouts.

**Status:** [Reseller Payouts](/user-guide/reseller-payouts-overview) Phase 1 is shipped (free Sales opt-in).

### Credit Notes → Invoices (required)

```text
Credit Notes
  └── depends on Invoices   (required)
```

Every `CustomerCreditNote` references a `CustomerInvoice` (`customer_invoice_id`, required). Credit Notes declares Invoices as a **required** hard dependency (`module_dependencies`), the same pattern as Payments → Invoices. Applying a credit note credits the linked invoice's `amount_credited` and recalculates `balance_due` (without changing invoice `status`). Marketplace blocks installing Credit Notes on a workspace that doesn't already have Invoices entitled.

**Status:** [Credit Notes](/user-guide/credit-notes-overview) is shipped — see [Product Roadmap](/getting-started/product-roadmap) Phase 3.

### Estimates → Invoices (required)

```text
Estimates
  └── depends on Invoices   (required)
```

`POST /estimates/{id}/convert` creates a **draft** `CustomerInvoice` from an accepted (or sent) estimate, copying its lines and linking it back via `customer_invoices.estimate_id`. Estimates declares Invoices as a **required** hard dependency (`module_dependencies`), the same pattern as Payments/Credit Notes → Invoices. Estimates also has optional soft links to Contacts, Companies, Opportunities, and Quotations (each validated only when entitled; no hard dependency rows). Marketplace blocks installing Estimates on a workspace that doesn't already have Invoices entitled.

**Status:** [Estimates](/user-guide/estimates-overview) is shipped — see [Product Roadmap](/getting-started/product-roadmap) Phase 3.

### Purchase Orders → Vendors (required)

```text
Purchase Orders
  └── depends on Vendors   (required)
```

A Purchase Order cannot exist without a supplier — every `PurchaseOrder` requires a `vendor_id`. Purchase Orders declares Vendors as a **required** hard dependency (`module_dependencies`), the same pattern as Payments → Invoices / Estimates → Invoices — Marketplace blocks installing Purchase Orders until Vendors is entitled.

**Status:** [Vendors](/user-guide/vendors-overview) and [Purchase Orders](/user-guide/purchase-orders-overview) are both shipped — see [Product Roadmap](/getting-started/product-roadmap) Phase 4.

### Expenses → Vendors, Purchase Orders (optional, shipped)

```text
Expenses
  ├── may depend on Vendors           (optional — unlocks vendor_id link)
  └── may depend on Purchase Orders   (optional — unlocks purchase_order_id link)
```

Expenses installs standalone with **no** `module_dependencies` rows — it works as a generic expense record with no supplier or purchase order context. When Vendors is entitled, an Expense may optionally link `vendor_id`; when Purchase Orders is entitled, an Expense may optionally link `purchase_order_id`. Both links are validated only at the point of use (`LinkableVendor`, `LinkablePurchaseOrder` rules) — soft entitlement, no hard dependency rows, so Vendors/Purchase Orders can be uninstalled later without breaking Expenses (existing links are simply no longer enforced/displayed as active relations).

**Status:** [Vendors](/user-guide/vendors-overview), [Purchase Orders](/user-guide/purchase-orders-overview), and [Expenses](/user-guide/expenses-overview) are all shipped, completing Phase 4 — see [Product Roadmap](/getting-started/product-roadmap) Phase 4.

### Purchase Orders → Expenses (optional, shipped, reverse direction)

```text
Purchase Orders
  └── may use Expenses   (optional — unlocks "Convert to expense" action)
```

`POST /purchase-orders/{id}/convert` creates a draft Expense from a `sent`/`partially_received`/`received` purchase order. This is a **soft, call-time** entitlement check inside `PurchaseOrderService::convertToExpense()` — not a `module_dependencies` row — so Purchase Orders keeps working with Expenses uninstalled; only the convert endpoint itself returns a 422 until Expenses is installed. The conversion is one-way and one-time (an existing `Expense` with that `purchase_order_id`, including soft-deleted, blocks re-conversion).

**Status:** Shipped — see [Product Roadmap](/getting-started/product-roadmap) Phase 4 and [Tenant Purchase Orders API](/api/tenant-v1-purchase-orders#convert-to-expense-soft-dependency-on-expenses).

### Leave Management → Employees (required, shipped)

```text
Leave Management
  └── depends on Employees   (required)
```

Leave Management declares Employees as a required hard dependency (`module_dependencies`). Marketplace blocks installation until Employees is entitled. Leave balances and requests reference `employees.id`.

**Status:** Shipped — see [Product Roadmap](/getting-started/product-roadmap) Phase 7.

### Attendance → Employees (required, shipped)

```text
Attendance
  └── depends on Employees   (required)
```

Attendance declares Employees as a required hard dependency. Daily records reference `employees.id`.

**Status:** Shipped — see [Product Roadmap](/getting-started/product-roadmap) Phase 7.

### Payroll → Employees (required, shipped)

```text
Payroll
  └── depends on Employees   (required)
```

Payroll declares Employees as a required hard dependency. Payroll profiles and pay-run lines reference employee records; Payroll should not re-implement the employee directory.

**Status:** Shipped — see [Product Roadmap](/getting-started/product-roadmap) Phase 7.

### Payroll → Accounting (optional, shipped)

```text
Payroll
  └── may use Accounting   (optional — unlocks pay-run journal post)
```

Payroll installs and runs without Accounting. `POST /pay-runs/{id}/post` is a soft, call-time entitlement check inside `PayRunService::postToJournal()` — also registered as an **optional** `module_dependencies` row — so Marketplace can surface the integration while Payroll remains usable alone. Posting creates a draft journal (expense debit / liability credit) and stores `journal_entry_id`.

**Status:** Shipped — see [Tenant Payroll API](/api/tenant-v1-payroll#post-pay-runspayrunpost).

### Help Desk → Contacts, Companies (optional, shipped)

```text
Help Desk
  ├── may depend on Contacts   (optional — unlocks contact_id link)
  └── may depend on Companies  (optional — unlocks company_id link)
```

Help Desk installs standalone with **no** `module_dependencies` rows — it works as an internal ticket queue with no CRM context. When Contacts is entitled, a ticket may optionally link `contact_id`; when Companies is entitled, a ticket may optionally link `company_id`. Both links are validated only at the point of use (`LinkableContact`, `LinkableCompany` rules) — soft entitlement, no hard dependency rows.

**Status:** Shipped — see [Help Desk Overview](/user-guide/help-desk-overview) and [Product Roadmap](/getting-started/product-roadmap) Phase 8.

### Inventory → Products (required, shipped)

```text
Inventory
  └── depends on Products   (required)
```

Inventory declares Products as a required hard dependency (`module_dependencies`), so Marketplace blocks Inventory installation until Products is entitled. Stock levels, adjustments, transfers, and receipt posting all reference Products.

### Inventory → Warehouses (optional, shipped)

```text
Inventory
  └── may use Warehouses   (optional — locations and default warehouse)
```

Inventory soft-uses Warehouses through `WarehouseService::ensureDefaultWarehouse()` to provide the `MAIN` location when a stock action omits `warehouse_id`. The Warehouses module gates its own management UI and CRUD; it is not a hard Inventory install dependency.

### Purchase Orders → Inventory (optional, shipped)

```text
Purchase Orders
  └── may use Inventory   (optional — receipt stock posting)
```

Purchase Orders continues to work without Inventory. When Inventory and Products are entitled, receiving a PO posts stock-in for each line with a nullable `product_id` whose linked Product tracks stock; `LinkableProduct` validates that link. Partially received remains acknowledgement-only. This is a soft integration, not a `module_dependencies` row.

### Financial Reports → Accounting (required, shipped)

```text
Financial Reports
  └── depends on Accounting   (required)
```

Financial Reports declares Accounting as a required hard dependency (`module_dependencies`). Marketplace blocks installation until Accounting is entitled. Reports read posted journal lines only.

### Accounting → Inventory (optional, future)

```text
Accounting
  └── may depend on Inventory   (optional)
```

Accounting ships standalone (manual double-entry). A future milestone may optionally integrate stock valuations or COGS-related flows through contracts/services. Auto-posting from Expenses / Invoices / Payments / Credit Notes is also deferred (soft integrations, not hard install deps).

### Projects (standalone) + Tasks → Projects (optional, shipped)

```text
Projects
  ├── may depend on Contacts       (optional — contact_id link)
  ├── may depend on Companies      (optional — company_id link)
  └── may depend on Opportunities  (optional — opportunity_id link)

Tasks
  └── may depend on Projects       (optional — project_id link)
```

Projects installs standalone with **no** `module_dependencies` rows — title, status board, assignee/members, notes/timeline work without CRM modules. Soft FKs to Contact / Company / Opportunity are validated only when those modules are entitled. Tasks may optionally set `project_id` via `LinkableProject` (Projects entitled + project visible to the actor); uninstalling Projects nulls the FK (`nullOnDelete`). No hard install dependency either direction.

**Status:** [Projects](/user-guide/projects-overview) shipped lean **v1.0.0**; Tasks catalog **1.2.0** adds soft `project_id`.

### Knowledge Base (standalone, shipped)

```text
Knowledge Base
  └── (no hard dependencies)
```

Knowledge Base installs as a free Operations Marketplace opt-in (`knowledge-base` **1.0.0**) with **no** `module_dependencies` rows. Internal workspace articles only — Help Desk links, public URLs, and Automation triggers are deferred and must remain soft/optional if added later.

**Status:** Shipped — see [Knowledge Base Overview](/user-guide/knowledge-base-overview) and [Product Roadmap](/getting-started/product-roadmap).

### AI → domain modules (optional)

```text
AI
  ├── may optionally integrate with Leads
  ├── may optionally integrate with Tasks
  ├── may optionally integrate with CRM (Contacts, Companies, …)
  └── … other domain modules as needed
```

AI Integration is planned as a cross-cutting capability. Integrations with Leads, Tasks, CRM, and similar modules should be **optional** — AI must not require every domain module to be installed.

### Storage packs → Storage (required)

```text
storage-10 / storage-50 / storage-100 / storage-500 / storage-1000
  └── depends on storage   (required)
```

Billable capacity packs cannot install until free **Storage** is entitled. Packs are mutually exclusive in product logic (cancel current pack before buying another size). Content upload modules (Team Chat, Feedback, Lead imports) soft-check Storage allowance; they do not declare a hard `module_dependencies` row on Storage. Team Chat soft-companion installs free Storage when Team Chat is activated.

**Status:** [Storage](/user-guide/storage-overview) shipped.

## Design rules

When designing a new module:

1. List **required** dependencies explicitly in the module’s documentation.
2. List **optional** integrations separately so install and licensing expectations stay clear.
3. Keep business logic inside the owning module; call dependents through contracts/services only ([Module Architecture](./module-architecture)).
4. Do not assume a dependency is always present unless it is marked **required** and the platform later enforces that rule.
5. Do not implement dependency resolution in application code based on this document alone — that remains future work.

## Related

- [Module Architecture](./module-architecture)
- [Module Licensing](./module-licensing)
- [Product Roadmap](/getting-started/product-roadmap) (Calendar, Meetings, AI)
- [Entitlements](/developer-guide/entitlements)
