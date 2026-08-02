# Changelog

## Departments module (2026-08-03)

Marketplace HR module (`departments`, not default-included) for organizing users and employees:

- One User manager per department; one user may manage many departments
- Many-to-many membership for users and employees
- Admins see all departments; managers see managed departments + performance; staff see memberships
- Performance dashboard aggregates Leads/Tasks for linked users only (unlinked employees stay on the roster)
- Employee forms use multi-select `department_ids` when Departments is installed (legacy string column retained)
- Playwright: `npm run test:e2e:departments`

Docs: [User Guide](/user-guide/departments), [Developer Guide](/developer-guide/departments), [API](/api/tenant-v1-departments), [Deployment](/deployment/departments).

## Create employee from existing user (2026-08-03)

Workspaces that installed **Employees** after creating users can now convert a login into a directory record:

- Users row action **Create employee record** (requires Employees module + `employees.create`)
- `POST /api/tenant/v1/users/{user}/create-employee` (user-row lock; inactive when the user is suspended)
- User list/show/update include nullable `employee_id`
- Race-safe active link via `employees.active_user_id` + unique `(tenant_id, active_user_id)`; soft delete frees the link for re-provision
- Salary remains on Payroll profiles (unchanged)

## Tenant email notification toggles (2026-08-03)

Workspace admins can enable or disable **event emails** under **Settings → Notifications**. Defaults are **all off** to reduce SMTP cost during MVP testing. In-app and web push channels are unchanged. Daily task digests, daily CRM summaries, and auth emails (password reset / verification) always send.

Toggles: task assigned, task completed/reopened, follow-up created, follow-up due/overdue, meeting events, other module assignments.

## Workspace timezone convention + daily reminder gating (2026-08-03)

**Code**

- Task digest and daily CRM summary emails gated by **Daily Reminder Time** compare against the workspace timezone explicitly (`now($timezone)`), not the server/UTC process clock.
- Tenant `applyRuntimeConfig()` applies timezone before mail overlay and no longer drops workspace timezone when mail provider config fails.

**Docs convention**

- Canonical [Workspace timezone convention](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes): one Settings → General timezone (e.g. `Asia/Karachi`) drives Daily Reminder Time, task dues, lead follow-ups, meetings/calendar, and attendance office hours / login check-in. No per-module timezone.
- Binding for **all current and future modules**: Module Development Standard principle + Definition of Done, Module Development Guide (Date and time), Module Architecture, and Platform Freeze Configuration row.
- User Guide Settings, Attendance, Tasks, Leads, Meetings, and Calendar pages cross-link that rule.

---

## HR user sync, login attendance, and payroll deductions (2026-08-02)

**Users ↔ Employees**

- Creating a workspace user can provision a linked **Employee** when the Employees module is installed (`create_employee`, default on). Suspend sets the linked employee to inactive; name/email updates sync to the employee record.

**Attendance**

- Tenant Settings → **Attendance** (when the module is installed): office start/end, grace minutes, work week days.
- Successful tenant login auto check-in for linked active employees (first login of the day; status `present` or new `late`).
- Attendance status enum adds `late`.
- Login check-in stores **IP** and optional **GPS coordinates** (`check_in_ip` / `check_in_latitude` / `check_in_longitude`); shown on the attendance detail sheet.

**Payroll**

- Pay runs deduct unpaid leave and unexcused absences from base salary using the working-day calendar; line breakdown fields: `working_days`, `unpaid_leave_days`, `absent_days`, `days_present`.

**Verification**

- Pest: attendance settings, login check-in, user→employee provision, pay-period calculator. Docs and UI updated for settings, attendance, payroll, and users.

---

## Phase 7 HR — Employees, Leave Management, Attendance, Payroll (2026-08-01)

**Architecture**

- Shipped four free Marketplace SKUs under category `hr` (sort `70`): **Employees** (`employees`), **Leave Management** (`leave-management`, sort `20`), **Attendance** (`attendance`, sort `30`), and **Payroll** (`payroll`, sort `40`). All are opt-in and non-billable.
- Leave Management, Attendance, and Payroll hard-depend on Employees (`module_dependencies`). Payroll optionally depends on Accounting for pay-run journal posting.
- Roadmap capabilities (directory, leave types/balances/requests, daily attendance, profiles, pay runs) live inside these four SKUs — not separate Marketplace modules.

**Domain**

- Employees directory with employment type/status, optional workspace user link, soft delete, and stats KPIs.
- Leave types, per-year balances, and leave requests with `draft → pending → approved|rejected` (cancel from draft/pending); approve applies days to balances under `lockForUpdate()`.
- Attendance records unique per employee/date with check-in/out and presence status (`present` / `absent` / `half_day` / `remote`).
- Payroll profiles (one per employee) and pay runs that auto-generate lines from active profiles; lifecycle `draft → approved → paid`; optional soft post to a draft Accounting journal (expense debit / liability credit).

**Security & production readiness (2026-08-02)**

- Full security audit: [`/deployment/hr-phase7-security-audit`](/deployment/hr-phase7-security-audit) · ops readiness: [`/deployment/hr-phase7-production-readiness`](/deployment/hr-phase7-production-readiness).
- Leave: balance upsert RBAC, days capped to date range, insufficient-balance reject on approve, approved requests not soft- **or** force-deletable, `remaining` always derived, transition locks.
- Payroll: pay-run approve/pay/post `lockForUpdate`, line gross `min:0`, journal accounts must be expense/liability; default **staff** no longer has `payroll.view`.
- Employees: unique `user_id` link; Attendance: `check_out >= check_in`.
- Re-verification: companion PR CI green (Backend #72 QG+Pest, Frontend #66, Docs #75); headed Playwright Employees/Leave/Attendance/Payroll **6/6 each**; **GO** for opt-in staging → production after staff-role re-sync.

**Frontend & verification**

- HR nav group with Employees / Leave / Attendance / Payroll UI; API clients, query keys, and permissions wired for module pages.
- Playwright: `test:e2e:employees` · `leave-management` · `attendance` · `payroll` (modules + authz). Pest under `tests/Feature/Tenant/Employee`, `Leave`, `Attendance`, and `Payroll`.

**Docs**

- User / developer / deployment / API guides for all four SKUs; roadmap, module-dependencies, and `database.md` HR tables updated; Phase 7 HR security audit + production readiness pages.

---

## Phase 6 Finance — Accounting + Financial Reports (2026-08-01)

**Architecture**

- Shipped two free Marketplace SKUs under category `finance` (sort `60`): **Accounting** (`accounting`, sort `10`) and **Financial Reports** (`financial-reports`, sort `20`). Both are opt-in and non-billable.
- Roadmap capabilities Accounts / Journals / General Ledger live inside **Accounting**; Trial Balance / P&L / Balance Sheet live in **Financial Reports**.
- Financial Reports hard-depends on Accounting (`module_dependencies`).

**Domain**

- Chart of accounts (`accounts`) with starter system CoA on first list; journal headers/lines with balanced debit/credit validation; lifecycle `draft → post → void` (void excluded from GL/reports).
- General ledger inquiry aggregates posted lines (no balance cache), **paginated** (default 100 / max 500) with period opening/closing balances. Manual double-entry only — no auto-post from Billing/Purchasing/Inventory; single currency.
- Production hardeners: journal `post`/`void` use `lockForUpdate()` transactions; system account `code` locked in API; report/GL query dates FormRequest-validated; CoA seed race-safe.

**Frontend & verification**

- Finance nav: Accounts, Journals, General Ledger, Financial Reports; dual module/permission gates.
- Accounts trash/restore/force-delete UX; journal void confirm + optional reason; GL pagination.
- Playwright (per module, headed-ready): shared-session human suites (`accounting.modules` / `financial-reports.modules`), authz/security (`*.authz`), smoke (`*.workflow`); combined `test:e2e:finance` / `test:e2e:finance:headed`.
- Pest: balance/post/void, cross-tenant isolation, double-post/void-draft, GL pagination, FR module gate + date validation.

**Docs**

- User / developer / deployment / API guides for both SKUs; roadmap, module-dependencies, and `database.md` finance tables updated.

---

## Marketplace filters and dependency enable (2026-08-01)

- Tenant Marketplace adds filter chips for **Installed**, **Available**, **Paid**, and **Free** (combinable: install status × pricing).
- Module detail drawer shows required-dependency fee and an **Install** / **Subscribe** action when a hard dependency is missing. Paid dependencies open that module’s subscribe flow (billing cycle + checkout); free dependencies install in place.
- Tenant (and Central) marketplace show payloads enrich `required_modules` / `optional_modules` / `missing_required_modules` with `is_billable`, prices, and install flags.

---

## Tenant currency defaults + Products as services (2026-08-01)

**Currency UX**

- Money forms (invoices, estimates, quotations, opportunities, contracts, payments, expenses, purchase orders) and Products/Vendors currency fields now use the shared searchable currency list from Settings (`currencyOptions`), not a five-code hard-coded dropdown or free-text code.
- Create dialogs default currency to the tenant workspace currency from Settings (fallback `USD`). Edit keeps the record’s existing currency. Credit notes still inherit currency from the selected invoice; their bare create fallback also uses the tenant currency.

**Products as services**

- The Products catalog is documented and labeled for both goods and services. Services use the same catalog with **Track stock** turned off; Inventory continues to manage only stock-tracked items. No new product/service type column.

---

## Phase 5 Inventory (2026-08-01)

**Architecture**

- Shipped three free Marketplace SKUs under the new `inventory` category (category sort `50`): **Products** (`10`), **Warehouses** (`20`), and **Inventory** (`30`). All are opt-in, non-billable, and not default-included; catalog module count increases from **20 to 23**.
- Inventory has a required hard dependency on Products. Warehouses is a soft Inventory integration: its UI CRUD remains module-gated while `ensureDefaultWarehouse()` supplies active default code `MAIN` to operations that omit a location.
- Products provides categories, stock-tracking flags, notes/activity, and nullable `product_id` integration on Purchase Order lines. Warehouses provides locations, notes/activity, and guards against deleting the sole default warehouse.

**Stock and purchasing**

- Added per-product/per-warehouse `stock_levels`, immutable `stock_movements`, and draftable `stock_transfers` with line items. `StockService` is the sole stock mutation boundary, using transactions and `lockForUpdate()` to maintain a non-negative balance and movement ledger.
- Stock adjustment types are `in`, `out`, and `adjust`; transfers follow `draft → in_transit → completed|cancelled` and post paired stock movements only on completion.
- Purchase Order lines now optionally link a Product. A **received** Purchase Order posts stock-in once for linked products with `track_stock=true` when Products and Inventory are entitled; `partially_received` remains acknowledgement-only. Receipt may select `warehouse_id` or use the default.
- PO receive integrity: `POST …/status` with `received` / `partially_received` routes through `receive()` (same stock path as `/receive`); status + stock post share one transaction with `lockForUpdate()` on the PO so concurrent receives cannot double-post and a failed stock post does not leave the PO stuck as received.

**Frontend, verification, and docs**

- Added Products, Warehouses, and Inventory tenant pages using the existing AppLayout, entitlement/permission-gated navigation, services, types, query keys, forms, detail sheets, and shared states.
- Added Pest coverage under `tests/Feature/Tenant/Product`, `Warehouse`, and `Inventory`, plus Playwright commands `test:e2e:products`, `test:e2e:warehouses`, `test:e2e:inventory`, and shared-session `test:e2e:inventory-phase` / `test:e2e:inventory-phase:headed` (Products → Warehouses → Stock → PO receive, with form validation and human-mistake paths under one login).
- Added User, Developer, Deployment, and Tenant API guides; updated module dependencies, database dictionary, Purchase Order receiving documentation, roadmap, changelog, and documentation sidebars.

**Out of scope**

- Serial/lot tracking, inventory valuation, and COGS are not included in Phase 5.

---

## Expenses module + Purchase Order convert (2026-08-01)

**Architecture**

- Third and final Phase 4 (Purchasing) module (backend model `Expense`) — a standalone operational-expense record: single amount (no line items), category, optional links to a Vendor and/or Purchase Order. Flat Laravel, `module:expenses` + Spatie RBAC, mirrors the simplified Estimate/Payment notes/timeline/assignee-scope/status-machine pattern.
- **No hard `module_dependencies`** — Expenses installs standalone. `vendor_id` and `purchase_order_id` are both nullable and validated only at the point of use (`LinkableVendor`, new `LinkablePurchaseOrder` rule) when the corresponding module (`vendors` / `purchase-orders`) is entitled — a **soft** dependency, unlike Purchase Orders' hard dependency on Vendors. **Free Marketplace opt-in** — catalog category `purchasing`, `is_default_included=false` / `is_billable=false`, `sort_order=30` (after Purchase Orders' `20`).
- Status workflow `draft → submitted → approved|rejected`, `approved → paid`, `draft|submitted → cancelled` via `ExpenseStatusEnum::allowedTransitions()`; `rejected`/`paid`/`cancelled` are terminal. Only `draft` expenses can have their fields edited — workflow actions (submit/approve/reject/pay/cancel) remain available regardless.
- **Convert a Purchase Order to an Expense** (`POST /purchase-orders/{id}/convert`) — the deferred Phase 4 Milestone 2 feature, now shipped as part of Milestone 3. One-way, one-time: creates a **draft** `Expense` from a `sent`/`partially_received`/`received` purchase order (`title`, `amount`←`total`, `tax_amount`←`tax_total`, `currency`, `vendor_id`, `assigned_to`, `notes` copied; `category` always `other`). Re-running the conversion is blocked by an existing `Expense` row for that `purchase_order_id` (including soft-deleted). Gated by a new **soft, call-time** entitlement check for the Expenses module inside `PurchaseOrderService::convertToExpense()` — not a `module_dependencies` row — so Purchase Orders keeps working with Expenses uninstalled; only the convert endpoint 422s until Expenses is installed. New permission `purchase-orders.convert`.

**Backend**

