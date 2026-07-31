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

### Payroll → HR (required)

```text
Payroll
  └── depends on HR         (required)
```

Payroll needs employee and employment records from HR. Payroll should not re-implement HR domain logic.

### Accounting → Inventory (optional)

```text
Accounting
  └── may depend on Inventory   (optional)
```

Accounting can operate without Inventory. When Inventory is installed, Accounting may optionally integrate stock valuations or COGS-related flows through contracts/services.

### AI → domain modules (optional)

```text
AI
  ├── may optionally integrate with Leads
  ├── may optionally integrate with Tasks
  ├── may optionally integrate with CRM (Contacts, Companies, …)
  └── … other domain modules as needed
```

AI Integration is planned as a cross-cutting capability. Integrations with Leads, Tasks, CRM, and similar modules should be **optional** — AI must not require every domain module to be installed.

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
