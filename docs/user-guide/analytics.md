# Analytics / Reports — User Guide

Catalog slug remains **`analytics`**. Marketplace display name is **Reports** (v1.4.0).

1. Enable **Reports** from Marketplace (free Operations module; search `analytics` if needed).
2. Open **Overview → Reports** for the executive dashboard (one chart per entitled module). Use the chevron beside **Reports** in the sidebar to expand CRM / Sales / Billing / Purchasing / People without leaving the Reports section.
3. Choose a period → **Apply period**.
4. Open domain reports from the hub cards or sidebar:
   - **CRM report** — Leads + Tasks, plus a **Staff workload** board (open leads/tasks, overdue, cycle times, pressure score 0–100 with healthy / watch / overloaded bands)
   - **Sales report** — Opportunities, Quotations, Contracts
   - **Billing report** — Invoices, Payments, Credit Notes
   - **Purchasing report** — Vendors, Purchase Orders, Expenses
   - **People report** — Employees, Leave Management, Attendance, Payroll
5. On each domain page, review KPI cards, per-module charts (pie / donut / bar / area / line by context — e.g. status mix vs value compare), and the breakdown table, then **Export CSV** when sources are available.

Sections and domain rows appear only when that source module is entitled **and** you have its view permission. On **People**, leave and attendance figures follow the same self-scope as those modules (staff see their own linked employee; managers/approvers see the workspace). Employees totals remain workspace-wide when you have `employees.view`. **Payroll** appears only with `payroll.view` (manager+ by default — compensation data is not shown to staff). Dates use **Settings → General → Timezone**.

For accounting statements (Trial Balance, P&L, Balance Sheet), use [Financial Reports](/user-guide/financial-reports). For department lead/task performance, use [Department reports](/user-guide/departments) (owner / department-manager surface — not part of Reports).

**Still deferred:** report builder, saved/scheduled reports, email analytics.