- Tables: `expenses`, `expense_notes`, `expense_activities`
- Auto-numbered (`EXP-00001`, prefix from new `expenses_number_prefix` tenant setting, retried on duplicate via the shared `RetriesOnDuplicateNumber` trait)
- Enums: `ExpenseCategoryEnum` (`travel`, `office`, `software`, `utilities`, `other`), `ExpenseStatusEnum` (`draft`, `submitted`, `approved`, `rejected`, `paid`, `cancelled`), `ExpenseActivityTypeEnum` (`Created`, `Updated`, `Assigned`, `StatusChanged`, `NoteAdded`, `Deleted`, `Restored`)
- Permissions: `expenses.view|create|update|delete|restore|force.delete|assign|submit|approve|reject|pay|cancel`
- Model (`Expense`, `BelongsToTenant`, soft deletes, UUID, `LogsActivity`) + factories, controller, form requests, API resources, policy (assignee-scoped view/update/submit/cancel; approve/reject/pay are **not** assignee-scoped), service (`ExpenseService`: numbering, status machine, notes, timeline, assign), events, `AppServiceProvider`-registered event subscriber (audit + assignment notification)
- New `LinkablePurchaseOrder` rule (mirrors `LinkableVendor`) — validates `purchase_order_id` belongs to the tenant and the Purchase Orders module is entitled, only when a value is supplied
- `PurchaseOrderService::convertToExpense()` mirrors `EstimateService::convert()`'s draft-creation pattern but swaps the hard-dependency check for a soft `EntitlementService::hasModule()` check; new `PurchaseOrderActivityTypeEnum::Converted` timeline entry and `PurchaseOrderConverted` event
- Catalog registration (no `module_dependencies` row) via `DefaultModuleRegistrar` migration (migrate-only); permissions + default role map additive migrations for both `expenses.*` and `purchase-orders.convert`
- `expenses_number_prefix` added to `TenantSettingDefinitions` and `UpdateTenantSettingsRequest` validation
- Pest: `tests/Feature/Tenant/Expense/ExpenseTest.php` (CRUD, soft FK validation against module entitlement, status workflow, assignee scoping, module gate), Purchase Order convert coverage added to `PurchaseOrderTest.php` (entitled vs blocked, one-time conversion, status guard)
- Module counts bumped from 19 → 20 across `MarketplaceCatalogTest`, `TenantProvisioningTest`, `TenantAuthTest` fixtures

**Frontend**

