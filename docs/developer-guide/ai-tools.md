# AI Tools — Developer Guide

How EloSync registers permission-aware tools for `EloSyncBusinessAgent` and how to add a new one.

## Registry

`App\AI\Tools\AIToolRegistry` maps tool names to `AiToolDefinition` classes. Defaults are registered in `registerDefaults()`:

- Workspace: `search_workspace` (cross-module; `module()` is `null`; each provider enforces its own entitlement + `*.view`)
- Leads: `search_leads`, `get_lead`, `get_stale_leads`, `get_recent_lead_activity`, `update_lead_status`, `assign_lead`, `add_lead_note`
- Tasks: `search_tasks`, `get_my_tasks`, `get_overdue_tasks`, `get_tasks_due_today`, `get_task`
- Projects: `search_projects`, `get_project`, `get_overdue_projects`, `update_project_status`, `assign_project`, `add_project_note`
- Opportunities: `search_opportunities`, `get_pipeline_summary`, `get_opportunity_stages`, `get_opportunity`
- Invoices: `get_overdue_invoices`, `get_invoice_balance_summary`, `get_invoice`
- Estimates: `get_estimate`, `update_estimate_status` (visible with `estimates.update` **or** `send` **or** `accept`), `assign_estimate`, `add_estimate_note`
- Quotations: `get_quotation`, `update_quotation_status` (visible with `quotations.update` **or** `send` **or** `accept`), `assign_quotation`, `add_quotation_note`
- Payments: `get_payment`, `update_payment_status` (visible with `payments.update` **or** `post` **or** `void`; confirm uses `post()` / `void()`), `assign_payment`, `add_payment_note`
- Credit notes: `get_credit_note`, `update_credit_note_status` (visible with `credit-notes.update` **or** `issue` **or** `apply` **or** `void` **or** `refund`; confirm uses `issue()` / `apply()` / `void()` / `refund()`), `assign_credit_note`, `add_credit_note_note`
- Purchase orders: `get_purchase_order`, `update_purchase_order_status` (visible with `purchase-orders.update` **or** `send` **or** `receive` **or** `cancel`), `assign_purchase_order`, `add_purchase_order_note`
- Expenses: `get_expense_pending_approval`, `get_expense`
- Leave Management: `get_leave_request`, `get_pending_leave_requests`, `approve_leave_request`, `reject_leave_request` (writes require `leave-management.approve`; no assign/note tools)
- Writes: `create_task`, `update_task_status` (visible with `tasks.update` **or** `tasks.complete`), `assign_task`, `add_task_note`, `update_lead_status`, `assign_lead`, `add_lead_note`, `log_activity`, `update_help_desk_ticket_status`, `assign_help_desk_ticket`, `add_help_desk_ticket_note`, `update_opportunity_stage`, `assign_opportunity`, `add_opportunity_note`, `update_invoice_status` (visible with `invoices.update` **or** `invoices.send` **or** `invoices.void`), `assign_invoice`, `add_invoice_note`, `update_estimate_status` (visible with `estimates.update` **or** `send` **or** `accept`), `assign_estimate`, `add_estimate_note`, `update_quotation_status` (visible with `quotations.update` **or** `send` **or** `accept`), `assign_quotation`, `add_quotation_note`, `update_payment_status`, `assign_payment`, `add_payment_note`, `update_credit_note_status`, `assign_credit_note`, `add_credit_note_note`, `update_purchase_order_status`, `assign_purchase_order`, `add_purchase_order_note`, `update_project_status`, `assign_project`, `add_project_note`, `update_expense_status` (visible with `expenses.update` **or** `submit` **or** `approve` **or** `reject` **or** `pay` **or** `cancel`), `assign_expense`, `add_expense_note`, `approve_leave_request`, `reject_leave_request` (confirmation required)
- Reads: `get_help_desk_open_tickets`, `get_help_desk_ticket` (module + permission gated)

List/detail tool payloads that include an assignee expose numeric **`assigned_to`** (user id) and **`assignee_name`** (display name).

### `search_workspace`

`App\AI\Tools\Search\AiWorkspaceSearchService` fans out to entitled providers under `app/AI/Tools/Search/Providers/` (Wave A+B+C): leads, tasks, projects, opportunities, contacts, companies, invoices, help-desk, estimates, payments, credit-notes, vendors, purchase-orders, expenses, employees, products, documents, knowledge-base, activities, meetings.

