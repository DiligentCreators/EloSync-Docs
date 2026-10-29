# Module dependencies

Some modules need another module installed first. The Marketplace shows the required module in the detail panel with an **Install** action. Install that first, and then the original module's Install button unlocks.

| Module | Needs |
|---|---|
| Meetings | Calendar |
| Quotations | Opportunities |
| Contracts | Opportunities |
| Payments | Invoices |
| Credit Notes | Invoices |
| Estimates | Invoices |
| Purchase Orders | Vendors |
| Inventory | Products |
| Financial Reports | Accounting |
| Leave Management | Employees |
| Attendance | Employees |
| Payroll | Employees |
| Resellers | Payments |
| Reseller Payouts | Resellers |
| Documents | Storage |
| Customer Portal | Contacts |
| Storage capacity packs | Storage |
| AI credit packs | AI Assistant |

These modules optionally link to **Accounting** (soft dependency — they install without it, but accounting features unlock when Accounting is installed): Invoices, Payments, Credit Notes, Expenses, Purchase Orders, Inventory, Assets, Payroll.

Some links are optional. For example, Leads works without Contacts, but with Contacts installed you can convert a lead into a contact. Contacts works without Companies, but Companies adds a company picker.

To remove a module, remove the modules that depend on it first. Turning a module off keeps its data.