- `src/pages/expenses/` — list page (KPIs: total, mine, draft/submitted/approved/rejected/paid, approved & paid value; status/category/vendor/PO/assignee filters, DataTable), create/edit form dialog (category select, amount, tax amount, currency, expense date, notes, optional vendor/purchase order `SearchableSelect` pickers rendered only when the corresponding module is entitled and viewable), detail sheet (overview/notes/timeline tabs; submit/approve/reject/pay/cancel/assign/notes/edit (draft only))
- Added to the existing tenant sidebar **Purchasing** group, after Purchase Orders
- `expenseService`, `QUERY_KEYS.expenses`, `PERMISSIONS.expenses`
- Purchase order detail sheet: new **Convert to expense** action (permission `purchase-orders.convert`, visible only when the PO status is convertible, the Expenses module is entitled, and it hasn't already been converted) with a confirm dialog; shows a link to the resulting expense under "Related records" once converted
- Notification registry: `expense.assigned` → `/expenses?expense={id}`
- Playwright: `e2e/tests/expenses/expenses.workflow.spec.ts` (`npm run test:e2e:expenses`) — enables `vendors` + `purchase-orders` + `expenses`, covers KPI smoke, create/submit/approve/pay workflow, and end-to-end PO → Expense conversion

**Docs**

- [expenses-overview.md](/user-guide/expenses-overview) / [expenses.md](/user-guide/expenses) (+ [developer](/developer-guide/expenses) / [production](/deployment/expenses))
- [api/tenant-v1-expenses.md](/api/tenant-v1-expenses); [api/tenant-v1-purchase-orders.md](/api/tenant-v1-purchase-orders) updated with the convert endpoint
- [purchase-orders-overview.md](/user-guide/purchase-orders-overview) / [purchase-orders.md](/user-guide/purchase-orders) updated — convert-to-expense moved from deferred to shipped
- [Module Dependencies](/architecture/module-dependencies) updated — Expenses' soft dependencies on Vendors/Purchase Orders, and Purchase Orders' soft use of Expenses for convert, both marked shipped
- [Product Roadmap](/getting-started/product-roadmap) — Expenses marked shipped; **Phase 4 — Purchasing goal Achieved**

**Deferred**

- Receipt attachments, reimbursements, GL posting, multi-line expenses (all explicitly out of scope for this MVP)

---

## Purchase Orders module (2026-08-01)

**Architecture**

- Second Phase 4 (Purchasing) module — Milestone 2, header + line-item procurement documents a tenant issues to its own vendors (backend model `PurchaseOrder`). Flat Laravel, `module:purchase-orders` + Spatie RBAC, mirrors the Estimates notes/timeline/assignee-scope/lines/status-machine pattern, swapping Estimates' optional related-record pickers for a single **required** `vendor_id`.
- **Hard dependency on Vendors** — same pattern as Estimates → Invoices; Marketplace blocks installing Purchase Orders until a workspace already has Vendors entitled (every purchase order requires a vendor). **Free Marketplace opt-in** — catalog category `purchasing`, `is_default_included=false` / `is_billable=false`, `sort_order=20` (after Vendors' `10`).
- Status workflow `draft → sent → partially_received|received|cancelled` (also `sent → cancelled`, `partially_received → received|cancelled`); `received`/`cancelled` are terminal. **Receiving is acknowledgement only** — no Inventory stock posting (no Inventory module exists on this platform). Convert-to-expense is deferred to Phase 4 Milestone 3.

**Backend**

- Tables: `purchase_orders`, `purchase_order_lines`, `purchase_order_notes`, `purchase_order_activities`
- Auto-numbered (`PO-00001`, prefix from `purchase_orders_number_prefix` tenant setting, retried on duplicate via the shared `RetriesOnDuplicateNumber` trait)
- Enums: `PurchaseOrderStatusEnum` (`draft`, `sent`, `partially_received`, `received`, `cancelled`), `PurchaseOrderActivityTypeEnum` (`Created`, `Updated`, `Assigned`, `StatusChanged`, `NoteAdded`, `Deleted`, `Restored`)
- Permissions: `purchase-orders.view|create|update|delete|restore|force.delete|assign|send|receive|cancel`
- Model + factories, controller, form requests, API resources, policy (assignee-scoped view/update/send/receive/cancel), service (`PurchaseOrderService`, `syncLines`/`recalculateTotals` like Estimates; `receive()` only accepts `partially_received`/`received`), events, `AppServiceProvider`-registered event subscriber (audit + assignment notification)
- `LinkableVendor` rule — `vendor_id` is required, tenant-scoped, and validates the Vendors module is entitled
- Catalog registration + `module_dependencies` row on `vendors` via `DefaultModuleRegistrar` migrations (migrate-only); permissions + default role map additive migrations
- `purchase_orders_number_prefix` added to `UpdateTenantSettingsRequest` validation (was previously stripped, causing `updateMany` to receive `null`)
- Pest: `tests/Feature/Tenant/PurchaseOrder/PurchaseOrderTest.php`, `tests/Feature/Central/Module/PurchaseOrdersModuleDependencyTest.php`

**Frontend**

- `src/pages/purchase-orders/` — list page (KPIs: total, mine, draft, sent, partially received, received; status/vendor/assignee filters, DataTable), create/edit form dialog (required vendor `SearchableSelect`, currency, order date, expected date, notes, line items editor with live subtotal/tax/total preview), detail sheet (overview/lines/notes/timeline tabs; send/mark partially received/mark received/cancel/assign/notes/edit (draft only))
- Added to the existing tenant sidebar **Purchasing** group, after Vendors
- `purchaseOrderService`, `QUERY_KEYS.purchaseOrders`, `PERMISSIONS.purchaseOrders`
- Notification registry: `purchase-order.assigned` → `/purchase-orders?purchase_order={id}`
- Playwright: `e2e/tests/purchase-orders/purchase-orders.workflow.spec.ts` (`npm run test:e2e:purchase-orders`) — enables both `vendors` and `purchase-orders` modules, creates a vendor, creates a purchase order, verifies status transitions (draft → sent → partially received → received), checks the timeline, then deletes it

**Docs**

- [purchase-orders-overview.md](/user-guide/purchase-orders-overview) / [purchase-orders.md](/user-guide/purchase-orders) (+ [developer](/developer-guide/purchase-orders) / [production](/deployment/purchase-orders))
- [api/tenant-v1-purchase-orders.md](/api/tenant-v1-purchase-orders)
- [Module Dependencies](/architecture/module-dependencies) updated — Purchase Orders → Vendors marked shipped
- [Product Roadmap](/getting-started/product-roadmap) — Purchase Orders marked shipped in Phase 4; Expenses remains Planned

**Deferred**

- Convert a purchase order to an Expense (Phase 4 Milestone 3), Inventory stock posting on receipt, per-line partial receiving, purchase order PDFs / e-mail delivery to vendors, dashboard widgets for Purchase Orders

---

## Vendors module (2026-08-01)

**Architecture**

- First Phase 4 (Purchasing) module and Milestone 1 of that phase — a workspace directory of suppliers (backend model `Vendor`, first-class entity, **no** relationship to Contacts unlike Companies). Flat Laravel, `module:vendors` + Spatie RBAC, mirrors the Companies notes/timeline/assignee-scope pattern.
- Introduces a new Marketplace category: `purchasing` (**Purchasing**), `category_sort_order=40`. **Free Marketplace opt-in** — `is_default_included=false` / `is_billable=false`, `sort_order=10`.
- No `industry`, `source`, `source_meta`, or `contacts` relationship (unlike Companies). Adds `tax_id`, `payment_terms`, `currency` (max 3 chars), and a `status` enum (`active`/`inactive`, default `active`).

**Backend**

- Tables: `vendors`, `vendor_notes`, `vendor_activities`
- Enums: `VendorStatusEnum` (`active`, `inactive`), `VendorActivityTypeEnum` (`Created`, `Updated`, `Assigned`, `NoteAdded`, `Deleted`, `Restored`)
- Permissions: `vendors.view|create|update|delete|restore|force.delete|assign`
- Model + factories, controller, form requests, API resources, policy, service (search includes `tax_id`; stats: `total_vendors`, `my_vendors`, `unassigned`, `active`, `inactive`, `scope`), events, `AppServiceProvider`-registered event subscriber (audit + assignment notification)
- Catalog registration (new `purchasing` category + `vendors` module) via `DefaultModuleRegistrar` migration (migrate-only); permissions + default role map additive migrations
- Pest: `tests/Feature/Tenant/Vendor/VendorTest.php` (mirrors `CompanyTest`, includes module gate coverage)

**Frontend**

- `src/pages/vendors/` — list page (KPIs: total, my vendors, unassigned, active, inactive; status + assignee filters, DataTable), create/edit form dialog (name, email, phone, website, address, tax ID, payment terms, currency, status, assignee), detail sheet (overview/notes/activity tabs)
- New tenant sidebar **Purchasing** group (after Billing), with Vendors (Truck icon)
- `vendorService`, `QUERY_KEYS.vendors`, `PERMISSIONS.vendors`
- Notification registry: `vendor.assigned` → `/vendors?vendor={id}`
- Playwright: `e2e/tests/vendors/vendors.workflow.spec.ts` (`npm run test:e2e:vendors`) — enables the `vendors` module, creates a vendor, verifies KPI cards, notes, and activity timeline, then deletes it

**Docs**

- [vendors-overview.md](/user-guide/vendors-overview) / [vendors.md](/user-guide/vendors) (+ [developer](/developer-guide/vendors) / [production](/deployment/vendors))
- [api/tenant-v1-vendors.md](/api/tenant-v1-vendors)
- [Module Dependencies](/architecture/module-dependencies) updated — Purchase Orders → Vendors (required, design) and Expenses → Vendors (optional, design) documented ahead of those modules shipping
- [Product Roadmap](/getting-started/product-roadmap) — Vendors marked shipped in Phase 4, Purchase Orders and Expenses expanded with designed MVP capability bullets

**Deferred**

- Purchase Orders (Phase 4 Milestone 2), Expenses (Phase 4 Milestone 3), vendor scorecards/performance tracking, vendor portal, vendor import/export, dashboard widgets, communication template placeholders

---

## Phase 3 Billing production hardening (2026-08-01)

**Security / ledger integrity**

- Payment `post()` now requires each allocated invoice to be active Sent/Partial, rejects allocations above `balance_due`, and rejects currency mismatches; soft-deleted invoices cannot be paid.
- Invoice void limited to Draft/Sent with zero `amount_paid` / `amount_credited` (Partial→Void removed).
- Credit note `apply()` requires Sent/Partial invoice and credit total ≤ `balance_due`.
- Unique `(tenant_id, number)` indexes on customer invoices/payments/credit notes and estimates, with create-time duplicate-number retry.

**UX / CI**

- Payments list supports `?invoice=` deep-link (mirrors Credit Notes); invoice detail links through.
- Docs Quality Gate: raised Vite `chunkSizeWarningLimit` and excluded Rollup chunk-size advisories from WARNING grep.
- Pest expectations updated for `todos` as a third default-included module (unblocks Backend CI).

## Estimates module (2026-07-31)

**Architecture**

- Fourth and final Phase 3 (Billing) module — pre-sale cost estimates a tenant issues to its own customers (backend model `Estimate`, no `Customer` prefix — distinct naming from Invoices/Payments/Credit Notes since there's no equivalent Central concept to collide with). Flat Laravel, `module:estimates` + Spatie RBAC, mirrors the Credit Notes/Invoices notes/timeline/assignee-scope/lines pattern, plus a Quotations-shaped status machine.
- **Hard dependency on Invoices** — same pattern as Payments/Credit Notes; Marketplace blocks installing Estimates until a workspace already has Invoices entitled (converting an estimate always creates a `CustomerInvoice`). **Free Marketplace opt-in** — catalog category `billing`, `is_default_included=false` / `is_billable=false`, `sort_order=40` (after Credit Notes' `30`).
- Estimates introduces a **convert-to-invoice** action (`POST /estimates/{id}/convert`) — the first Phase 3 action that creates a row in a *different* module's table. Adds the `customer_invoices.estimate_id` foreign key (the nullable column already existed from the Invoices migration; this module adds the constraint once `estimates` exists).
- Optional soft links to Contacts, Companies, Opportunities, and Quotations — each validated only when that module is entitled, no hard dependency rows for these.

**Backend**

- Tables: `estimates`, `estimate_lines`, `estimate_notes`, `estimate_activities`
- Auto-numbered (`EST-00001`, prefix from `estimates_number_prefix` tenant setting)
- Status workflow `draft → sent → accepted|rejected|expired` (`EstimateStatusEnum`, identical shape to `QuotationStatusEnum`); disallowed transitions return a 422 validation error
- `convertToInvoice()` copies the estimate's lines into a new draft `CustomerInvoice` via `CustomerInvoiceService::create()`, links it back via `estimate_id`, marks the estimate `accepted` if not already, and rejects a second conversion attempt
- Permissions: `estimates.view|create|update|delete|restore|force.delete|assign|send|accept|convert`
- Model + factories, controller, form requests, API resources, policy, service, events (incl. `EstimateConverted`), `AppServiceProvider`-registered event subscriber (audit + assignment notification)
- Catalog registration + `module_dependencies` row via `DefaultModuleRegistrar` migrations (migrate-only); permissions + default role map additive migrations
- Pest: `tests/Feature/Tenant/Estimate/EstimateTest.php`, `tests/Feature/Central/Module/EstimatesModuleDependencyTest.php`
- Fixed a pre-existing MySQL "identifier name too long" bug (index names exceeding the 64-character limit) in the `customer_invoice_activities`, `customer_payment_activities`, and `customer_credit_note_activities` migrations, plus the `customer_payment_allocations` unique constraint and the `customer_credit_note_notes` / `customer_credit_note_lines` indexes — discovered while migrating this batch on real MySQL; all now use explicit shortened index names

**Frontend**

- `src/pages/estimates/` — list page (KPIs incl. Accepted value, Converted badge, filters, DataTable), create/edit form dialog (contact/company pickers, opportunity picker with quotation picker filtered by the selected opportunity, line items editor), detail sheet (overview/lines/notes/timeline tabs; send/accept/reject/**convert to invoice**/assign/notes)
- Added to the existing tenant sidebar **Billing** group, after Credit Notes
- `estimateService`, `QUERY_KEYS.estimates`, `PERMISSIONS.estimates`
- Notification registry: `estimate.assigned` → `/estimates?estimate={id}`
- Playwright: `e2e/tests/estimates/estimates.workflow.spec.ts` (`npm run test:e2e:estimates`) — enables both `invoices` and `estimates` modules, creates an estimate, sends and accepts it, converts it to an invoice, confirms the conversion dialog, and verifies the resulting invoice + estimate timeline via the API

**Docs**

- [estimates-overview.md](/user-guide/estimates-overview) / [estimates.md](/user-guide/estimates) (+ [developer](/developer-guide/estimates) / [production](/deployment/estimates))
- [api/tenant-v1-estimates.md](/api/tenant-v1-estimates)
- [Module Dependencies](/architecture/module-dependencies) updated — Estimates → Invoices marked shipped
- [Product Roadmap](/getting-started/product-roadmap) — Estimates marked shipped in Phase 3, **completing Phase 3 — Billing** (Invoices, Payments, Credit Notes, Estimates all shipped)

**Deferred**

- Estimate PDF export / e-mail delivery, reversing a conversion (one-way, one-time), multi-currency conversion, approval workflow beyond the status enum

---

## Credit Notes module (2026-07-31)

**Architecture**

- Third Phase 3 (Billing) module — credit notes a tenant issues against its own customer invoices (backend model `CustomerCreditNote`, distinct from Central's own platform-billing `credit_notes` ledger). Flat Laravel, `module:credit-notes` + Spatie RBAC, mirrors the Payments/Invoices notes/timeline/assignee-scope pattern.
- **Hard dependency on Invoices** — same pattern as Payments; Marketplace blocks installing Credit Notes until a workspace already has Invoices entitled. **Free Marketplace opt-in** — catalog category `billing`, `is_default_included=false` / `is_billable=false`, `sort_order=30` (after Payments' `20`).
- Credit Notes introduces a first-class **lines** child table (`customer_credit_note_lines`), like Invoices — `subtotal`/`tax_total`/`total` computed server-side from lines.
- **Issuing** a draft credit note locks its content; **applying** an issued credit note adds its `total` to the linked invoice's `amount_credited` and recalculates `balance_due` via `CustomerInvoice::recalculateBalanceFromAmounts()` — unlike Payments, this does **not** drive the invoice `status`. **Voiding** is only reachable from `draft`/`issued` (before any invoice balance has been touched).

**Backend**

- Tables: `customer_credit_notes`, `customer_credit_note_lines`, `customer_credit_note_notes`, `customer_credit_note_activities`
- Auto-numbered (`CN-00001`, prefix from `credit_notes_number_prefix` tenant setting)
- Status workflow `draft → issued → applied`, with `void` from `draft`/`issued` (`CustomerCreditNoteStatusEnum`); disallowed transitions return a 422 validation error
- Permissions: `credit-notes.view|create|update|delete|restore|force.delete|assign|issue|apply|void`
- Model + factories, controller, form requests, API resources, policy, service, events, `AppServiceProvider`-registered event subscriber (audit + assignment notification)
- Catalog registration + `module_dependencies` row via `DefaultModuleRegistrar` migrations (migrate-only); permissions + default role map additive migrations
- Pest: `tests/Feature/Tenant/CustomerCreditNote/CustomerCreditNoteTest.php`, `tests/Feature/Central/Module/CreditNotesModuleDependencyTest.php`

**Frontend**

- `src/pages/credit-notes/` — list page (KPIs incl. Applied total, filters, DataTable), create/edit form dialog (invoice picker driving default currency/contact/company, line items editor), detail sheet (overview/lines/notes/timeline; issue/apply/void/assign/notes)
- Added to the existing tenant sidebar **Billing** group, after Payments — kept separate from Central Billing nav
- `customerCreditNoteService`, `QUERY_KEYS.customerCreditNotes`, `PERMISSIONS.customerCreditNotes`
- Invoice detail sheet: new "Credit notes" link to `/credit-notes?invoice={id}` when Credit Notes is entitled + `credit-notes.view` is granted
- Notification registry: `customer_credit_note.assigned` → `/credit-notes?credit-note={id}`
- Playwright: `e2e/tests/credit-notes/credit-notes.workflow.spec.ts` (`npm run test:e2e:credit-notes`) — enables both `invoices` and `credit-notes` modules, creates and sends an invoice, creates a credit note against it, issues and applies it, and verifies the invoice's `amount_credited`/`balance_due` via the API

**Docs**

- [credit-notes-overview.md](/user-guide/credit-notes-overview) / [credit-notes.md](/user-guide/credit-notes) (+ [developer](/developer-guide/credit-notes) / [production](/deployment/credit-notes))
- [api/tenant-v1-credit-notes.md](/api/tenant-v1-credit-notes)
- [Module Dependencies](/architecture/module-dependencies) updated — Credit Notes → Invoices marked shipped
- [Product Roadmap](/getting-started/product-roadmap) — Credit Notes marked shipped in Phase 3; Estimates remains Planned
- Invoices/Payments docs updated to reflect that `amount_credited`/`balance_due` are now driven by Credit Notes rather than "still planned"

**Deferred**

- Estimates, refunding an already-applied credit note, credit note PDF export / e-mail delivery, standalone credit notes not tied to an invoice, multi-currency conversion

---

## Payments module (2026-07-31)

**Architecture**

- Second Phase 3 (Billing) module — customer payments a tenant receives from its own customers (backend model `CustomerPayment`, distinct from Central platform-billing Payments ledger). Flat Laravel, `module:payments` + Spatie RBAC, mirrors the Invoices notes/timeline/assignee-scope pattern.
- **Hard dependency on Invoices** — the first Phase 3 module to declare a required `module_dependencies` row; Marketplace blocks installing Payments until a workspace already has Invoices entitled. **Free Marketplace opt-in** — catalog category `billing`, `is_default_included=false` / `is_billable=false`, `sort_order=20` (after Invoices' `10`).
- Payments introduces a first-class **allocations** child table (`customer_payment_allocations`) linking a payment to one or more invoices; allocations are stored on draft payments but only applied to invoice balances once **posted**.
- Posting/voiding a payment drives the previously read-only Invoice balance fields: `amount_paid` / `balance_due` and the `sent → partial|paid` status transition (via `CustomerInvoice::recalculateBalanceFromAmounts()`), closing the gap called out in the Invoices changelog entry above.

**Backend**

- Tables: `customer_payments`, `customer_payment_allocations`, `customer_payment_notes`, `customer_payment_activities`
- Auto-numbered (`PAY-00001`, prefix from `payments_number_prefix` tenant setting)
- Status workflow `draft → posted → void` (`CustomerPaymentStatusEnum`); disallowed transitions return a 422 validation error
- Permissions: `payments.view|create|update|delete|restore|force.delete|assign|post|void`
- Model + factories, controller, form requests, API resources, policy, service, events, `AppServiceProvider`-registered event subscriber (audit + assignment notification)
- Catalog registration + `module_dependencies` row via `DefaultModuleRegistrar` migrations (migrate-only); permissions + default role map additive migrations
- Pest: `tests/Feature/Tenant/CustomerPayment/CustomerPaymentTest.php`, `tests/Feature/Central/Module/PaymentsModuleDependencyTest.php`

**Frontend**

- `src/pages/payments/` — list page (KPIs incl. Posted total, filters, DataTable), create/edit form dialog (amount/method/paid-at/reference, contact/company/assignee pickers, allocations editor against invoices), detail sheet (overview/allocations/notes/timeline tabs; post/void/assign/notes)
- Added to the existing tenant sidebar **Billing** group, after Invoices — kept separate from Central Billing nav
- `customerPaymentService`, `QUERY_KEYS.customerPayments`, `PERMISSIONS.customerPayments` — named distinctly from the pre-existing Central `paymentService` / `PERMISSIONS.payments` (platform subscription billing)
- Invoice detail sheet: new "Related payments" link to `/payments` when Payments is entitled + `payments.view` is granted
- Notification registry: `customer_payment.assigned` → `/payments?payment={id}`
- Playwright: `e2e/tests/payments/payments.workflow.spec.ts` (`npm run test:e2e:payments`) — enables both `invoices` and `payments` modules, creates an invoice, records a payment with an allocation, posts it, verifies the invoice balance/status updates, voids it, and verifies the reversal

**Docs**

- [payments-overview.md](/user-guide/payments-overview) / [payments.md](/user-guide/payments) (+ [developer](/developer-guide/payments) / [production](/deployment/payments))
- [api/tenant-v1-payments.md](/api/tenant-v1-payments)
- [Module Dependencies](/architecture/module-dependencies) updated — Payments → Invoices marked shipped (was backend-only)
- [Product Roadmap](/getting-started/product-roadmap) — Payments marked shipped in Phase 3; Credit Notes/Estimates remain Planned
- Invoices docs updated to reflect that `amount_paid`/`balance_due` are now driven by Payments rather than "reserved for a future module"

**Deferred**

- Credit Notes (`amount_credited`), Estimates, payment receipt PDF export / e-mail delivery, partial refunds of a posted payment, online payment-gateway capture, multi-currency conversion

---

## Invoices module (2026-07-31)

**Architecture**

- First Phase 3 (Billing) module — customer invoices a tenant sends to its own customers (backend model `CustomerInvoice`, distinct from Central platform-billing `Invoice`). Flat Laravel, `module:invoices` + Spatie RBAC, mirrors the Quotations notes/timeline/assignee-scope pattern.
- **No hard dependency** — unlike Quotations/Contracts (which require Opportunities), Invoices has no `module_dependencies` row and installs standalone. **Free Marketplace opt-in** — catalog category `billing` (`category_sort_order=30`), `is_default_included=false` / `is_billable=false`, `sort_order=10`.
- **Soft optional links**: `contact_id` / `company_id` only surfaced/validated when Contacts/Companies is entitled; `quotation_id` is a plain tenant-scoped existence check (not gated by a `LinkableQuotation`-style entitlement rule).
- Balance fields (`amount_paid`, `amount_credited`, `balance_due`) are reserved for the still-planned Payments/Credit Notes modules — read-only via this API today.

**Backend**

- Tables: `customer_invoices`, `customer_invoice_lines`, `customer_invoice_notes`, `customer_invoice_activities`
- Line items (`description`, `quantity`, `unit_price`, `tax_rate`) fully replaced on create/update; `subtotal` / `tax_total` / `total` / `balance_due` computed server-side
- Auto-numbered (`INV-00001`, prefix from `invoices_number_prefix` tenant setting)
- Status workflow `draft → sent → partial|paid → void` (`CustomerInvoiceStatusEnum`); disallowed transitions return a 422 validation error
- Permissions: `invoices.view|create|update|delete|restore|force.delete|assign|send|void`
- Model + factories, controller, form requests, API resources, policy, service, events, `AppServiceProvider`-registered event subscriber (audit + assignment notification)
- Catalog registration via `DefaultModuleRegistrar` migration (migrate-only); permissions + default role map additive migrations
- Pest: `tests/Feature/Tenant/CustomerInvoice/CustomerInvoiceTest.php`

**Frontend**

- `src/pages/invoices/` — list page (KPIs incl. Overdue, filters, DataTable), create/edit form dialog (line items editor, contact/company/assignee pickers), detail sheet (overview/lines/notes/timeline tabs; send/void/assign/notes — no accept)
- New tenant sidebar group **Billing** (after Sales) — kept separate from Central Billing nav
- `customerInvoiceService`, `QUERY_KEYS.customerInvoices`, `PERMISSIONS.customerInvoices` — named distinctly from the pre-existing Central `invoiceService` / `PERMISSIONS.invoices` (platform subscription billing)
- Notification registry: `customer_invoice.assigned` → `/invoices?invoice={id}`
- Playwright: `e2e/tests/invoices/invoices.workflow.spec.ts` (`npm run test:e2e:invoices`) — enable module, create, search, send, void, timeline

**Docs**

- [invoices-overview.md](/user-guide/invoices-overview) / [invoices.md](/user-guide/invoices) (+ [developer](/developer-guide/invoices) / [production](/deployment/invoices))
- [api/tenant-v1-invoices.md](/api/tenant-v1-invoices)
- [Module Dependencies](/architecture/module-dependencies) updated (Invoices → Contacts/Companies/Quotations optional; Payments → Invoices required, backend-only for now)
- [Product Roadmap](/getting-started/product-roadmap) — Invoices marked shipped in Phase 3; Payments/Credit Notes/Estimates remain Planned

**Deferred**

- Payments (posting `amount_paid`, auto `partial`/`paid` transitions), Credit Notes (`amount_credited`), Estimates, invoice PDF export / e-mail delivery, multi-currency conversion

---

## Lead import first note (2026-07-31)

Bulk lead import supports an optional **Note** column. When mapped and non-empty, import creates a first note on new leads (and appends a note when updating duplicates). Empty note cells are skipped. Template, wizard field list, Pest, and Playwright import coverage updated.

## Lead import numeric phone cast (2026-07-31)

Bulk lead import no longer fails with “phone must be a string” when Excel/CSV parsers return phone cells as numbers. `LeadImportMapper` casts string fields before validation.

## Overdue filter for Tasks & ToDos (2026-07-31)

List and board APIs accept `overdue=true` for open items with `due_at` in the past. Tasks and ToDos UIs expose an **Overdue** checkbox; Tasks also toggles the filter from the Overdue KPI card.

## ToDos module (2026-07-31)

**Architecture**

- New personal checklist module (`todos`), separate from Tasks. Default-included, non-billable CRM catalog row (`sort_order` 21, icon `list-todo`).
- Creator-scoped visibility via `ScopesToCreator` — users see only their own to-dos; workspace owner (`superadmin`) can view all.
- Creator-only update/delete (owner may view others’ items but cannot mutate them).

**Backend**

- Table `todos`; model, policy, service, board + CRUD API under `module:todos` + `todos.*`.
- Soft-delete route binding (`withTrashed`) and whitelist for list `sort` / `direction`.
- Local demo: `TodosSeeder` + dataset counts in `config/local-demo.php`.
- Permissions: `view` · `create` · `update` · `delete` (admin/manager/staff).
- Pest: `tests/Feature/Tenant/Todo/TodoTest.php` (CRUD, creator/admin scope, owner view-only, sort safety, soft-delete show, module gate, isolation).

**Frontend**

- Board (default) + list; form dialog + detail sheet; nav gated by `module:todos` + `todos.view`.
- Board drag disabled for non-creators (owner view-only cards).
- Playwright: `npm run test:e2e:todos` (workflow + multi-user visibility).

**Docs / Website**

- User / developer / production / API guides; database + roadmap + this note.
- Marketing `MODULES` entry and included-module copy updated for ToDos (including FAQ cancel copy).

## Marketing catalog currency uses modules.currency (2026-07-31)

Public `GET /api/central/v1/public/modules` now labels paid prices with each module’s **catalog currency** (`modules.currency`, typically USD as in Central Modules). It no longer uses `system_settings.currency` (workspace default), which can be PKR/EUR/etc. and mislabeled catalog USD amounts.

## Marketing site public catalog + stats API (2026-07-31)

- Central public endpoints for the EloSync website homepage:
  - `GET /api/central/v1/public/stats` — live Active Workspaces, Modules Installed, Catalog Modules (+ uptime / platform currency)
  - `GET /api/central/v1/public/modules` — marketplace cards with **Available / In Progress / Planned** and **Included / Free / Paid** tags; paid prices always use the central application currency
- Catalog modules gain `availability` (`available` \| `in_progress` \| `planned`) alongside existing commercial `status` / `is_billable` flags
- SaaS-Website Trust + Module Marketplace sections consume these APIs (`NEXT_PUBLIC_API_URL`); CORS supports `MARKETING_URL`
- Pest: `tests/Feature/Central/Public/PublicPlatformTest.php`

## Rebrand SaleOS → EloSync (2026-07-31)

Product name, docs site, and operator examples are now **EloSync** (`docs.elosync.com`, `*.elosync.com`).

**Breaking:** Custom lead webhook HMAC / API-key headers are renamed — `X-SaleOS-Signature` / `X-SaleOS-Timestamp` / `X-SaleOS-Key` → `X-EloSync-Signature` / `X-EloSync-Timestamp` / `X-EloSync-Key`. Update integrators (Zapier, Make, form plugins). Branded-domain DNS defaults are `_elosync-verification` / `elosync-verify-…` (override with `BRANDED_TXT_PREFIX` if needed).

## Marketplace badges, dependents copy, catalog versioning (2026-07-31)

- Tenant Marketplace cards/detail: badges show **Installed** / **Available** / **Billable** / **Pending** (no longer “Included” for free opt-in modules); category tag above module name; long titles no longer overflow the card.
- Detail sheet separates **Dependencies** (modules this one needs) from **Dependents** (installed modules that block remove).
- List API includes `already_installed`, `purchase_pending`, and `version` per row.
- `DefaultModuleRegistrar` accepts create-time `version` and `bumpVersion($slug, $version)` for idempotent catalog bumps; docs require bumping `modules.version` when a module is meaningfully updated.

## Marketplace display currency conversion (2026-07-31)

Tenant Marketplace list/detail now convert catalog module prices from the catalog currency (typically USD) into the workspace currency for **display only**. Checkout still charges the mapped Stripe/gateway Price in the catalog currency. FX rates come from a cached third-party mid-market feed (`CurrencyConversionService` / `CURRENCY_FX_*`). When rates are unavailable, the UI falls back to catalog currency amounts.

## Sales production readiness (2026-07-31)

- `LinkableQuotation` keeps SoftDeletes (only drops `TenantScope`) so soft-deleted quotations cannot be linked.
- `QuotationPolicy::send` / `accept` mirror view/update assignee scoping.
- Contracts: content updates are **draft-only** (`Contract::isEditable()`); assignment uses dedicated `assign()` (mirrors Quotations).
- SPA: Quotation and Contract list/detail **Edit** actions are draft-only.
- Pest: staff assignee scope for Quotations/Contracts; soft-deleted quotation link rejected; non-draft contract edit rejected; send/accept assignee isolation.
- Docs: API index, entitlements catalog, database schema, tenant free-install list, and Playwright Sales suites synced.

## Sales audit remediations (2026-07-31)

- Quotations: content/`lines` updates are **draft-only** (`Quotation::isEditable()`); assignment stays available via `POST …/assign`.
- Quotations: `POST …/status` requires `quotations.send` for `sent` and `quotations.accept` for `accepted` (other transitions still use `quotations.update`).
- Contracts: `LinkableQuotation` requires the quotation’s opportunity to match the contract’s opportunity.
- SPA: Edit quotation action is draft-only; Playwright RequireAccess coverage extended to Sales routes.
- Docs: API + developer guides updated for the above.

## Quotations & Contracts modules (2026-07-31)

**Architecture**

- Two lean Sales modules on top of Opportunities, mirroring its assignee-scope + notes + timeline patterns. Flat Laravel, `module:quotations` / `module:contracts` + Spatie RBAC. **Free Marketplace opt-in** — catalog category `sales`, `is_default_included=false` / `is_billable=false`; `quotations` `sort_order=50`, `contracts` `sort_order=60`.
- **Hard dependency**: both `quotations` and `contracts` require **Opportunities** — Marketplace install blocks until Opportunities is entitled (`module_dependencies` migration, mirrors Meetings → Calendar).
- **Soft optional dependency**: Contracts may link `quotation_id` only when Quotations is also entitled — validated by `LinkableQuotation` (mirrors `LinkableCompanyForOpportunity`).

**Backend — Quotations**

- Tables: `quotations`, `quotation_lines`, `quotation_notes`, `quotation_activities`
- Line items (`description`, `quantity`, `unit_price`, `tax_rate`) fully replaced on create/update; `subtotal` / `tax_total` / `total` computed server-side
- Status workflow `draft → sent → accepted|rejected|expired` (`QuotationStatusEnum`); disallowed transitions — including re-entering the same status — return a 422 validation error
- Permissions: `quotations.view|create|update|delete|restore|force.delete|assign|send|accept`
- Pest: `tests/Feature/Tenant/Quotation/QuotationTest.php`, `tests/Feature/Central/Module/QuotationsModuleDependencyTest.php`

**Backend — Contracts**

- Tables: `contracts`, `contract_notes`, `contract_activities` (no line items — a contract is a single agreement record)
- Status workflow `draft → active → expired|terminated` (`ContractStatusEnum`); same same-status/invalid-transition guard as Quotations
- Permissions: `contracts.view|create|update|delete|restore|force.delete|assign`
- Pest: `tests/Feature/Tenant/Contract/ContractTest.php`, `tests/Feature/Central/Module/ContractsModuleDependencyTest.php`

**Both modules**

- Model + factory, controller, form requests, API resources, policy, service, events, `AppServiceProvider`-registered event subscriber (audit + assignment notification)
- Catalog registration via `DefaultModuleRegistrar` migration (migrate-only); permissions + default role map additive migrations

**Docs**

- [quotations-overview.md](/user-guide/quotations-overview) / [quotations.md](/user-guide/quotations) (+ [developer](/developer-guide/quotations) / [production](/deployment/quotations))
- [contracts-overview.md](/user-guide/contracts-overview) / [contracts.md](/user-guide/contracts) (+ [developer](/developer-guide/contracts) / [production](/deployment/contracts))
- [api/tenant-v1-quotations.md](/api/tenant-v1-quotations), [api/tenant-v1-contracts.md](/api/tenant-v1-contracts)
- [Module Dependencies](/architecture/module-dependencies) updated (Quotations/Contracts → Opportunities now shipped; Contracts → Quotations optional)

**Deferred**

- Quotation PDF export / e-signature, contract renewal reminders, multi-currency conversion, Opportunity → Quotation → Contract conversion wizard

---

## Opportunities module (2026-07-30)

**Architecture**

- Sales deals module with **pipeline stages + Kanban board inside Opportunities** (Sales Pipeline is not a separate Marketplace SKU). Mirrors Leads board patterns and Activities soft related links. Flat Laravel, `module:opportunities` + Spatie RBAC. **Free Marketplace opt-in** — catalog category `sales`, `is_default_included=false` / `is_billable=false` / `sort_order=40`; tenants enable it manually (only Leads + Tasks auto-install).

**Backend**

- Tables: `opportunity_stages`, `opportunities`, `opportunity_notes`, `opportunity_activities`
- Seeded stages: Prospecting → Qualification → Proposal → Negotiation → Won / Lost
- Soft optional FKs: `contact_id` / `company_id` / `lead_id` (entitlement-validated when set)
- Board / stats / stage change / assign / notes / restore / force delete
- Permissions: `opportunities.view|create|update|delete|restore|force.delete|assign`
- Catalog registration via `DefaultModuleRegistrar` migration (migrate-only)
- Pest: `tests/Feature/Tenant/Opportunity/OpportunityTest.php`

**Frontend**

- SPA mirrors Leads (board default + table, form dialog, detail drawer) — ship with Opportunities nav gated by module + permission

**Docs**

- [opportunities-overview.md](/user-guide/opportunities-overview) (+ user / developer / production)
- [api/tenant-v1-opportunities.md](/api/tenant-v1-opportunities)

**Deferred**

- Separate Sales Pipeline SKU, custom stage admin UI, Lead → Opportunity conversion wizard, realtime board sync, export / import

---

## Quotations & Contracts SPA (2026-07-31)

Tenant Application pages for Quotations and Contracts (list, form with line items for quotes, detail sheets with status actions), Sales nav group, Playwright `test:e2e:quotations` / `test:e2e:contracts`, and notification deep-links for assignment.

## Marketing site Forge CI (2026-07-30)

EloSync marketing repo (`SaaS-Website`) publishes a static Next.js export to `build-artifacts` on each push to `main` (same pattern as SPA/Docs). Forge deploys that branch with activate-only script — no Node on the server. See [Laravel Forge](/deployment/laravel-forge) §4 Marketing.

## Marketing catalog pricing sync (2026-07-30)

EloSync marketing site and docs now mirror Central catalog commercial flags: **Included free** (Leads, Tasks), **Free to install** (other CRM modules), **Paid** Branded at **$29/mo · $290/yr**. Entitlements catalog table corrected (opt-in CRM modules are not default-included).

## Tenant Marketplace remove modules (2026-07-30)

Workspace owners (and anyone with `marketplace.purchase`) can **remove** opt-in modules from Marketplace — Install / Subscribe to add, Remove / Cancel subscription to drop access. Core default-included modules (Leads, Tasks) stay non-removable; hard dependents must be removed first (e.g. Meetings before Calendar). Re-installing a previously cancelled module reactivates the same subscription row.

**Fix (same day):** Cancel eligibility follows catalog `is_default_included` (not historical `source=included`). Data migration marks optional CRM modules opt-in and rewrites their included subscriptions to `purchased` so Remove appears for workspaces that had them pre-opt-in.

- API: `POST /api/tenant/v1/marketplace/modules/{module}/cancel`; detail adds `can_cancel`, `blocking_dependents`, `subscription_source`
- UI: Marketplace module detail sheet Remove / Cancel subscription + confirmation
- Docs: [tenant-v1-marketplace](/api/tenant-v1-marketplace), [entitlements](/developer-guide/entitlements)

## Default module policy (2026-07-30)

New workspaces auto-install **Leads** and **Tasks** only. Contacts, Companies, Activities, Opportunities, Calendar, Meetings, and Communication Templates stay **free** (`is_billable=false`) but **opt-in** (`is_default_included=false`) via Marketplace. Existing workspace subscriptions are not removed.

## Activities module (2026-07-30)

**Architecture**

- CRM engagements module; mirrors Contacts/Companies (flat Laravel, `module:activities` + Spatie RBAC). **Free Marketplace opt-in** — catalog `is_default_included=false` / `is_billable=false` / `sort_order=28`; tenants enable it manually (only Leads + Tasks auto-install).

**Backend**

- Tables: `activities`, `activity_notes`, `activity_activities`
- Types: `call` | `email` | `note` | `follow_up` | `other`; complete via `POST /activities/{id}/complete`
- Related FKs: `contact_id` / `company_id` / `lead_id` (at least one required; soft module entitlement)
- Mirrors `crm_activity_logged` / `crm_activity_completed` onto related Contact/Company/Lead timelines
- Permissions: `activities.view|create|update|delete|restore|force.delete|assign|complete` (staff defaults include `view` + `complete`, mirroring Tasks)
- Pest: `tests/Feature/Tenant/Activity/ActivityTest.php` (16 tests)

**Frontend**

- Activities list / form dialog / detail drawer (Overview, Notes, Activity tabs); nav after Meetings
- Tenant dashboard: **Recent Activities** widget + **Log Activity** quick action
- Playwright: `npm run test:e2e:activities` (`e2e/tests/activities/`)

**Docs**

- [activities-overview.md](/user-guide/activities-overview) (+ user / developer / production)
- [api/tenant-v1-activities.md](/api/tenant-v1-activities)

**Deferred**

- Calendar projection, Meetings types, unified system-timeline aggregator, Communication Template placeholders

---

## Companies module (2026-07-30)

**Architecture**

- CRM organizations module; mirrors Contacts/Leads/Tasks (flat Laravel, `module:companies` + Spatie RBAC). **Free Marketplace opt-in** — catalog `is_default_included=false` / `is_billable=false` / `sort_order=12`; tenants enable it manually (only Leads + Tasks auto-install).

**Backend**

- Tables: `companies`, `company_notes`, `company_activities`; `contacts.company_id` FK
- `CompanyService`, events/subscriber (audit + assignment mail), tenant API routes
- Permissions: `companies.view|create|update|delete|restore|force.delete|assign`
- Contact writes sync legacy `company` string from linked Company name when `company_id` is set; resources expose `linked_company`
- Communication Templates placeholder provider for Companies
- Pest: `tests/Feature/Tenant/Company/CompanyTest.php`

**Frontend**

- Companies list / form dialog / detail drawer (Overview, Notes, Activity tabs); nav gated by module + permission, positioned between Leads and Contacts
- Tenant dashboard: **Recent Companies** widget + **Create Company** quick action (gated by `module:companies` + `companies.view`/`companies.create`)
- Contact form company picker when Companies is entitled; list/detail prefer linked company name over legacy string
- Playwright: `npm run test:e2e:companies` (`e2e/tests/companies/`)

**Docs**

- [companies-overview.md](/user-guide/companies-overview) (+ user / developer / production)
- [api/tenant-v1-companies.md](/api/tenant-v1-companies)

**Deferred**

- Lead convert-to-Company, legacy company-string backfill job, Meta invent Companies

---

## Contacts module (2026-07-30)

**Architecture**

- Third product module; mirrors Leads/Tasks (flat Laravel, `module:contacts` + Spatie RBAC). **Free Marketplace opt-in** — catalog `is_default_included=false` / `is_billable=false`; tenants enable it manually (only Leads + Tasks auto-install).

**Backend**

- Tables: `contacts`, `contact_notes`, `contact_activities`; `leads.contact_id` FK
- `ContactService`, events/subscriber (audit + assignment mail), tenant API routes
- Permissions: `contacts.view|create|update|delete|restore|force.delete|assign`
- `LeadService::convert()` creates/links a real Contact when `contacts` is entitled (`conversion_meta.stub = false`); otherwise conversion stays the earlier status-only placeholder
- Convert hardening: transactional + row lock; requires `contacts.create`; preserves lead assignee; `LeadPolicy::convert` matches assignee scope; stub converts can complete once Contacts is installed; assignee eligibility mirrors Leads
- Communication Templates placeholder provider for Contacts
- Pest: `tests/Feature/Tenant/Contact/ContactTest.php` (+ convert authz/backfill cases in LeadTest)

**Frontend**

- Contacts list / form dialog / detail drawer (Overview, Notes, Activity tabs); nav gated by module + permission, positioned between Leads and Tasks
- Tenant dashboard: **Recent Contacts** widget + **Create Contact** quick action (gated by `module:contacts` + `contacts.view`/`contacts.create`); dashboard cache invalidated after contact save / lead convert
- Lead detail drawer shows a **View contact** link after a lead converts to a real contact
- Playwright: `npm run test:e2e:contacts` (`e2e/tests/contacts/`)

**Docs**

- [contacts-overview.md](/user-guide/contacts-overview) (+ user / developer / production)
- [api/tenant-v1-contacts.md](/api/tenant-v1-contacts)

---

## Meeting completion (2026-07-29)

Meetings can be **marked completed** (detail action) or **auto-completed** after `ends_at` via `meetings:auto-complete` (every 5 minutes). Status is now `scheduled` | `completed` | `cancelled`. Completing cancels pending reminders, keeps the Calendar historical event as `scheduled`, and does not delete remote Zoom/Google links. List filter **Past** is replaced by **Completed**. API: `POST /meetings/{id}/complete` (`meetings.update`). Migration adds `completed_at` and backfills already-ended scheduled meetings.

---

## Lead & task restore / force delete (2026-07-28)

Leads and Tasks support trash filtering plus **Restore** and **Delete permanently**. Soft delete is unchanged. Restore is granted to workspace **admin** (and owner); force delete is owner-only by default (`leads.force.delete` / `tasks.force.delete`) and can be assigned on Roles. API: `POST …/restore`, `DELETE …/force`.

---

## Latest note & follow-up previews on Leads/Tasks lists (2026-07-28)

Lead and task **table** and **board** views now show the latest note (and, for leads, the next pending follow-up). Hover the truncated preview to read the full note or follow-up details. List/board API payloads include `latest_note` and (leads) `next_follow_up`.

---

## Meetings create form crash after visiting Settings (2026-07-28)

Fixed an intermittent SPA “Something went wrong” error when opening New Meeting after Settings (or any page that filled the shared tenant-settings React Query cache). The meeting form unwrapped that cache to a bare array and called `.find`, while Settings stored the API envelope — so `.find` ran on an object. Meetings now uses a shared `useTenantSettingsQuery` helper with the same envelope shape (and a defensive normalizer).

---

## Meeting list vs edit timezone mismatch (2026-07-28)

Meetings (and Calendar list columns) now format start/end times with an explicit timezone: workspace Settings when loaded, otherwise the meeting/event `timezone` saved on the record. This fixes the case where the edit form showed the correct Asia/Karachi wall clock (e.g. 4:00 PM) while the list still showed the UTC clock (e.g. 11:00 AM) after a Central settings fallback. Tenant settings bootstrap also refuses to adopt Central’s timezone for an authenticated workspace shell.

---

## Workspace timezone meeting/calendar times (2026-07-28)

Scheduled datetimes (meetings, calendar, task due dates, lead follow-ups) no longer shift when the workspace timezone is not UTC. Eloquent stores those fields as UTC instants (`UtcDateTime` cast); the SPA continues to display and edit them in the workspace timezone from Settings. Meeting create/edit uses the workspace timezone (read-only on the form) instead of a separate picker that did not drive conversion. Meetings/Calendar list UIs now re-render when the workspace timezone loads or changes so times do not stick on UTC after Settings bootstrap.

---

## Web Push Profile false "not supported" (2026-07-27)

Profile Desktop notifications no longer sticks on “This browser does not support Web Push” when notification permission is already granted but no service worker is registered. Status lookup uses `getRegistration()` instead of hanging on `serviceWorker.ready`.

---

## Desktop notification prompt — dismiss once forever (2026-07-27)

The post-login “Enable desktop notifications?” dialog no longer reappears on every login after “Not now”. Dismissal is stored in `localStorage` for that browser; users can still enable later from Profile or the Notification Center.

---

## Meetings host filter crash after visiting Leads/Tasks (2026-07-27)

Fixed an intermittent SPA “Something went wrong” error on Meetings. The Meetings pages unwrapped the shared users React Query cache to a bare array while Leads/Tasks stored the API envelope, so navigating Leads → Meetings called `.map` on an object. Meetings now uses a shared `useWorkspaceUsersQuery` helper with the same envelope shape (and a defensive normalizer).

---

## Password show/hide on all secret fields (2026-07-26)

All password and secret inputs in the SPA now use the shared `PasswordInput` control with an eye toggle (show/hide), including profile, users, tenants, mail settings, payment gateway credentials, and meeting integrations. Auth screens already had this pattern.

---

## Meta App Setup operator guide (2026-07-25)

Docs-only: added [Meta App Setup](/developer-guide/meta-app-setup) — create Meta Developer App (Marketing API use case), App Domains, Lead Ads permissions, OAuth vs webhook URLs, Central `META_LEAD_ADS_*` / integrations API, tenant Connect Meta, production gates, and troubleshooting. Linked from Meta Lead Ads, Leads deployment, installation, user overview, Tenant Leads API, and Developer Guide index.

---

## Platform domain auto-generated on signup / Central create (2026-07-25)

Central tenant create/update and public workspace registration no longer accept a domain field. The platform hostname is always `{slug}.{PLATFORM_DOMAIN_SUFFIXES}` (company name spaces/special characters → hyphens via slug). Custom domains stay Branded self-service (Settings → Domain after purchase). SPA register + Central tenant form hide the domain input; Pest/e2e updated.

---

## Backend `.env.example` production template (2026-07-25)

Backend `.env.example` is production-shaped: `https://api.example.com`, `https://app.example.com`, `reverb.example.com` (443/https), Redis cache/queue required with Reverb, S3 disk, secure session cookies, minimal comments. Secrets stay empty placeholders — never commit real keys. Local install docs override to Herd/`localhost`.

---

## Laravel Forge production deployment guide (2026-07-25)

Docs-only: production-friendly [Laravel Forge Deployment](/deployment/laravel-forge) covering three Forge sites (API / SPA / Docs), production `.env`, deploy scripts, scheduler, queue + Reverb daemons, email, deploy order, and troubleshooting. Installation page, Deployment index, Production Runbook, and Frontend build-artifacts docs now point operators at Forge first for go-live.

---

## Installation guide — local configuration plan (2026-07-25)

Docs-only: new [Installation & Local Configuration](/getting-started/installation) page covering backend (Herd, `.env`, migrate/seed), frontend Vite/`VITE_*`, VitePress docs, Reverb + Echo alignment, email (log/SMTP/Settings), queues/scheduler/Web Push, optional Stripe/storage, terminal layout, and a verify checklist — with pointers to production runbooks.

---

## Lead ingest — Custom Webhook + Meta Lead Ads (2026-07-24)

Inbound lead capture through the Lead Source Driver pipeline:

- Shared `NormalizedLeadData` → `LeadDuplicateService` → `LeadService` (no driver DB writes)
- **Custom webhooks** per tenant: URL + API key / HMAC (`X-EloSync-Timestamp` + signature), editable `default_source`
- **Meta Lead Ads**: OAuth connect, **Page picker UI**, Page subscribe, shared `/webhooks/leads/meta`, queue `lead-ingest`
- Leads UI → **Integrations** panel; permission `leads.manage_integrations`
- Production hardening: module entitlement on ingress, body size limits, per-endpoint throttle, Graph timeouts, auth-only `needs_reauth`, force-delete page reclaim
- Docs: Lead Source Driver Architecture (implemented), Custom Lead Webhook, Meta Lead Ads (shipped)
- Pre-merge hardening: `guzzlehttp/guzzle` → 7.15.1; SPA `postcss` + `react-router` → 8.3.0 (high audit clear); Pest expectations updated for `meetings` / `branded` and platform subdomain domains; Larastan typing cleared (lead ingest + meetings/CRM)

---

## Branded Domain settings UX (2026-07-24)

Settings → **Domain** uses a guided three-step flow (enter address → copy-friendly DNS cards → check connection) instead of raw DNS admin rows, aimed at non-technical workspace admins.

---

## Branded module — custom domains + notification chrome (2026-07-24)

Billable marketplace module `branded` (not default-included) for custom domain mapping and white-label email / web push.

- Tenant self-service **Settings → Domain**: propose hostname (ccTLDs like `myai.com.pk` / `app.domain.co.uk` supported), DNS/IP instructions, verify ownership
- Host resolution ignores unverified or non-entitled custom domains (IP pointing alone cannot hijack a workspace)
- Central / registration auto-generate platform subdomains from slug (no client domain field)
- When branded is active: tenant logo / app name in mail chrome and web push icon/title prefix
- Cancel/deactivate branded clears custom-domain verification
- Production hardening: force-delete on remove/expire (unique reclaim), verify fails closed without `BRANDED_SERVER_IPV4`/`CNAME`, CORS allowlist for verified custom Origins, hourly stale-claim purge
- Pest + Playwright `test:e2e:branded`; docs: user / developer / deployment / API

---

## Daily CRM summary emails (2026-07-23)

At **Daily Reminder Time** (`task_reminder_time`, default `09:00` local), each workspace sends a mail-only CRM snapshot in addition to the existing task due digest.

- Personal summary: open leads by stage (excludes Won/Lost), open tasks by status (excludes completed/cancelled), scheduled meetings (excludes cancelled; host/attendee distinct)
- Users flagged **Receive all-users daily summary** (`receive_all_users_daily_summary`) get a user-wise team email (active users only) instead of a personal summary
- Durable delivery ledger `daily_summary_deliveries` (`personal` / `team`) with stale-queued reclaim (45m) and max 5 attempts
- Aggregations run once per tenant per tick (SQL meeting distinct counts)
- Settings label **Daily Reminder Time**; user create/edit checkbox; Playwright flag toggle
- Tests: Pest `DailyCrmSummaryNotificationTest`, `TenantUserDailySummaryFlagTest`
- Production report: [Daily CRM summary](/deployment/daily-crm-summary)

---

## Tenant session timeout setting (2026-07-23)

Each workspace can set its own session idle/token lifetime, including **never timeout**.

- Tenant Settings → **Security**: `session_lifetime_minutes` (`0` = keep users signed in until they sign out)
- Falls back to Central `session_lifetime_minutes` when unset
- Sanctum tenant tokens use the workspace value (`expires_at` null when `0`); SPA idle logout is skipped when `0`
- Password policy remains Central-only
- Tests: Pest tenant settings + remember-me TTL; Vitest `session-timeout`
- Docs: tenant settings user/developer guides

---

## Lead assignee exclusion (2026-07-22)

Workspace owners and users flagged **Exclude from lead assignment** no longer receive leads via import auto-distribute, bulk equal distribute, or manual assignee pickers.

- Backend: `users.exclude_from_lead_auto_assign`, `User::eligibleLeadAssignees`, `EligibleLeadAssignee` validation on assign/create/update/bulk/import
- Frontend: checkbox on tenant user create/edit; assignee pickers filter ineligible users (keeps current assignee so they can be cleared)
- Docs: User Guide Leads + Tenant RBAC, developer Leads notes, tenant leads API

## Expired session redirects to login (2026-07-22)

Expired or revoked tenant sessions no longer leave the SPA on protected pages toasting **Workspace context is required.**

- Backend: `InitializeTenancy` returns **401 Unauthenticated** when a Bearer token is present but cannot resolve a workspace (pruned/revoked/unknown tokens); anonymous requests without context still return `400 workspace_required`
- Frontend: axios treats `401` and any non-`skipAuth` `400 workspace_required` (with or without a Bearer — covers the idle token-clear race) as session expiry — clears the token and hard-redirects to login without toasting; concurrent errors while redirecting are also suppressed
- Idle timeout hard-redirects immediately, then best-effort logout
- Tests: Pest `TokenExpirationTest`; Vitest `src/api/axios.test.ts`
- Docs: [authentication developer](/developer-guide/authentication), [authentication user guide](/user-guide/authentication)

---

## Meetings module (2026-07-22)

Workspace Meetings marketplace module (CRM, default-included) with Calendar projection, **per-tenant** Zoom/Google Meet OAuth credentials + account connect, and one multi-channel reminder.

- Deploy: create migration is production-safe against a leftover pre-redesign `meetings` table — replaces Meetings-related tables only (preserves other production data), purges `calendar_events` with `source_type=meeting`, then creates the current schema
- Backend: meetings/attendees/reminders/provider connections; permissions (`view`/`create`/`update`/`delete`/`view_all`/`assign_host`/`manage_integrations`); tenant API; migrate-only catalog registration + required Meetings → Calendar dependency
- Providers: each workspace stores its own Zoom/Google OAuth client ID/secret (encrypted); connects a workspace account; manual join URL when provider is `none`; OAuth token refresh; bounded retry job with explicit tenant init; OAuth one-time nonce
- Cancel/delete: remote Zoom/Google delete is best-effort so missing scopes cannot block local cancel; Zoom authorize requests write/read/delete scopes
- Reminders: atomic `pending`→`sending` claim; external guest mail dedupe; `crm:send-due-notifications` delivers in-app + web push + email
- Frontend: Meetings list/form/detail/integrations; provider options gated until connected; cancel confirm; retry sync; Calendar projections open in Meetings (read-only on Calendar)
- Docs: user/developer/deployment/API; webhooks documented as stub until native provider verify
- Pest: `tests/Feature/Tenant/Meeting/*`

---

## Tenant branding bootstrap consistency (2026-07-21)

SPA branding no longer flickers through placeholder product names or stick on Central after soft login.

- Static shell / tab-title fallback standardized on **EloSync** (`index.html`, settings-store defaults, `VITE_APP_NAME`)
- Sidebar and auth layout show empty brand text until public settings are loaded (no `DC SaaS` placeholder)
- Settings re-bootstrap after auth settles so tenant `public/settings` can resolve via Bearer token and optional `X-Tenant-Domain`
- Central fallback on tenant routes only applies on first load — does not overwrite branding after login or settings save
- Unit coverage: `src/store/settings-store.test.ts`
- Docs: [tenant-settings developer](/developer-guide/tenant-settings), [tenant-settings overview](/user-guide/tenant-settings-overview)

---

## Daily task digest emails (2026-07-21)

Due/overdue task alerts no longer email once per task.

- In-app: one `task.due_today` / `task.overdue` database notification per task (unchanged click-through to `/tasks?task={id}`)
- Email: one consolidated daily digest per assignee with task links and a View my tasks CTA
- Workspace setting **Daily task reminder time** (`task_reminder_time`, default `09:00`) in tenant timezone
- Durable delivery ledger `task_digest_deliveries` (queued/sent/failed + retry) so cache flush cannot duplicate and queue failures can retry
- Scheduler: `crm:send-due-notifications` every 5 minutes with `onOneServer` (lead follow-up due emails unchanged)

---

## Calendar module v1 (2026-07-21)

Personal Calendar marketplace module (CRM, default-included).

- Backend: `calendar_events`, permissions (`view`/`create`/`update`/`delete`/`view_all`), tenant API, migrate-only catalog registration
- Frontend: **Week** (default) + **Day** time grids with drag-and-drop reschedule, Month + Agenda, create/edit/cancel/delete, upcoming dashboard widget
- Workspace timezone-aware display/edit; overlapping events laid out side-by-side on Week/Day
- Visibility: staff sees own events; Owner/Admin/Manager with `view_all` see all — **no calendar assignment**
- Platform audit via `CalendarEventSubscriber` (create/update/cancel/delete), mirroring Leads/Tasks
- Docs: user/developer/deployment/API; Pest incl. deploy-migration + audit coverage; Playwright `test:e2e:calendar`
- Meetings / Zoom / Google Meet later projected onto Calendar (shipped 2026-07-22)

---

## WhatsApp Cloud Integration roadmap (2026-07-20)

Documentation-only: official architectural blueprint for a future WhatsApp Cloud API communication platform.

- Added [WhatsApp Cloud Integration](/developer-guide/whatsapp-cloud-integration) under **Future Integrations** (current `wa.me` state vs Cloud API vision, messaging driver architecture, OAuth, multi-tenant WABA/phone ownership, conversations, templates, security, automation, Meta Lead Ads complementarity)
- Cross-linked with [Lead Source Driver Architecture](/developer-guide/lead-source-driver-architecture) and [Meta Lead Ads Integration](/developer-guide/meta-lead-ads-integration)
- Sidebar / Developer Guide index / Product Roadmap updated
- No backend or frontend application code changes

---

## Lead Source Driver Architecture (2026-07-20)

Documentation-only: architectural decision for all future lead ingestion in EloSync.

- Added [Lead Source Driver Architecture](/developer-guide/lead-source-driver-architecture) (`LeadSourceDriverInterface` responsibilities, shared pipeline, `NormalizedLeadData`, driver vs Lead ownership, driver catalog, Open/Closed extensibility)
- Updated [Meta Lead Ads Integration](/developer-guide/meta-lead-ads-integration): `MetaLeadAdsDriver` is the first production implementation of the architecture
- Sidebar / Developer Guide index: Future Integrations cross-links both pages
- Product Roadmap: Phase 1 Planned entry for Lead Source Driver Architecture
- No backend or frontend application code changes

---

## Meta Lead Ads Integration roadmap (2026-07-20)

Documentation-only: official implementation blueprint for a future Meta Lead Ads → Leads integration.

- Added [Meta Lead Ads Integration](/developer-guide/meta-lead-ads-integration) under **Future Integrations** (architecture, OAuth, multi-tenant Page ID resolution, field mapping, `LeadDuplicateService` + `LeadService` gates, security, Meta permissions, error handling, future enhancements)
- Sidebar: Developer Guide → Future Integrations → Meta Lead Ads
- Product Roadmap: Phase 1 Planned entry linking to the blueprint
- No backend or frontend application code changes

---

## Fix: persist Open/Click webhook event settings (2026-07-19)

- Fixed settings save treating `mail_webhook_events` list arrays as `{value:…}` wrappers (Open/Click were stored as null and UI checkboxes cleared after save)
- Default webhook events now include `opened` and `clicked`
- Open webhooks update email log status once events are persisted

## Email open/click tracking on email logs (2026-07-19)

- Open and Click webhooks now set email log status to `opened` / `clicked` (counts also stored in `meta.opens` / `meta.clicks`)
- Email Logs UI shows Opened/Clicked statuses plus open/click counts in the detail panel
- Mail settings no longer wipe Open/Click checkboxes after save/reload
- Postmark setup instructions note that Open tracking and Link tracking must be enabled in Postmark (settings save does not sync the provider UI)

## Email webhooks, body logging, and resend (2026-07-19)

- Provider delivery webhooks for Postmark / Mailgun: `POST /webhooks/email/{provider}` (Central) and `…/{provider}/{tenant}` (Tenant custom mail)
- Configurable event multiselect (`mail_webhook_events`) + signing secret in Central/Tenant Mail settings; `meta.mail_webhook` on settings GET
- Full message body capture (`body_html` / `body_text`) on email logs by default (`EMAIL_LOGS_STORE_BODY=true`) for audit/proof
- One-click resend from email log detail (`email-logs.resend`, `POST …/email-logs/{uuid}/resend`)
- Docs: [Email webhooks](/developer-guide/email-webhooks), updated [Multi-Provider Email](/developer-guide/multi-provider-email)

## v1.1.0 — Platform Stabilization (prepared 2026-07-19)

First official coordinated platform tag. Official record: [v1.1.0](/changelog/v1.1.0).

Git tag: **`v1.1.0`** (clean SemVer — **create only after CI is green on all three repos**). No `-platform` suffix.

Highlights:

- Multi-provider email (SMTP / Postmark / Mailgun) + logs + queue isolation
- Production hardening (migrate-only modules/RBAC, auth≠RBAC, go-live runbooks)
- Notifications + Communication Templates on the frozen foundation
- Larastan level 5 at zero errors; standardized PR Quality Gates (Backend / Frontend / Docs)
- [Documentation Governance](/developer-guide/documentation-governance) — same-PR rule for code + tests + docs
- [Release Process](/deployment/release-process) with branch-protection checklist for admins

Package versions: Frontend & Docs `1.1.0`; Backend tag-only. Legacy docs alias: [v1.1.0-platform](/changelog/v1.1.0-platform).

---

## Multi-Provider Email Delivery — production hardening (2026-07-19)

Production-readiness fixes on top of the multi-provider email implementation:

- Runtime isolation: `EmailManager` clears prior SMTP/Postmark/Mailgun secrets on every apply; queue middleware clears secrets after each mail job
- Central HTTP middleware `central.mail` re-applies Central mail on every Central request
- Tenant system-mode test mail inherits Central; test-mail restores prior runtime config in `finally`
- Provider-conditional save validation; additive `email-logs.*` permission migration; unsupported webhook capabilities no longer advertised
- Upgrade/runbook notes for migrate, `email:migrate-tenant-mail-modes`, composer packages, `queue:restart`

## Multi-Provider Email Delivery implementation (2026-07-19)

Platform infrastructure: provider-agnostic email delivery for Central and Tenant.

- `EmailManager` + driver registry (SMTP, Postmark, Mailgun, log/array/sendmail) with Laravel mailer overlay + `Mail::forgetMailers()`
- Central/Tenant settings: `mail_provider`, encrypted API secrets, `mail_mode` (system|custom), reply-to, timeout
- Queue middleware `ApplyEmailRuntimeConfig` re-applies tenant/central mail config on the `emails` worker
- Structured test-mail responses (draft settings supported); email logs API + UI + weekly prune
- Artisan `email:migrate-tenant-mail-modes` backfills tenant modes from legacy `mail_host`
- Future stubs: webhook capability interface, resend/analytics services, failover config keys
- Developer guide: [Multi-Provider Email](/developer-guide/multi-provider-email)

---

## Multi-Provider Email Delivery roadmap (2026-07-19)

Documentation-only: product roadmap for provider-agnostic email delivery (Central + Tenant).

- Updated [Product Roadmap](/getting-started/product-roadmap): **Multi-Provider Email Delivery** section (`EmailManager` / driver abstraction, Central + tenant providers, logs, queue/retry, optional provider capabilities, analytics, test email, enterprise routing)
- Distinguishes **Planned**, **Future**, and **Enterprise** capabilities; SMTP remains one interchangeable driver
- No application code, schema, API, or settings implementation changes

---

## Clean URL static fallbacks (2026-07-18)

Deep links work on default Forge/Nginx without per-server `$uri.html` rewrites.

- Post-build script `scripts/ensure-clean-url-indexes.mjs` copies each VitePress page to a directory `index.html` so `/path/to/page` resolves via standard `try_files $uri $uri/`
- Wired into `npm run docs:build` (CI publish included)

---

## Modular architecture convention (2026-07-18)

Documentation-only pass establishing the long-term modular architecture standard for all future modules.

- Added [Architecture](/architecture/) section: [Module Architecture](/architecture/module-architecture), [Module Dependencies](/architecture/module-dependencies), [Module Licensing](/architecture/module-licensing)
- Updated [Product Roadmap](/getting-started/product-roadmap): Calendar, Meetings (scheduling, Zoom, Google Meet, email reminders), AI Integration (Planning)
- Documented development convention: self-contained modules, declared dependencies, independent licensing compatibility
- Updated site footer copyright to © 2026 EloSync. All rights reserved.
- No application code, billing, marketplace, schema, or API changes

---

## Documentation sync — migrate-only modules & auth/RBAC separation (2026-07-18)

Docs pass aligning architecture, deployment, RBAC, provisioning, entitlements, database, API, and Communication Templates guides with the final production architecture.

- Production deploy is migration-driven (`migrate --force` + `optimize`); no catalog/permission reseeding
- Authentication has no authorization side effects; workspace RBAC is provisioned explicitly
- Communication Templates documented as a reusable platform module (placeholders, render/preview, WhatsApp)
- Future modules follow the data-migration registration pattern

---

## Authentication / authorization separation (2026-07-18)

Keep login and authenticated requests free of RBAC side effects.

- `TenantAuthorizationProvisioningService` provisions workspace roles during workspace create
- `TenantAuthBootstrapService` only creates owners and issues tokens
- Dashboard, role listing, and user listing no longer repair permissions
- Legacy shared-role isolation remains an explicit `tenants:isolate-roles` maintenance command
- Existing workspaces still receive new permissions through additive data migrations

---

## Communication Templates production deploy hardening (2026-07-17)

Eliminate production `db:seed` for Communication Templates.

- Data migrations register the catalog module and grant permissions additively during `php artisan migrate`
- `DefaultModuleRegistrar` installs the module only for workspaces missing a subscription row (never reactivates cancelled/suspended)
- `TenantPermissionSynchronizer` creates missing permission vocabulary and grants only new permissions without resetting customized roles
- Authentication and dashboard requests no longer mutate roles or permissions
- `TenantAuthorizationProvisioningService` creates default RBAC during workspace provisioning; deploy migrations add future permissions
- CatalogSeeder remains insert-only for fresh/local environments

---

## Communication Templates module (MVP) (2026-07-17)

Catalog module for reusable plain-text templates with a placeholder registry and WhatsApp Web (`wa.me`) from Leads.

- Backend: `communication_templates` table, CRUD + preview/render APIs, Lead/shared placeholder providers, UUID route binding, permissions (`view|create|update|delete|use`), platform audit
- Frontend: Templates admin page with chip inserter, Lead detail WhatsApp picker, module-gated nav
- Docs: developer / user / API / deployment guides; E2E `test:e2e:communication-templates`
- Default-included with Leads and Tasks for new workspaces

---

## In-app notifications production hardening (2026-07-16)

Release hardening for the frozen notification stack (no architecture changes).

- Backend: after-commit queueing, broadcast-after-persist guard, reassignment dedupe keys, Reverb origin pinning
- Frontend: Forge `window.env` Reverb config, Echo reconnect + poll-only-when-disconnected, dead-code cleanup
- Docs: [Notification System deployment runbook](/deployment/notifications), contract/API/runbook links, production checklist + troubleshooting

---

## In-app notifications production stack (2026-07-16)

Phased delivery of the frozen notification architecture (payload v1 → digests → Reverb/Echo → registry → browser → prune).

- Backend: schema_version envelope, route descriptors, NotificationBatch + lead digests, Reverb private channels, `notifications:prune`, unread indexes
- Frontend: Laravel Echo, modular `src/notifications` registry, optimistic bell UX, Web Notification API manager
- Docs: [notification-architecture-contract.md](/developer-guide/notification-architecture-contract), API + roadmap updated
- Lead assigned: database + broadcast only (mail deferred); bulk/import → one digest per assignee

---

## Notification architecture contract frozen (2026-07-16)

In-app notification contracts are frozen before phased implementation (payload v1, route descriptors, NotificationBatch, Reverb/Echo, modular registry).

- Docs: [notification-architecture-contract.md](/developer-guide/notification-architecture-contract)
- Linked from module development standard and tenant notifications API
- No application code in this change; implementation follows Phases 1–8

---

## Branding disk split (local logos/favicons) (2026-07-16)

Logo and favicon can use a dedicated disk while other uploads stay on S3.

- Env: `FILESYSTEM_BRANDING_DISK` (defaults to uploads / `FILESYSTEM_DISK`)
- Production split: `FILESYSTEM_DISK=s3` + `FILESYSTEM_BRANDING_DISK=public` + `php artisan storage:link`
- `FileUploadService` branding helpers; central/tenant branding + workspace logos use the branding disk
- Docs: `developer-guide/object-storage.md`; settings production checklists updated

---

## Lead Import (reusable Import framework) (2026-07-16)

Bulk CSV/XLSX lead import with a reusable framework for future modules.

- Permission: `leads.import` (admin/manager; mirrors export)
- Package: Maatwebsite Laravel Excel; queue: `ProcessLeadImportJob` on `imports`
- API: template, upload, mapping, options, preview, run, history, original/failed/error downloads
- SPA: 5-step wizard + import history beside Export; polls queued progress
- Duplicate modes: skip / update (needs `leads.update`) / keep; unique fields email and/or phone
- Single migration `lead_imports`; row failures as downloadable CSVs (no per-row tables)
- Writes via `LeadService::create()` / `update()`; audit `lead_import_completed` / `lead_import_failed`
- Tests: `LeadImportTest`; Playwright `leads.import.spec.ts`
- Docs: user/developer/API/deployment guides updated (import no longer deferred)

---

## Tenant manual member email verification (2026-07-16)

Workspace owners and admins can help members who never receive the verification email.

- Permission: `users.verify` (owner + admin role map)
- API: `POST /api/tenant/v1/users/{user}/verify-email`, `POST /api/tenant/v1/users/{user}/resend-verification`
- SPA Users row menu: **Resend verification** / **Mark as verified**
- Audit: `tenant_user_email_verified`, `tenant_user_verification_resent`
- Tests: `TenantUserVerifyEmailTest`; Playwright tenant RBAC covers mark-as-verified

---

## Dedicated emails queue (2026-07-15)

All `ShouldQueue` notifications dispatch to the named `emails` queue via `QueuesOnEmails`.

- Worker: `php artisan queue:work --queue=emails --sleep=1 --tries=3 --max-time=3600`
- Optional standby: `--queue=default` for future non-mail jobs
- Docs: production runbook, module-development-developer, backend README Queue Setup

---

## SPA runtime config (multi-client / Forge) (2026-07-15)

Frontend API origin is runtime via Forge-generated `/config.js` (`window.env`), not baked into CI.

- Deploy script sources site `.env` and writes `VITE_API_URL` / `VITE_APP_NAME` / `VITE_API_MODE`
- Same `build-artifacts` artifact for every client; each Forge site owns its `.env`
- No committed `config.js` / `config.example.js` in the SPA repo
- Docs: `architecture/frontend-build-artifacts.md`, production runbook

---

## Frontend production CI/CD (build-artifacts) (2026-07-15)

Automated SPA production builds on merge to `main` without committing `dist/` to source.

- GitHub Actions workflow `frontend-build.yml`: lint, typecheck, Vite production build, validation, secret scan
- Uploads GitHub Actions artifact `frontend-build` (30-day retention)
- Publishes deployment-ready assets to the `build-artifacts` branch with `build-info.json` provenance
- Docs: `architecture/frontend-build-artifacts.md`; production runbook SPA section updated

---

## Object storage migration (Wasabi / S3) (2026-07-15)

All user uploads go through Laravel Storage via `FileUploadService`. Production uses `FILESYSTEM_DISK=s3` (Wasabi or any S3-compatible provider); local uses `FILESYSTEM_DISK=public`.

- `league/flysystem-aws-s3-v3` + full `AWS_*` env (`ENDPOINT` / `URL` for Wasabi)
- Central/tenant branding and admin tenant logos use `FileUploadService` (unique filenames, relative keys, disk-agnostic URLs)
- Tenancy filesystem bootstrapper no longer remaps the shared `public`/uploads disk (prefix isolation via `tenants/{uuid}/…`)
- Artisan `storage:migrate-to-s3` copies existing local objects idempotently
- Docs: `architecture/object-storage.md`; settings production guides updated

---

## Go-live hardening (2026-07-15)

Production readiness audit for Central + Tenant with Leads & Tasks. Billing and security fixes only — no architecture redesign.

**Critical / High**

- Module cancel now calls Stripe/Creem `cancelSubscription` before local entitlement revoke (prevents silent continued charging)
- Failed webhook logs are reclaimed on provider retry (no permanent swallow after a transient 500)
- Recurring `invoice.payment_succeeded` creates a renewal invoice/payment when the provider transaction id is new
- Cashier `/stripe/webhook` handles `invoice.payment_failed`
- Email verification asserts the user belongs to the current tenant
- Boot refuses `APP_DEBUG=true` in production; HTTPS scheme forced in production; `SecureHeaders` + `TrustProxies`
- Lead CSV export escapes formula injection (`=+-@`)
- Checkout merges admin `gateway_metadata` into Stripe/Creem session metadata
- SPA: Leads/Tasks assignee fetches gated on `users.list` (no spurious 403 toast for staff); assignee fields PermissionGated in create/edit dialogs

**Ops / docs**

- CRM due-notification command applies tenant SMTP runtime config
- Production runbook: cache isolation wording, Creem webhook secret, frontend SPA deploy notes
- Tests: cancel-at-gateway, failed-webhook retry, renewal ledger; marketplace Stripe mocks allow `completedCheckoutEvent`

---

## Creem payment gateway (2026-07-14)

Add Creem as a second provider behind the existing `PaymentGatewayInterface` / `GatewayManager` stack. Stripe behavior is unchanged.

- `CreemGateway` + HTTP `CreemClient`, webhook HMAC verification, provider-neutral `tenant_gateway_customers`
- Config: `config/creem.php` (`CREEM_*` env fallbacks); seed + admin enable/disable/default/config
- Webhooks: `POST /webhooks/gateways/creem` (`creem-signature`) → Billing Engine module activation
- Product mapping uses Creem `prod_…` ids; Central UI credential fields + Creem-specific mapping copy
- Return-URL / “Complete subscription” sync via `confirm-checkout` so paid checkouts activate without a second session when webhooks are delayed
- Docs: `billing/creem.md`; tests: `CreemGatewayTest`, `CreemWebhookTest`, `CreemCheckoutConfirmTest`

---

## Provider-agnostic billing (2026-07-14)

Decouple Modules from Stripe. Stripe is one payment driver; catalog pricing stays on Modules.

- Added `payment_gateway_module_prices` (gateway × module × billing cycle → product/price references)
- Migrated existing `modules.stripe_*` IDs into the mapping table, then dropped those columns
- Added `modules.currency` and `workspace_module_subscriptions.payment_gateway_id`
- `BillingEngine` / `StripeGateway` resolve checkout prices from mappings; consolidated billing skips recurring-gateway subscriptions
- Central API + UI: Module form is catalog-only; **Payment Gateways → Product Mapping** manages provider refs
- Docs: `billing/*`, `architecture/database.md`, `api/central-v1.md`, `admin-ui.md`

---

## RC1 — Production Readiness (2026-07-14)

Release Candidate hardening for paying-customer launch. No new business modules. Official notes: [releases/rc1-production-readiness.md](/deployment/rc1-production-readiness). Recommended tag: `v1.2.0-rc.1`.

**Critical / High**

- Revoke Sanctum tokens on user suspend; reject suspended sessions via `not.suspended`
- Webhook unique idempotency + safe payload summaries; Cashier + gateway ingress share claim store
- Registration defaults off; tenant password-reset URLs include `workspace`
- Impersonation limited to workspace owner role
- SPA query-cache cleared on session switches; email-verify URL allowlist; verified gate treats missing timestamp as unverified
- Board APIs cap per-column payload size; drawer query-param history for leads/tasks

**Ops / a11y**

- Health check probes Redis when used; skip-to-content; billing ErrorState; remember-me default off

---

## Production Hardening Pass (2026-07-13)

Security, ops, and SPA hardening for launch readiness. Platform freeze unchanged (no Features/Plans/Limits reintroduced).

**Critical / High security**

- Block assignment of protected `superadmin` (workspace owner) roles via tenant user APIs
- Central role permission sync filtered to `central-api` guard only
- Gateway webhooks verify signatures before persisting payloads; store safe summaries only
- Branding uploads reject SVG (stored XSS)
- Narrowed `User` / `CentralUser` `$fillable` privileged fields
- CORS origins pinned via `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` (no `*`)
- Payment API redacts raw `gateway_response` / `webhook_payload`
- Webhook + API rate limiting; schedule `withoutOverlapping`
- SPA: safe post-login redirects, route `RequireAccess` gates, ErrorBoundary, query cache clear on logout

**Ops**

- Notifications implement `ShouldQueue`
- Health `/up` verifies database connectivity
- Production runbook: [architecture/platform-production-runbook.md](/deployment/platform-production-runbook)
- `.env.example` production guidance

---

## Sprint 2 — CRM UX (2026-07-13)

Leads/Tasks UX + notifications + tenant dashboard widgets. Platform freeze unchanged.

**Leads**

- `lead_value` (renamed from `estimated_value`); independent status `active|waiting|on_hold|closed|archived`; priority; assignment history
- Kanban (default) + table; DnD opens drawer, save commits stage; KPIs / board / stats APIs
- Follow-up update/reschedule; export CSV/XLSX (filtered); convert stub (`converted_at`, activity, status closed — Contacts deferred)
- Permissions: `view|create|update|delete|assign|export|convert` (no import); assignee scoping without `leads.assign`

**Tasks**

- `waiting` status; UI labels `open` as To Do; board (default) + list; KPIs / board / stats APIs
- Comments + History tabs; `tasks.change_due_date` required to change `due_at` after create
- Assignee scoping via `tasks.assign`

**Notifications & dashboard**

- Historical initial release: database + mail channels; APIs list / unread-count / mark read / mark all; realtime was added in the later notification architecture rollout above
- Hourly `crm:send-due-notifications` for due/overdue follow-ups and tasks
- `GET /dashboard` widget registry gated by module + permission + assignee scope; no calendar widget until Calendar module

**Docs**

- Updated Leads/Tasks guides, database, module-development patterns, tenant UI
- API: [tenant-v1-leads.md](/api/tenant-v1-leads), [tenant-v1-tasks.md](/api/tenant-v1-tasks), [tenant-v1-notifications.md](/api/tenant-v1-notifications), [tenant-v1-dashboard.md](/api/tenant-v1-dashboard)

---

## v1.1.0-platform — Production Ready (2026-07-13)

Platform foundation declared **Production Ready** and **frozen**. No new business modules in this release — hardening only.

Logical freeze notes (never tagged in git). Official first tag: [`v1.1.0`](/changelog/v1.1.0).  
Alias: [v1.1.0-platform](/changelog/v1.1.0-platform)

**Verification**

- Pest: **230/230** pass
- Playwright: **69/69** pass (`--workers=1`, all projects: setup, auth, tenant, chromium)
- Manual Cursor browser happy path: Central + Tenant

**Authentication & SPA**

- Auth matrix expanded: Pest + Playwright coverage for lockout messages (includes minutes remaining), remember-me, email verification, registration validation, tenant login, and wrong-workspace rejection
- `VerifyEmailGate` **Sign out** navigates to the context login page after logout

**Billing & gateways**

- `BillingEngine::resolveTenant` falls back to `payment_id` in event metadata when customer/subscription maps are absent
- Gateway webhook failure/cancel Pest coverage

**Validation & settings**

- Central user and module validation Pest; Lead validation; module deactivate gate after uninstall
- System settings runtime asserts: Sanctum expiration, locale, Cashier currency, date/time formats

**E2E stability**

- Focused auth/tenant/central specs; page-object delete/clone assertions; local Playwright `workers: 1`

---

## Product roadmap documented (2026-07-12)

- Added [product-roadmap.md](/getting-started/product-roadmap): CRM → Sales → Billing → Purchasing → Inventory → Finance → HR → future expansion
- Linked from README and platform-freeze docs
- Phase 1 CRM: Leads + Tasks complete; Contacts / Companies / Calendar / Activities next

---

## Tasks module (2026-07-12)

**Architecture**

- Second product module; mirrors Leads (flat Laravel, `module:tasks` + Spatie RBAC)
- Functional differences only: status/priority/complete vs stages/follow-ups

**Backend**

- Tables: `tasks`, `task_notes`, `task_activities`
- `TaskService`, events/subscriber (audit + assignment mail), tenant API routes
- Permissions: `tasks.view|create|update|delete|assign|complete`
- Pest: `tests/Feature/Tenant/Task/TaskTest.php`

**Frontend**

- Tasks list / form dialog / detail drawer; nav gated by module + permission
- Playwright: `npm run test:e2e:tasks` (`--project=tenant`)

**Docs**

- [modules/tasks.md](/user-guide/tasks-overview) (+ user / developer / production)
- [api/tenant-v1-tasks.md](/api/tenant-v1-tasks)

---

## Leads reference module (2026-07-12)

**Architecture**

- First product module on the frozen foundation; blueprint for Tasks and later modules
- Flat Laravel layout (no Modules package); `module:leads` + Spatie RBAC
- Pipeline-ready domain: stages, status workflow, assignment, notes, follow-ups, timeline

**Backend**

- Tables: `lead_stages`, `leads`, `lead_notes`, `lead_follow_ups`, `lead_activities`
- `LeadService`, events/subscriber (audit + mail notifications), tenant API routes
- Permissions: `leads.view|create|update|delete|assign`
- Auth payload includes `modules[]` for SPA entitlement gating
- Pest: `tests/Feature/Tenant/Lead/LeadTest.php`

**Frontend**

- Leads list / form dialog / detail drawer; nav gated by module + permission
- Playwright: `npm run test:e2e:leads` (`--project=tenant`)

**Docs**

- [modules/leads.md](/user-guide/leads-overview) (+ user / developer / production)
- [api/tenant-v1-leads.md](/api/tenant-v1-leads)

---

## Platform Freeze & Module Development Standard (2026-07-12)

**Architecture**

- Platform foundation locked — no redesign of Auth, Tenancy, RBAC, Billing, Marketplace, Settings, or Gateway architecture except critical security / data-integrity / production bugs
- Official [Module Development Standard](/developer-guide/module-development): flat Laravel layout, catalog + `module:` + Spatie permissions, audit + activity logging, Pest + Playwright, docs DoD
- Cursor rules added in Backend and Frontend (`.cursor/rules/platform-freeze.mdc`, `module-development.mdc`)
- **Leads** designated as the reference business module; future modules must mirror it

**Docs**

- [architecture/platform-freeze.md](/getting-started/platform-freeze)
- [modules/module-development.md](/developer-guide/module-development) (+ developer / production)

---

## Production Hardening (2026-07-12)

**Authentication**

- Shared tenant `/login` with Workspace field (slug/domain); `/central/login` isolated for platform admins
- Server-owned workspace resolution: host → bearer token → `workspace` input; fail-closed without context
- Email verification enforced for Central and Tenant (`verified` middleware + SPA verify pages)
- Sanctum token TTL wired to `session_lifetime_minutes`; Remember Me extends TTL; login lockout after failed attempts
- Removed client tenant persistence (`tenantStorage` / `VITE_DEFAULT_TENANT_DOMAIN`)

**Provisioning & tenancy**

- Central workspace create always requires an Owner; settings defaults and default role permissions seeded
- Suspended/archived workspaces denied at the API edge

**Security, payments, impersonation, audit**

- Tenant setting cache keys namespaced; isolation Pest coverage
- Stripe webhook signature verification + idempotency; payment matching by metadata; PaymentAttempt logging
- Impersonation issues real tenant tokens with timeout, banner, and revoke-on-end
- Broader PlatformAuditService coverage (auth, workspace, users, roles, settings, modules)

**Client / docs**

- Currency, date/time, locale, and timezone formatters consume bootstrap settings; SPA idle logout
- Authentication / tenancy docs updated for hybrid resolution and custom-domain readiness

---

## Manual QA — Production Readiness Fixes (2026-07-12)

**Backend**

- `DomainRule` now accepts platform hostnames including `tenant.localhost` and `tenant.myapp.com` (previously required three labels and rejected local domains)
- Central `RoleService` lists only `central-api` roles (orphaned `tenant-api` rows no longer leak into Central Users/Roles UI)
- Central role create always sets `guard_name=central-api` and scopes uniqueness to that guard
- `InitializeTenancy` re-resolves and switches tenant per request when the domain/header changes
- New `tenant.user` middleware rejects Sanctum tokens used against a different workspace (`EnsureTenantUserBelongsToCurrentTenant`)
- Pest: `DomainRuleTest`, `RoleListIsolationTest`, `TenantTokenIsolationTest`

**Frontend**

- Tenant form shows domain validation errors and uses `tenant.localhost` placeholder
- Timezone options always include `UTC` so the default value displays correctly

---

## Tenant Users, Roles & Permissions (RBAC)

**Backend**

- Per-workspace roles via `roles.tenant_id` (no Spatie teams); permissions remain shared `tenant-api` vocabulary
- Expanded `config/tenant-permissions.php` (users, roles, settings, leads, tasks)
- Tenant User + Role APIs: CRUD, suspend, password change, clone, permissions matrix
- Owner (`superadmin`) bootstrap with full permissions; protected default roles
- Legacy backfill: `php artisan tenants:isolate-roles` (+ lazy ensure on Users/Roles APIs)
- Pest: user/role CRUD, permission assignment, authorization, workspace isolation, legacy backfill

**Frontend**

- Tenant `/users`, `/roles`, `/roles/matrix` reusing Central pages with workspace-aware copy and routes
- Administration nav: Users / Roles (permission-gated)
- Playwright: `npm run test:e2e:tenant-rbac`

**Docs**

- `authorization/tenant-rbac*.md` — architecture, user guide, production security

---

## Tenant Branding & Configuration

**Backend**

- `TenantSettingService` resolves workspace settings with hierarchy: tenant override → tenant profile → Central → system default
- Tenant Settings API: list/update, branding upload, test mail, public bootstrap
- SMTP passwords encrypted; runtime mail uses tenant SMTP when `mail_host` is set, otherwise Central
- Branding assets stored under `tenants/{uuid}/branding/…`
- Permissions: `settings.list`, `settings.update`
- Pest coverage for resolver + API

**Frontend**

- Tenant Settings page (`/settings`) — General, Branding, Mail with searchable selects, color picker, uploads
- Settings store bootstraps resolved tenant branding when a workspace domain is known
- Playwright: `npm run test:e2e:tenant-settings`

**Docs**

- `settings/tenant-settings*.md` — hierarchy, SMTP, storage, security

---

## Tenant Application UI Foundation

**Frontend**

- Tenant protected routes now use the shared `AppLayout` shell (Sidebar, Topbar, Breadcrumbs, Command Palette, User Menu)
- Context-aware navigation: `centralNavigationGroups` vs `tenantNavigationGroups`
- Tenant sidebar: Dashboard, Leads, Tasks, Settings, Profile
- Tenant dashboard redesigned as layout-matched placeholders (welcome, workspace info, modules, activity, quick actions)
- Leads / Tasks / Tenant Settings reserved via `PlaceholderPage`
- Shared Profile page works on both `/profile` and `/central/profile`

**Docs**

- Shared layout developer + tenant user guides
- Architecture note for shared design system / layout reuse

---

## Tenant Authentication Foundation

**Backend**

- Self-service registration creates workspace owner, default roles/permissions, and returns a tenant Sanctum token
- Password reset emails point at SPA routes via `FRONTEND_URL`
- Tenant dashboard placeholder returns workspace + installed modules
- Email verification architecture prepared (`MustVerifyEmail` + signed verify/resend routes)
- Impersonation helper reserved for future tenant token handoff

**Frontend**

- Tenant auth at `/login`, `/register`, `/forgot-password`, `/reset-password/{token}`
- Central auth moved under `/central/*` with isolated token storage
- Tenant dashboard placeholder for auth/impersonation verification

**Docs / tests**

- Authentication developer, user, and production guides
- Pest coverage for tenant auth; Playwright auth suites updated for `/central` + tenant flows

---

## Features layer removed — module licensing + Spatie authorization

Licensing and authorization are fully decoupled.

**Architecture**

- Removed Features catalog (model, API, UI, entitlements `features[]`, `features.*` permissions, `features` table)
- Modules remain pure licensing products via `workspace_module_subscriptions`
- User access stays on Spatie Roles & Permissions
- Tenant gating: `module:{slug}` (licensing) then `can:{permission}` (authorization)
- Entitlements payload is now `{ core, modules }` only
- Default modules unchanged: Leads + Tasks (free, included, non-removable)

**Backend**

- `EnsureModule` middleware replaces `EnsureModuleFeature`
- Catalog seeder no longer creates Feature rows
- Migration drops `features` table

**Frontend**

- Features admin page, nav, API client, and Playwright suite removed
- Marketplace / tenant details no longer show feature badges

---

## Payment Gateway Management

Gateway-agnostic payment provider management for Central Billing.

**Architecture**

- Billing Engine talks only to `PaymentGatewayInterface` via `GatewayManager`
- Stripe/Cashier isolated inside `StripeGateway`; arch tests enforce isolation
- Admin APIs for enable/disable/default/config/mode/test/webhooks/logs/capabilities
- Encrypted gateway credentials; secrets never returned to the frontend
- Generic webhook ingress `POST /webhooks/gateways/{code}` + Cashier Stripe route

**Schema**

- Expanded `payment_gateways` (mode, encrypted config, webhook/test metadata)
- Added `payment_attempts`, `gateway_logs`, `webhook_logs`
- `payment_methods` remains the workspace preferred-method store

**Frontend**

- Top-level **Billing** nav: Dashboard, Invoices, Payments, Transactions, Refunds, Payment Methods, Payment Gateways, Coupons, Taxes, Billing Logs
- Full Payment Gateways management UI (configure Stripe fields, sandbox/live, test connection, logs)

**Docs**

- `billing/payment-gateways.md` (+ developer/user/production/webhooks guides)
- Updated `billing-engine.md` and `stripe-cashier.md`

---

## Central Application Settings refactor

Rebuilt system settings so every key is validated and consumed at runtime.

**Backend**

- Expanded mail/security/branding/localization settings; removed unused placeholders (`primary_color`, feature-flag duplicates, display-only queue/disk keys)
- Runtime config overlay (app name, timezone, locale, session lifetime, mail From/SMTP, Cashier currency)
- Encrypted `mail_password`, branding file uploads, test-mail endpoint
- Public bootstrap + self-service workspace registration gated by `registration_enabled`
- Tenant-only maintenance middleware (`tenant.available`); Central stays fully operational
- Centralized `PasswordRule` / `Password::defaults()` from security settings
- Support email + company name injected into tenant-facing auth emails

**Frontend**

- Settings UI rebuilt with SearchableSelect for timezone/locale/currency/formats
- App title, sidebar, button color CSS vars, favicon/logo from public settings
- App-wide date/time helpers; registration-closed and branded maintenance pages

**Tests / docs**

- Expanded Pest settings suite; Playwright settings coverage for registration-closed + maintenance copy
- Added Settings user / developer / production guides under `settings/`
- Updated API, admin UI, database, and testing docs

---

## Tenant form cleanup

Removed `owner_id` and `address` from the `tenants` schema and admin UI. Timezone, currency, country, and locale are searchable selects. Logo is an image upload (`logo` file field → `logo_path` / `logo_url`).

---

## Central QA stabilization (Playwright)

Stabilized the Central Application with a full Playwright pass before further Tenant Application work.

**Fixed**

- Logout now revokes only the current Sanctum token (was deleting all tokens and breaking parallel E2E sessions)
- Dashboard growth/revenue series API keys aligned to frontend contract (`count`, `amount`) — removed chart `NaN` display
- Settings E2E opens the Billing tab before toggling trial flags
- Auth greeting assertion matches time-based welcome copy
- Roles cleanup searches before deleting the original role after clone

**Added (Playwright)**

- Module suites: marketplace, billing, impersonation, permissions, profile
- Per-module npm scripts (`test:e2e:marketplace`, `test:e2e:billing`, …)
- Smoke coverage for Marketplace route

**Docs**

- Updated `testing/playwright.md` and Frontend `docs/testing/PLAYWRIGHT.md`

---

## Modular foundation complete (Phases 1–6)

Delivered marketplace APIs, Billing Engine, impersonation, and the financial ledger on top of the module-licensing foundation.

**Added**

- Marketplace: `GET /marketplace/modules`, `GET /marketplace/modules/{module}` (published catalog, dependency hints, `?tenant_id=` install state)
- Module subscriptions: `GET /module-subscriptions`, show, `POST …/cancel`, `POST …/deactivate`; `POST /tenants/{tenant}/modules` (install)
- Billing Engine (`BillingEngine`, `GatewayManager`, `ManualGateway`, `StripeGateway`, `ProrationCalculator`)
- Consolidated billing: `php artisan billing:run-consolidated` (scheduled daily); one invoice per workspace billing cycle for all billable active modules
- Financial ledger tables + read APIs: `invoices`, `invoice_items`, `payments`, `payment_transactions`, `payment_gateways`, `payment_methods`, `billing_addresses`, `taxes`, `coupons`, `refunds`, `credit_notes`
- Impersonation: `impersonation_sessions` table; `POST /tenants/{tenant}/impersonate`, `POST /impersonation/{id}/end`
- Permissions: `module-subscriptions.*`, `invoices.*`, `payments.*`, `impersonation.*`

**Admin UI**

- Marketplace browse screen
- Tenant details tabs: Overview | Modules | Billing; impersonate action with reason prompt
- Module catalog form retains marketplace pricing fields

**Unchanged from prior entry**

- Plans removed; Leads + Tasks remain default-included, non-billable
- `workspace_module_subscriptions` is licensing SoT; Cashier/Stripe is a gateway driver only

---

## Module licensing foundation (Plans removed)

Replaced plan-based licensing with workspace module subscriptions.

**Removed**

- Plans, plan modules/features/limits, limit definitions, usage counters
- Plan-based `tenant_subscriptions` / `subscription_events`
- Central API/UI for plans, limits, and tenant-subscriptions
- `default_plan_id` system setting

**Added**

- Module catalog fields: `uuid`, pricing, `trial_days`, `version`, `status`, `is_default_included`, `is_billable`, Stripe price IDs
- `module_categories`, `module_dependencies`
- `workspace_module_subscriptions` + history
- Workspace billing profile: `billing_anchor_day`, `billing_cycle`, `proration_mode`, `next_billing_at`
- `EntitlementService` + `GET /tenants/{tenant}/entitlements`
- `config/core-platform.php` for always-on platform capabilities
- Catalog seed: **Leads** and **Tasks** only (included, non-billable)
- New workspaces auto-install Leads + Tasks (`source=included`, not cancellable by owners)

---

## Prior: Central SaaS Platform completion

See git history for the earlier plan-based Central Platform delivery notes (tenants, users, roles, Cashier scaffolding, dashboard). That licensing model has been superseded.