Arguments: `query` (required), optional `modules` (slug filter), `limit_per_module` (default 5, max 10), `limit_total` (default 25, max 50). Hits include `module`, `id`, `uuid`, `title`, `subtitle`, `path`. Provider exceptions are isolated (`modules_failed`); other modules still return hits.

List/detail tool payloads include both numeric **`id`** (for SPA deep links) and **`uuid`** (for tool lookups).

`availableFor($user, $tenant, $entitlements)` filters tools when:

1. Risk is not `Destructive`.
2. Declared module slug is entitled (`module:{slug}`) — skipped when `module()` is `null`.
3. Permission gate:
   - Default: user has **every** permission listed on `permissions()` — skipped when the list is empty.
   - Tools implementing `AiToolAnyOfPermissions`: user has **at least one** of `anyOfPermissions()` (e.g. `update_task_status` → `tasks.update` **or** `tasks.complete`).

## Tool definition contract

Implement `App\AI\Tools\Contracts\AiToolDefinition`:

| Method | Purpose |
|--------|---------|
| `name()` | Stable snake_case identifier exposed to the model |
| `description()` | Natural-language capability summary |
| `module()` | Required marketplace slug (`leads`, `tasks`, …) or `null` |
| `permissions()` | Spatie permission names (all required) |
| `risk()` | `ReadOnly`, `LowRiskWrite`, or `Destructive` (destructive tools are never registered) |
| `requiresConfirmation()` | When `true`, handler returns a pending action instead of mutating data |
| `schema()` | JSON-schema-like argument map for the adapter |
| `handle(AiToolContext $ctx, array $args)` | Execute and return serializable array |

## Adapter

`LaravelToolAdapter` implements `Laravel\Ai\Contracts\Tool`:

- Builds JSON Schema properties from `schema()`.
- Re-checks permissions before `handle()`.
- JSON-encodes the handler result for the agent runtime.

## Adding a tool (checklist)

1. **Create** `app/AI/Tools/Definitions/YourTool.php` implementing `AiToolDefinition`.
2. **Declare** module + permissions matching the domain API you mirror.
3. **Register** the class in `AIToolRegistry::registerDefaults()`.
4. **Write actions** that mutate data:
   - Set `requiresConfirmation(): true` and return `pending_confirmation` via `PendingAiActionService`, **or**
   - Keep read-only and return DTO arrays only.
5. **Confirm path** — add a `match` arm in `PendingAiActionService::confirm()` when introducing a new write tool (`create_task`, Task status/assign/note, `update_lead_status`, Lead assign/note, `log_activity`, Help Desk status/assign/note, Opportunity stage/assign/note, Invoice status/assign/note, Estimate status/assign/note, Quotation status/assign/note, Payment status/assign/note, Credit Note status/assign/note, Purchase Order status/assign/note, Project status/assign/note, Expense status/assign/note, Leave approve/reject).
6. **Tests** — extend `tests/Feature/Tenant/Ai/AiAuthorizationTest.php` (permissions) and write confirmation tests when applicable.
7. **Docs** — update [Tenant AI API](/api/tenant-v1-ai) tool list and user guide if user-visible.

## Example skeleton

```php
final class GetExampleTool implements AiToolDefinition
{
    public function name(): string
    {
        return 'get_example';
    }

    public function module(): ?string
    {
        return 'leads';
    }

    public function permissions(): array
    {
        return ['leads.view'];
    }

    public function risk(): AiToolRiskEnum
    {
        return AiToolRiskEnum::ReadOnly;
    }

    public function requiresConfirmation(): bool
    {
        return false;
    }

    public function handle(AiToolContext $ctx, array $args): array
    {
        Gate::authorize('leads.view');

        // … query tenant-scoped models …

        return ['example' => []];
    }
}
```

## Testing

- Feature tests live under `tests/Feature/Tenant/Ai/`.
- Use `installAiModule($tenant)` and `configurePlatformAi()` helpers from `tests/Helpers.php`.
- For agent integration tests, prefer `EloSyncBusinessAgent::fake([...])` (laravel/ai) to avoid live provider calls.

## Platform freeze notes

- Do not bypass `AIGateway` with parallel chat stacks.
- Do not expose tools without module + permission gates.
- Keep workspace timezone conventions when returning scheduling fields (see [tenant settings](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes)).
