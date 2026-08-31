# AI Tools — Developer Guide

How EloSync registers permission-aware tools for `EloSyncBusinessAgent` and how to add a new one.

## Registry

`App\AI\Tools\AIToolRegistry` maps tool names to `AiToolDefinition` classes. Defaults are registered in `registerDefaults()`:

- Workspace: `search_workspace` (cross-module; `module()` is `null`; each provider enforces its own entitlement + `*.view`)
- Leads: `search_leads`, `get_lead`, `get_stale_leads`, `get_recent_lead_activity`
- Tasks: `search_tasks`, `get_my_tasks`, `get_overdue_tasks`, `get_tasks_due_today`
- Projects: `search_projects`, `get_project`, `get_overdue_projects`
- Opportunities: `search_opportunities`, `get_pipeline_summary`
- Invoices: `get_overdue_invoices`, `get_invoice_balance_summary`
- Writes: `create_task`, `update_lead_status`, `log_activity` (confirmation required)
- Reads: `get_help_desk_open_tickets`, `get_expense_pending_approval` (module + permission gated)

### `search_workspace`

`App\AI\Tools\Search\AiWorkspaceSearchService` fans out to entitled providers under `app/AI/Tools/Search/Providers/` (Wave A+B): leads, tasks, projects, opportunities, contacts, companies, invoices, help-desk, estimates, payments, credit-notes, vendors, purchase-orders, expenses, employees, products.

Arguments: `query` (required), optional `modules` (slug filter), `limit_per_module` (default 5, max 10), `limit_total` (default 25, max 50). Hits include `module`, `id`, `uuid`, `title`, `subtitle`, `path`.

List/detail tool payloads include both numeric **`id`** (for SPA deep links) and **`uuid`** (for tool lookups).

`availableFor($user, $tenant, $entitlements)` filters tools when:

1. Risk is not `Destructive`.
2. Declared module slug is entitled (`module:{slug}`) — skipped when `module()` is `null`.
3. User has **every** permission listed on the definition — skipped when the list is empty.

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
5. **Confirm path** — add a `match` arm in `PendingAiActionService::confirm()` when introducing a new write tool (`create_task`, `update_lead_status`, `log_activity`).
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
