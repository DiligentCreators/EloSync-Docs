# Changelog

## EloSync Mobile — Team Chat module (2026-08-27)

- **SaaS-Mobile:** **Team Chat** conversation list, search, thread read, join public channels, start DM/group DM, send text messages, and mark read (permission-gated). API clients `lib/api/team-chat.ts` and `lib/api/users.ts` (`/conversations`, `/users`). Routes under `app/(app)/(tabs)/team-chat/`. Realtime (Reverb), attachments, reactions, pins, threads, channel create/settings, message edit/delete, and global message search deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Help Desk module (2026-08-26)

- **SaaS-Mobile:** **Help Desk** list, search, create, view, edit, delete, close, reopen, add text notes, and status change on edit (permission-gated). API clients `lib/api/help-desk.ts` and `lib/api/help-desk-categories.ts` (`/help-desk`, `/help-desk-categories`). Routes under `app/(app)/(tabs)/help-desk/`; assignee scoping matches web. Attachments, assign, contact/company/KB links, category CRUD, timeline, and trash/restore deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Knowledge Base module (2026-08-26)

- **SaaS-Mobile:** **Knowledge Base** list, search, create, view, edit, delete (permission-gated). API clients `lib/api/knowledge-base.ts` and `lib/api/knowledge-base-categories.ts` (`/knowledge-base`, `/knowledge-base-categories`). Routes under `app/(app)/(tabs)/knowledge-base/`; plain-text body converted to simple HTML for TipTap storage. Rich editor, attachments, notes, timeline, category CRUD, and trash/restore deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Documents module (2026-08-26)

- **SaaS-Mobile:** **Documents** list, search, upload, view, edit metadata, delete, and download/share (permission-gated). API clients `lib/api/documents.ts` and `lib/api/document-categories.ts` (`/documents`, `/document-categories`). Routes under `app/(app)/(tabs)/documents/`; file picker upload via `expo-document-picker`; authenticated download via `expo-file-system` + `expo-sharing`. Record links, category CRUD, trash/restore, bulk delete, and file replace deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Short Links module (2026-08-26)

- **SaaS-Mobile:** **Short Links** list, search, create, view, edit, delete, and share short URL (permission-gated). API client `lib/api/short-links.ts` (`/short-links` CRUD). Routes under `app/(app)/(tabs)/short-links/`; vanity slug on create; basic UTM fields; click analytics and click log deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Assets module (2026-08-26)

- **SaaS-Mobile:** **Assets** list, search, create, view, edit, delete (permission-gated). API client `lib/api/assets.ts` (`/assets` CRUD). Routes under `app/(app)/(tabs)/assets/`; status, category, purchase, and warranty fields on create/edit; vendor, employee, assign, notes, and timeline deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Announcements module (2026-08-26)

- **SaaS-Mobile:** **Announcements** inbox for all entitled users; managers with `announcements.update` get admin list/search; create, view, edit, delete, and mark-read (permission-gated). API client `lib/api/announcements.ts`. Routes under `app/(app)/(tabs)/announcements/`; read-tracking list and restore/force-delete deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Email module (2026-08-26)

- **SaaS-Mobile:** **Email** mailbox browse and read (permission-gated). API client `lib/api/email.ts` (`GET /email/accounts`, folder messages, message detail, mark read). Routes under `app/(app)/(tabs)/email/`; account and folder pickers; inbox/sent/drafts focus on mobile v1; compose, account setup, labels, attachments, templates, and signatures deferred.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Communication Templates module (2026-08-26)

- **SaaS-Mobile:** **Communication Templates** list, search, create, view, edit, delete (permission-gated). API client `lib/api/communication-templates.ts` (`/communication-templates` CRUD + `/meta/contexts` picker). Routes under `app/(app)/(tabs)/communication-templates/`; WhatsApp channel only on mobile v1; placeholder picker, preview, and render/use deferred.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Inventory module (2026-08-26)

- **SaaS-Mobile:** **Inventory** stock level list and search, stock adjust (`POST /inventory/stock/adjust`), transfer list/create/view/edit (draft)/dispatch/complete/cancel/delete (permission-gated). API client `lib/api/inventory.ts`. Routes under `app/(app)/(tabs)/inventory/`; product and warehouse pickers when Products/Warehouses are entitled; single-line transfers on mobile v1; movement history deferred.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Warehouses module (2026-08-26)

- **SaaS-Mobile:** **Warehouses** list, search, create, view, edit, delete (permission-gated). API client `lib/api/warehouses.ts` (`/warehouses` CRUD). Routes under `app/(app)/(tabs)/warehouses/`; active/default toggles on create/edit; notes and timeline deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Products module (2026-08-26)

- **SaaS-Mobile:** **Products** list, search, create, view, edit, delete (permission-gated). API clients `lib/api/products.ts` (`/products` CRUD + `next-sku`) and `lib/api/product-categories.ts` (`/product-categories` picker). Routes under `app/(app)/(tabs)/products/`; category picker, stock tracking, and pricing fields on create/edit; rich-text description, notes, timeline, and category management deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Expenses module (2026-08-26)

- **SaaS-Mobile:** **Expenses** list, search, create, view, edit (draft only), submit, approve, reject, pay (when Accounting is not installed), cancel, delete (permission-gated). API clients `lib/api/expenses.ts` (`/expenses` CRUD + workflow actions) and `lib/api/expense-categories.ts` (`/expense-categories` picker). Routes under `app/(app)/(tabs)/expenses/`; category picker on create/edit; receipt upload, vendor/PO links, accounting account pickers, notes, and timeline deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Estimates module (2026-08-26)

- **SaaS-Mobile:** **Estimates** list, search, create, view, edit (draft only), send, accept, reject, convert to invoice, delete (permission-gated). API client `lib/api/estimates.ts` (`/estimates` CRUD + `send`/`accept`/`status`/`convert`). Routes under `app/(app)/(tabs)/estimates/`; `EstimateLinkPickers` for optional contact, company, quotation, and opportunity links; optional line item on create; email and PDF deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Credit Notes module (2026-08-26)

- **SaaS-Mobile:** **Credit Notes** list, search, create, view, edit (draft only), issue, apply, void, delete (permission-gated). API client `lib/api/credit-notes.ts` (`/credit-notes` CRUD + `issue`/`apply`/`void`). Routes under `app/(app)/(tabs)/credit-notes/`; required unpaid-invoice picker on create; optional line item; email and PDF deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Payments module (2026-08-26)

- **SaaS-Mobile:** **Payments** list, search, create, view, edit (draft only), post, void, delete (permission-gated). API client `lib/api/payments.ts` (`/payments` CRUD + `post`/`void`). Routes under `app/(app)/(tabs)/payments/`; `PaymentLinkPickers` for optional contact and company; optional single-invoice allocation when Invoices is entitled; email receipt, PDF, deposit account, and withholding deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Invoices module (2026-08-26)

- **SaaS-Mobile:** **Invoices** list, search, create, view, edit (draft only), send, void, delete (permission-gated). API client `lib/api/invoices.ts` (`/invoices` CRUD + `send`/`void`). Routes under `app/(app)/(tabs)/invoices/`; `InvoiceLinkPickers` for optional contact, company, and quotation; recurring series, email, and PDF deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Contracts module (2026-08-26)

- **SaaS-Mobile:** **Contracts** list, search, create, view, edit (draft only), status transitions, delete (permission-gated). API client `lib/api/contracts.ts` (`/contracts` CRUD + `status`). Routes under `app/(app)/(tabs)/contracts/`; `ContractLinkPickers` for opportunity (required) and optional quotation; convert-to-invoice deferred on mobile v1.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Projects module (2026-08-26)

- **SaaS-Mobile:** **Projects** list, search, create, view, edit, status transitions, delete (permission-gated). API client `lib/api/projects.ts` (`/projects` CRUD + `status`). Routes under `app/(app)/(tabs)/projects/`; `ProjectLinkPickers` for optional CRM links.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Meetings module (2026-08-26)

- **SaaS-Mobile:** **Meetings** list (60-day range), search, create, view, edit, cancel, complete, delete (permission-gated). API client `lib/api/meetings.ts` (`/meetings` CRUD + `cancel`/`complete`). Routes under `app/(app)/(tabs)/meetings/`; Meetings tab; manual-link meetings with optional guest + reminder on mobile.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Calendar module (2026-08-26)

- **SaaS-Mobile:** **Calendar** list (60-day range), search, create, view, edit manual events, cancel, delete (permission-gated). API client `lib/api/calendar.ts` (`/calendar/events` CRUD + `cancel`, `/calendar/upcoming`). Routes under `app/(app)/(tabs)/calendar/`; Calendar tab in `config/modules.ts`.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Quotations module (2026-08-26)

- **SaaS-Mobile:** **Quotations** list, search, create, view, edit, delete, send, accept (permission-gated). API client `lib/api/quotations.ts` (`/quotations` CRUD + `send`/`accept`). Routes under `app/(app)/(tabs)/quotations/`; Quotes tab in `config/modules.ts`; opportunity-linked create with optional line item.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — ToDos module (2026-08-26)

- **SaaS-Mobile:** **ToDos** list, search, create, view, edit, delete, mark complete (permission-gated). API client `lib/api/todos.ts` (`/todos` CRUD; complete via `status: completed`). Routes under `app/(app)/(tabs)/todos/`; ToDos tab in `config/modules.ts`.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Activities module (2026-08-26)

- **SaaS-Mobile:** **Activities** list, search, create, view, edit, delete, complete (permission-gated). API client `lib/api/activities.ts` (`/activities` CRUD + `complete`). Routes under `app/(app)/(tabs)/activities/`; Log tab; `RelatedEntityPickers` for contact/company/lead links.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Opportunities module (2026-08-26)

- **SaaS-Mobile:** **Opportunities** list, search, create, view, edit, delete (permission-gated). API client `lib/api/opportunities.ts` with `/opportunities` CRUD + `GET /opportunity-stages`. Routes under `app/(app)/(tabs)/opportunities/`; Pipeline tab in `config/modules.ts`.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Companies module (2026-08-26)

- **SaaS-Mobile:** **Companies** list, search, create, view, edit, delete (permission-gated). API client `lib/api/companies.ts` mirrors Contacts (`/companies` CRUD). Routes under `app/(app)/(tabs)/companies/`; registered in `config/modules.ts`.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Contacts module (2026-08-26)

- **SaaS-Mobile:** **Contacts** list, search, create, view, edit, delete (permission-gated). API client `lib/api/contacts.ts` mirrors Leads (`/contacts` CRUD). Routes under `app/(app)/(tabs)/contacts/`; registered in `config/modules.ts`.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — Tasks module (2026-08-26)

- **SaaS-Mobile:** **Tasks** list, search, create, view, edit, delete, complete/reopen (permission-gated). API client `lib/api/tasks.ts` mirrors Leads (`/tasks` CRUD + `complete`/`reopen`). Routes under `app/(app)/(tabs)/tasks/`; registered in `config/modules.ts`.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).

## EloSync Mobile — platform shell + Leads module (2026-08-26)

- **SaaS-Mobile:** React Query provider, shared screen/list/form components, dynamic module nav (`config/modules.ts`), notifications tab, **Leads** list/search/create/view/edit/delete (permission-gated). Home dashboard links entitled modules.
- Docs: [Mobile user guide](/user-guide/elosync-mobile), [product roadmap — Mobile](/getting-started/product-roadmap#elosync-mobile-tenant-app), [developer mobile guide](/developer-guide/mobile-app).
- **saas-website:** Roadmap entry for EloSync Mobile (in development).

## Laravel Horizon queue dashboard (2026-08-26)

- **SaaS-Backend:** Laravel Horizon at `/horizon` on the **central domain**, with the same role-only access as Pulse (**superadmin**, **developer**, **tester**). Central SPA users open Horizon via `GET /api/central/v1/horizon/enter` (signed session bridge). Production worker config in `config/horizon.php`: `supervisor-general` (`automations`, `whatsapp-inbound`, `whatsapp-outbound`, `webhooks`, `emails`, `lead-ingest`, `imports`, `default`; max **3** processes) and `supervisor-email-sync` (`email-sync`; max **1** process, 300s timeout). Scheduler runs `horizon:snapshot` every five minutes. Pest: `HorizonAccessTest`.
- **SaaS-Frontend:** Central **Horizon** link (Settings) opens the Horizon dashboard in a **new browser tab** and returns the Central SPA to the dashboard. Playwright: `e2e/tests/horizon/horizon.spec.ts` (`npm run test:e2e:horizon`).
- **Ops:** Replace Forge `queue:work` daemons with a single `php artisan horizon` daemon; deploy script uses `horizon:terminate` after `$ACTIVATE_RELEASE()` instead of `queue:restart`. Keep `pulse:check`, Nightwatch, and Reverb as separate processes.
- Docs: [Laravel Forge — Horizon](/deployment/laravel-forge#15-daemons-queue--reverb), [Installation — monitoring](/getting-started/installation#monitoring), [Central API](/api/central-v1).

## EloSync Mobile — EAS development builds (2026-08-26)

- **SaaS-Mobile:** `expo-dev-client`, `eas.json` profiles (`development`, `development-simulator`, `preview`, `production`), bundle ids `com.diligentcreators.elosync`, location/secure-store config plugins, npm scripts for EAS builds and `start:dev-client`. Replaces App Store Expo Go for SDK 57 device testing.
- Docs: [Mobile app developer guide](/developer-guide/mobile-app).

## EloSync Mobile — tenant auth scaffold (2026-08-25)

- **SaaS-Mobile:** New Expo app (`elosync-mobile`) with tenant-only auth: login (email/password/remember, optional workspace branding), forgot password (workspace + email), email verification gate, SecureStore session, dashboard + profile shell. API client targets `/api/tenant/v1` only.
- Docs: [Mobile app developer guide](/developer-guide/mobile-app).

## Ask EloSync — expanded AI provider catalog (2026-08-25)

- **SaaS-Backend:** Central and tenant AI settings support ten text providers (OpenAI, Anthropic, Gemini, OpenRouter, Groq, Mistral, DeepSeek, xAI, OpenAI-compatible, Ollama) via `App\Support\AiProviderCatalog`. Provider-aware defaults in `AiConfigResolver`, runtime key/URL injection for all Laravel AI drivers, and read-only catalog APIs `GET /system-settings/ai-providers` and `GET /settings/ai-providers`. OpenRouter and self-hosted providers accept custom model IDs; Ollama can omit an API key when a base URL is set. Catalog: `ai` **1.1.0 → 1.2.0**. Pest: `AiProviderCatalogTest`, extended `AiConfigResolverTest`, `AiTestConnectionTest`, `AiProvidersCatalogTest`.
- **SaaS-Frontend:** Settings → AI provider form loads the catalog API (fallback constants), shows base URL for self-hosted providers, and custom model inputs for OpenRouter/Ollama/OpenAI-compatible. Playwright: provider dropdown includes Gemini and OpenRouter.
- Docs: [Central settings](/user-guide/central-settings), [Tenant settings — AI](/user-guide/tenant-settings#ai-ai-assistant-module), [AI Assistant](/user-guide/ai-assistant), [deployment AI](/deployment/ai).

## Ask EloSync — workspace scope + clickable references (2026-08-25)

- **SaaS-Backend:** Ask EloSync now refuses obvious off-topic prompts (for example logo design) without calling the provider. Structured responses normalize reference aliases (`numeric_entity_id` / `relative_url` → `entity_id` / `url`), extract prose when models dump JSON into `answer`, and coerce string suggested actions into labeled objects. Workspace **AI instructions**, industry, and preferred language are injected into trusted chat context. System prompt **2026-08-25.1** tightens workspace-only scope and reference field names. Pest: `AiStructuredResponseNormalizerTest`, `AiWorkspaceScopeGuardTest`, `AiWorkspaceScopeTest`.
- **SaaS-Frontend:** `resolveAiReferenceHref` accepts `numeric_entity_id` and `relative_url` so invoice/lead/task citations render as in-app links.
- Docs: [AI Assistant user guide](/user-guide/ai-assistant).

## Central Pulse access (2026-08-25)

- **SaaS-Backend:** Laravel Pulse at `/pulse` is limited to central roles **superadmin**, **developer**, and **tester** (role-based, not Spatie permissions). Central SPA users open Pulse via `GET /api/central/v1/pulse/enter`, which returns a signed web URL that stores a short-lived session bridge. Pulse uses a dedicated cache store resolver so Laravel 13's `cache.serializable_classes = false` does not break nested `Collection` query caches. Pulse dashboard cards disable Livewire lazy loading so `wire:poll` live updates stay stable. Pulse is enabled by default in production (`config/pulse.php`). Pest: `PulseAccessTest`, `PulseCacheSerializationTest`.
- **SaaS-Frontend:** Central **Pulse** link (Settings) opens the full Laravel Pulse dashboard in a **new browser tab** and returns the Central SPA to the dashboard. Playwright: `e2e/tests/pulse/pulse.spec.ts` (`npm run test:e2e:pulse`).
- Docs: [Installation — monitoring](/getting-started/installation#monitoring), [Central API](/api/central-v1).

## Fix — manual lead create assigns to creator (2026-08-25)

- **SaaS-Backend:** `LeadService::create` now defaults `assigned_to` to the authenticated creator when omitted, matching Contacts, Opportunities, and Projects. Users without `leads.assign` still cannot assign to someone else on create, but their new lead is assigned to them so assignee-scoped lists include it. Inbound webhook/Meta ingest (no actor) is unchanged. Catalog: `leads` **1.3.0 → 1.3.1**. Pest: `LeadTest` creator-default coverage.
- **SaaS-Frontend:** Lead create form defaults assignee to the current user when the actor has `leads.assign`, and injects the signed-in user into assignee options when `users.list` is unavailable (same pattern as Projects).
- Docs: [Leads user guide](/user-guide/leads), [developer guide](/developer-guide/leads), [API](/api/tenant-v1-leads).

## International tax & withholding (2026-08-24)

- **SaaS-Backend:** Tenant **Tax types** catalog (`sales_tax`, `withholding` with payment in/out directions), starter GL accounts `1150` / `2150`, invoice/credit-note tax split to `2100`, `tax_type_id` on billing lines, withholding on customer payment post and expense pay (3-line journals), contact/vendor default withholding types. Catalog: `accounting` **1.7.0 → 1.7.2** (PATCH **1.7.2** fixes tax types list when `direction=asc|desc`), `invoices` **1.8.1**. Pest: `TaxTypeTest`, `PaymentWithholdingTest`, `ExpenseWithholdingTest`, updated invoice accounting tests.
- **SaaS-Frontend:** Tax types list/create/view/edit, billing line tax type picker, payment and expense pay withholding UI, contact/vendor default withholding, workspace tax country/registration in Settings → General. Payment and expense **view** pages show posted withholding. Playwright: `e2e/tests/accounting/tax-types.spec.ts`.
- Docs: [user guide](/user-guide/tax-types), [developer guide](/developer-guide/tax-types), [API](/api/tenant-v1-tax-types), [accounting overview](/user-guide/accounting-overview), [production readiness](/deployment/international-tax-production-readiness).

## Fix — workspace retention settings save (2026-08-24)

- **SaaS-Frontend:** Settings → General **Trash retention** and Settings → Team Chat **Message & file retention** now persist reliably — save payload compares against loaded API values (not only RHF `dirtyFields`), Select changes explicitly mark the form dirty, and the settings query cache updates from the PUT response so a stale refetch cannot revert the UI.
- **SaaS-Backend:** Pest coverage for `team-chat.retention_days` on `PUT /settings` (alongside existing `trash.retention_days` tests).

## Short Links UX — branded 404, vanity slugs, copy icons (2026-08-24)

- **SaaS-Backend:** Branded public 404 page (`resources/views/short-links/unavailable.blade.php`) with EloSync marketing CTAs when links are missing, paused, expired, or deleted. Optional custom vanity `code` on create (3–64 chars, reserved-slug validation). `short_links.code` widened to 64 chars. Catalog MINOR: `short-links` **1.1.0 → 1.2.0**. Pest: branded 404, custom slug, soft-delete redirect tests.
- **SaaS-Frontend:** `CopyableText` component; inline copy icon on list Short URL column and view. Optional **Custom slug** field on create with live preview. Playwright coverage extended.
- Docs: [user guide](/user-guide/short-links), [developer guide](/developer-guide/short-links), [API](/api/tenant-v1-short-links), [production readiness](/deployment/short-links-production-readiness).

## Platform polish lanes A, B, C (2026-08-23)

- **SaaS-Backend:** Expense / Help Desk / KB attachments; document polymorphic links; credit note & purchase order PDF + email; lead import retry guard; projects calendar projection; dashboard widget data; `local:seed-demo --full`; AI write tools + Opportunity Copilot API. Catalog MINOR/PATCH bumps across billing, expenses, help-desk, documents, knowledge-base, projects. Merged to `main` (PR #148).
- **SaaS-Frontend:** Workspace checklist card, Ask EloSync dashboard section, marketplace starter paths, attachment UI, billing email dialogs, Opportunity Copilot, dashboard widgets. E2e + TypeScript production fixes on `main` (PR #143 + follow-up).
- **SaaS-Docs:** API, user/developer guides, changelog; [production readiness audit](/deployment/platform-polish-a-b-c-production-readiness) (**Go** after joint migrate + smoke).
- **Verification:** Pest polish suite green on Backend `main`; Playwright module scripts (documents, expenses, AI, dashboard, help-desk) with cached demo login.

## Documents soft record links — A7 (2026-08-23)

- **SaaS-Backend:** `document_links` polymorphic pivot, `DocumentLink` model, `DocumentLinkService::sync` on create/update, `LinkableAsset` + `LinkableTask` validation rules, `links` on document API resources. Catalog MINOR: `documents` **1.1.0 → 1.3.0**. Pest: link sync, entitlement gating, forbidden link in `DocumentTest`.
- **SaaS-Frontend:** Related-record pickers on document create/edit (module + permission gated); **Related records** section on document view. Playwright: `documents.workflow.spec.ts`.
- Docs: [documents overview](/user-guide/documents-overview), [developer guide](/developer-guide/documents), [API](/api/tenant-v1-documents).

## Platform polish — rich demo, workspace checklist, marketplace starters (2026-08-23)

- **SaaS-Backend:** `local:seed-demo --full` installs `config/local-demo.php` → `demo_modules`, chains `LocalReportsDemoDataService` + `LocalDemoCrossModuleStoryService` (Companies/Contacts linked to Leads, sales→billing chain, Help Desk ticket linked to KB). `--full` defaults off.
- **SaaS-Backend:** Workspace onboarding checklist — `onboarding_checklist` tenant setting, `GET/PATCH /settings/onboarding`, auto-detect for timezone/branding/first lead, mail-test + marketplace visit timestamps. Pest: `WorkspaceOnboardingTest`.
- **SaaS-Frontend:** Dismissible `WorkspaceChecklistCard` on tenant dashboard (owner/admin). Dashboard marketplace upsell widgets when starter modules are missing; Marketplace **Starter paths** section (CRM / Billing / Operations slug bundles).
- **SaaS-Docs:** [Local demo data](/getting-started/local-demo-data) `--full` section; changelog note.

## Platform polish — Knowledge Base attachments + AI tools (2026-08-23)

- **SaaS-Backend (A5):** `knowledge_base_article_attachments` table, model/policy/resource, `KnowledgeBaseArticleService::attachFile` on create/update (multipart `attachment` field), `GET /knowledge-base/attachments/{uuid}/download`, workspace storage `usedBytes()` integration. Catalog MINOR: `knowledge-base` **1.0.0 → 1.1.0**. Pest: `KnowledgeBaseAttachmentTest`.
- **SaaS-Frontend (A5):** Attachment file input on article create/edit; download links on article view.
- **SaaS-Backend (C2):** New AI tools — write: `update_lead_status`, `log_activity` (pending confirmation); read: `get_help_desk_open_tickets`, `get_expense_pending_approval`. Opportunity Copilot endpoints (`/ai/opportunities/{id}/summarize`, `next-action`, `draft-follow-up`). Extended `AiWriteConfirmationTest` + `AiAuthorizationTest`.
- **SaaS-Frontend (C2):** `OpportunityAiCopilotSection` on opportunity view; Ask EloSync starter chips on tenant dashboard (module-entitled prompts); shared `ai-starter-prompts` for panel + dashboard.
- Docs: [AI tools developer guide](/developer-guide/ai-tools).

## Billing docs sync — overview + production readiness (2026-08-23)

- **SaaS-Docs:** User-guide overviews for [Invoices](/user-guide/invoices-overview), [Estimates](/user-guide/estimates-overview), and [Quotations](/user-guide/quotations-overview) now list shipped **Download PDF** + **Email customer** capabilities and catalog versions (**1.8.0** / **1.5.0** / **1.6.0**). Removed stale “e-mail delivery deferred” bullets.
- **SaaS-Docs:** [Invoices production readiness](/deployment/invoices-production-readiness) — customer email marked **Shipped** (1.8.0); API and user guide cross-links.

## Expense receipt attachments (2026-08-23)

- **SaaS-Backend:** `expense_attachments` table, `ExpenseAttachment` model/policy/resource, `ExpenseService::attachReceipt` on create/update (multipart `receipt` field), `GET /expenses/attachments/{uuid}/download`, workspace storage `usedBytes()` integration, POST twin for multipart update. Catalog MINOR: `expenses` **1.2.0 → 1.3.0**.
- **SaaS-Frontend:** Receipt file input on expense create/edit; download links on expense view. Pest: `ExpenseAttachmentTest`.
- **SaaS-Backend:** Help Desk ticket attachments — `help_desk_ticket_attachments`, attach on create (`attachment` field), download route, storage usage. Catalog MINOR: `help-desk` **1.1.0 → 1.2.0**.
- **SaaS-Frontend:** Attachment input on ticket create; download on ticket view. Pest: `HelpDeskAttachmentTest`.
- Docs: developer guides + API snippets for both modules (user guide deferred list updates).

## Branded custom domain — SSL pending status (2026-08-23)

- **SaaS-Backend:** Custom domains track `ssl_provisioned_at` and `hosting_status` (`dns_pending` / `ssl_pending` / `active`). DNS verify leaves SSL pending until operator marks provisioned (`POST /api/central/v1/tenants/{tenant}/branded-domain/mark-ssl-provisioned` or `php artisan branded:mark-ssl-provisioned {hostname}`). Email/deep links use custom host only when SSL is provisioned. Grandfather migration sets `ssl_provisioned_at` for existing verified custom domains.
- **SaaS-Frontend:** Settings → Domain shows **Pending SSL certificate** after DNS verify until hosting is active.
- Docs: Branded user/deployment/API/developer guides; Central API route table.

## Short Links module (2026-08-23)

- **SaaS-Backend:** New free Operations module `short-links` (catalog **1.0.0**, not default-included). CRUD API, click analytics, public redirect `GET /r/{uuid}`, async click recording job, Pest coverage.
- **SaaS-Frontend:** List/create/view/edit pages, KPI strip, analytics section, nav gated by module + `short-links.view`. Playwright `test:e2e:short-links`.
- Docs: [user guide](/user-guide/short-links), [developer guide](/developer-guide/short-links), [API](/api/tenant-v1-short-links).
- **Short Links 1.1.0:** Public URLs use 7-character codes on `SHORT_LINK_BASE_URL` (e.g. `https://go.elosync.com/r/abc1234`). Legacy UUID redirects remain supported. Catalog bump **1.0.0 → 1.1.0**.

## Connected workflow polish — payment receipts + Help Desk ↔ Knowledge Base (2026-08-23)

- **SaaS-Backend:** Posted payments — `GET /payments/{id}/pdf` (receipt PDF) and `POST /payments/{id}/email` (`payments.send`, throttled like invoices). `CustomerPaymentPdfService`, `CustomerPaymentEmailService`, `Emailed` timeline event. Catalog PATCH: `payments` **1.1.0 → 1.2.0**.
- **SaaS-Frontend:** Payment record page — **Download receipt** + **Email receipt** (shared billing email dialog); Playwright coverage in `payments.workflow.spec.ts`.
- **SaaS-Backend:** Soft Help Desk ↔ Knowledge Base M2M (`help_desk_ticket_knowledge_base_article` pivot, `LinkableKnowledgeBaseArticle`, `knowledge_base_article_ids` on create/update, `PUT /help-desk/{id}/articles`, `articles_synced` timeline). Catalog MINOR: `help-desk` **1.0.0 → 1.1.0**.
- **SaaS-Frontend:** KB article multi-select on Help Desk create/edit; **Related articles** on ticket view; **Linked tickets** on article view when Help Desk is entitled; Playwright in `help-desk.workflow.spec.ts`.
- Docs: payments + Help Desk + Knowledge Base user/dev/API/deployment guides; roadmap deferred lists updated.

## Connected workflow polish — document prefixes + billing email (2026-08-23)

- **SaaS-Frontend:** Settings → General → **Document number prefixes** for entitled modules (invoices, payments, credit notes, estimates, purchase orders, expenses, assets, Help Desk). Playwright: `tenant-settings.number-prefixes.spec.ts`, `billing/connected-workflow-polish.spec.ts`.
- **SaaS-Backend:** `POST /invoices|estimates|quotations/{id}/email` — email customers with optional PDF attachment (requires document already sent). Activity timeline `emailed` event; tenant email logs. Queued mailable stores PDF as base64 so the `emails` queue payload serializes correctly.
- Catalog MINOR: `invoices` **1.8.0**, `estimates` **1.5.0**, `quotations` **1.6.0**.
- Docs: user guides, API, developer guides, tenant settings.

## Marketing site runtime config (2026-08-23)

- **saas-website:** API URL and marketing pixels (`NEXT_PUBLIC_*`) resolve from Forge `/config.js` (`window.env`) at runtime — same model as SaaS-Frontend. Local dev uses `.env.local` with `public/config.js` stub. CI no longer bakes pixel IDs into the static export.
- **Deploy:** Marketing Forge deploy script writes `config.js` from site `.env`; redeploy only (no CI rebuild) to change pixels or API URL.
- Docs: [Marketing pixels](/deployment/marketing-pixels), [Laravel Forge — Marketing](/deployment/laravel-forge#42-deploy-script-marketing).

## Entity search labels — name + company (2026-08-23)

- **SaaS-Frontend:** Shared `src/lib/entity-display.ts` helpers show **name — company** together in module search dropdowns (contacts, leads, opportunities, resellers), billing list Customer columns, invoice pickers, activity related columns, and record view cards — so duplicate person names are distinguishable by company.

## Marketing pixels scaffold (2026-08-22)

- **SaaS-Frontend:** `src/lib/marketing-pixels/` — optional env-gated GTM (existing), Meta Pixel, LinkedIn Insight Tag, and X Pixel; `initMarketingPixels()` + `MarketingPageView` for HashRouter SPA page views; Vitest coverage.
- **saas-website:** `MarketingScripts` / `MarketingPageView` with `NEXT_PUBLIC_*` vars; client navigations push GTM virtual page views + Meta/X PageView.
- **Deploy:** Forge `config.js` keys `VITE_META_PIXEL_ID`, `VITE_LINKEDIN_PARTNER_ID`, `VITE_X_PIXEL_ID` (alongside `VITE_GTM_ID`). No prod IDs required until operators enable each vendor.
- Docs: [Marketing pixels](/deployment/marketing-pixels).

## Mermaid diagrams on docs site (2026-08-22)

- Enabled [vitepress-plugin-mermaid](https://github.com/emersonbottero/vitepress-plugin-mermaid) so fenced Mermaid blocks render as diagrams (not code fences) across Deployment, Developer Guide, and User Guide pages (e.g. [Laravel Forge](/deployment/laravel-forge) topology chart).
- Dependencies: `mermaid`, `vitepress-plugin-mermaid`. Redeploy Docs from `build-artifacts` after CI rebuilds.

## WhatsApp Cloud media (2026-08-22)

Catalog MINOR: **`whatsapp-cloud` 1.2.0 → 1.3.0**.

- Inbound image/document/audio/video: webhook captures Meta media id; `DownloadWhatsAppMediaJob` stores privately under `tenants/{id}/whatsapp/...` and counts toward Storage quota (soft Storage gate).
- Outbound media inside the 24h window: `POST /whatsapp/conversations/{id}/media`; download via `GET .../attachments/{id}`.
- SPA inbox: attach control + attachment download links.
- Pest: `WhatsAppMediaTest`.
- Production readiness: [WhatsApp Cloud production readiness](/deployment/whatsapp-cloud-production-readiness) — **Go** (inbound MIME/quota gates, attachment IDOR Pest, CatalogSeeder versions, Automation WA trigger e2e).

## WhatsApp Automation triggers (2026-08-22)

Catalog MINOR: **`automation` 1.0.0 → 1.1.0**, **`whatsapp-cloud` 1.1.0 → 1.2.0**.

- Trigger `whatsapp.message_received` (wired; requires `whatsapp-cloud`) via `WhatsAppMessageReceived` → `IntegrationEventDispatcher`.
- Action `send_whatsapp_template` (wired; requires `whatsapp-cloud`) — resolves conversation by `conversation_id` or `lead_id`.
- Pest: `WhatsAppAutomationTest`.

## WhatsApp Lead Source Driver (2026-08-22)

Catalog MINOR: **`whatsapp-cloud` 1.0.0 → 1.1.0**.

- Opt-in connection settings: `auto_create_leads` (default off) + `default_lead_source` (default `WhatsApp`).
- Inbound messages for unlinked conversations create/link Leads via `WhatsAppCloudLeadSourceDriver` (`source_reference = whatsapp_cloud`, `external_id = customer_wa_id`) when Leads is entitled.
- API: `PATCH /whatsapp/integrations`; SPA settings toggle on the WhatsApp page when Leads is installed.
- Pest: auto-create / duplicate link / Leads-not-entitled / settings update cases in `WhatsAppCloudModuleTest`.

## Custom Central path + failed-login alerts (2026-08-22)

- Per-install WHMCS-style Central SPA prefix: `VITE_CENTRAL_PATH_PREFIX` (SPA `config.js`) + matching API `CENTRAL_PATH_PREFIX` for password-reset / verify deep links. Default remains `central`. API stays `/api/central/v1`.
- Failed Central login (and lockout) emails go to the targeted admin and platform `support_email` (throttled for ordinary failures; lockouts always notify).

## Feedback detail page + Feature Board parked (2026-08-22)

- Tenant reporters get a dedicated feedback detail page (`/#/feedback/{uuid}`) with public comments, attachments, and a public status/module activity timeline (never internal notes or triage priority).
- My submissions in Give Feedback links to the detail page; status/public-reply email CTA deep-links to the same page.
- **Feature Board** (shared sanitized ideation across tenants) documented as **Parked** on the product roadmap — distinct from Give Feedback / Help Desk / Central triage; do not open raw cross-tenant feedback lists.
- Docs: Give Feedback user guide, Central Feedback System, Product Roadmap, this changelog.

## Notifications list and filters (2026-08-22)

- Bell dropdown shows **unread only** (up to 20); marking read removes the row so the next unread can fill in.
- Full page `/#/notifications` with status (all / unread / read) and date-from / date-to filters; Mark all read.
- API `GET /notifications` accepts `status`, `date_from`, `date_to`; list responses include standard pagination `meta`.
- Pest: `NotificationIndexFilterTest`. Docs: tenant notifications API + Tenant Application user guide.

## Accounting production readiness (2026-08-22)

Catalog PATCH: **`accounting` 1.6.0 → 1.6.1**, **`financial-reports` 1.1.0 → 1.1.1**.

- Invoice send/void: atomic with accrual journal post/void; period lock checked before status change; unpaid invoices without a JE can be repaired via send.
- Year-end close: zeros revenue/expense into Retained Earnings `3100` (multi-line), idempotent, period lock in the same transaction.
- Aged receivables: historical open balance as of date (payments/credits dated on or before `as_of`).
- Bank reconciliation: book balance as of statement date; excludes previously cleared lines; complete requires cleared = statement.
- GL CSV export: uncapped filtered stream; period unlock requires `accounting.void`; opening balances / bank rec SPA gated by `post` / `create`.

## Bank reconciliation and aged receivables (2026-08-22)

Catalog MINOR: **`accounting` 1.5.0 → 1.6.0**, **`financial-reports` 1.0.1 → 1.1.0**.

- Bank reconciliations API: start against cash/bank, clear lines, complete.
- Aged receivables report: `GET financial-reports/aged-receivables` (+ SPA report kind).

## Fiscal periods and year-end close (2026-08-22)

Catalog MINOR: **`accounting` 1.4.0 → 1.5.0**.

- Setting `fiscal_year_start_month` (1–12) under General.
- Accounting periods CRUD + lock/unlock; journal post/void blocked in locked periods.
- Year-end close posts net income into Retained Earnings `3100` and locks the FY period.
- Balance Sheet Net Income uses fiscal YTD.

## Chart hierarchy, headers, opening trial balance (2026-08-22)

Catalog MINOR: **`accounting` 1.3.0 → 1.4.0**.

- Accounts: `is_header` (non-postable), parent account on create/edit UI; starter CoA adds Tax Payable `2100` and Retained Earnings `3100`; existing workspaces get missing system accounts via `ensureMissingSystemAccounts`.
- Opening balances: `POST /accounts/opening-balances` posts a balanced multi-line journal; SPA `/accounts/opening-balances`.
- Header accounts rejected on journal lines.

## Accrual invoice and credit-note journals (2026-08-22)

Catalog MINOR: **`accounting` 1.2.1 → 1.3.0**. Soft optional deps: invoices → accounting, credit-notes → accounting.

- Invoice **send**: when Accounting entitled, posts Dr AR `1100` / Cr Sales Revenue `4000` for invoice total; stores `journal_entry_id`; cancel voids the JE.
- Credit note **apply**: posts Dr Revenue / Cr AR for credit total; stores `journal_entry_id` (applied remains irreversible).
- Payment post still Dr cash / Cr AR (settles receivable booked on send).
- No historical backfill for invoices issued before entitlement.
- Pest: `CustomerInvoiceAccountingTest`, `CustomerCreditNoteAccountingTest`.

## Accountant format presentation + CSV export (2026-08-22)

Catalog PATCH: **`accounting` 1.2.0 → 1.2.1**, **`financial-reports` 1.0.0 → 1.0.1**.

- Journals: classic Account / Debit / Credit / Memo grid on create/edit/view; list Amount column; currency formatting with blank zero Dr/Cr cells.
- General Ledger: currency columns, journal deep links, **Export CSV**.
- Financial Reports: currency formatting, classic two-pane Balance Sheet with Assets = L+E check, report chrome; **Export CSV** for TB / P&amp;L / BS.
- API: `GET general-ledger/export`, `GET financial-reports/{trial-balance|profit-and-loss|balance-sheet}/export` (streamed CSV).
- Pest: FinancialReportTest export cases.

## Account set balance / opening adjust (2026-08-21)

Catalog MINOR: **`accounting` 1.1.0 → 1.2.0**.

- Cash/bank **Set balance**: enter target + date; system posts delta journal (`ADJ-`) via `CashMovementJournalService`; default offset Owner Equity `3000`.
- First-class `account_balance_adjustments` (voidable history); never edits a stored balance column.
- API: `POST /accounts/{account}/balance-adjustments`, list/show/void under `/account-balance-adjustments`.
- SPA: account view Set balance dialog + Balance adjustments list/void.
- Pest: `AccountBalanceAdjustmentTest`.
- Docs: Accounting user / overview / API / developer guides; this changelog.

## Cash & bank money movements (2026-08-21)

Catalog MINOR bumps: **`accounting` 1.0.0 → 1.1.0**, **`payments` 1.0.1 → 1.1.0**, **`expenses` 1.1.0 → 1.2.0**. Soft optional deps: payments → accounting, expenses → accounting.

- Accounts: `is_cash_bank` (asset only; starter Cash `1000` flagged), current **balance** on list/show, filter `?is_cash_bank=1`.
- Shared `CashMovementJournalService` — create+post / void two-line journals.
- Payments: `deposit_account_id` + auto JE on post (Dr deposit / Cr AR); void voids JE. SPA **Deposit to** picker when Accounting installed.
- Expenses: on pay, `paid_from_account_id` (required with Accounting) + optional `expense_account_id` (default `6000`); JE Dr expense / Cr paid-from. SPA Mark as paid dialog.
- Account transfers (`TRF-`): Finance → Transfers; create posts Dr to / Cr from; void reverses. API `/account-transfers`.
- Pest: `CashBankAccountTest`, `AccountTransferTest`, `CustomerPaymentAccountingTest`, `ExpenseAccountingTest`. Playwright accounting suites include Transfers smoke.
- Docs: Accounting / Payments / Expenses user + API + developer guides; this changelog.

## AI tools depth + Ask EloSync starters (2026-08-21)

Catalog MINOR: **`ai` 1.0.1 → 1.1.0**.

- Read tools: Projects (`search_projects`, `get_project`, `get_overdue_projects`), Opportunities (`search_opportunities`, `get_pipeline_summary`), Invoices (`get_overdue_invoices`, `get_invoice_balance_summary`); tool rows include numeric `id` + `uuid`.
- `ProjectService` list supports `overdue=true` (planned/active/on_hold with `ends_on` before workspace-local today).
- Ask EloSync empty-state starter chips (module **and** view-permission gated); citation hrefs allowlisted via `isSafeRedirectPath` and suppressed for unentitled modules.
- Pest: `tests/Feature/Tenant/Ai/AiReadToolsTest.php` (positive `availableFor` + project module install); Vitest `src/lib/ai-reference-href.test.ts`; Playwright starter chip click.
- Production readiness: [AI Assistant](/deployment/ai-production-readiness) — **Go** (R5/L1–L3 closed).
- Docs: [AI tools](/developer-guide/ai-tools), [User guide](/user-guide/ai-assistant), [Tenant AI API](/api/tenant-v1-ai).

## Tasks assignee picker ignores lead-exclude flag (2026-08-21)

- Task create/edit/view assignee pickers no longer hide users flagged **Exclude from lead assignment** (or workspace owners). That flag remains leads-only.
- SPA: `filterTaskAssigneeOptions` (suspended only); Vitest `src/lib/task-assignees.test.ts`.
- Docs: [Tasks user guide](/user-guide/tasks#assignment), [Tasks developer guide](/developer-guide/tasks), [API](/api/tenant-v1-tasks).

## Tenant API & Webhooks (2026-08-21)

Platform Settings → **Developers** (permission `settings.manage_developers`):

- Integration API tokens: Sanctum PATs (`es_…`, shown once) for `/api/tenant/v1`; create / list / rotate / revoke.
- Outbound event webhooks: subscribe to CRM/Sales/Meeting/Invoice events; signed envelope; delivery ledger; Send test; SSRF-safe POSTs on queue `webhooks`.
- Shared `SignedOutboundHttpClient`; Automation webhook action reuses it (body-only HMAC kept for BC).
- Pest: `tests/Feature/Tenant/Developers/*`, `tests/Unit/Http/SignedOutboundHttpClientTest.php`.
- Playwright: `e2e/tests/settings/tenant-settings.developers.spec.ts` (full one-login workflow; `npm run test:e2e:developers`).
- Docs: [User guide](/user-guide/tenant-settings#developers), [Developer guide](/developer-guide/tenant-api-webhooks), [API](/api/tenant-v1-developers), [Production readiness](/deployment/tenant-api-webhooks-production-readiness) — **Go** (migrate-first).

## AI Test connection empty model fallback (2026-08-21)

- Central/Tenant Test AI no longer sends OpenAI an empty model when Default model is blank; resolver falls back to `gpt-4o-mini` / `gpt-4o`.
- SPA test payloads omit blank provider/model fields.
- Central (and tenant BYOK) Settings → AI: Default / Fast / Advanced models are searchable dropdowns scoped to the selected provider; switching provider resets incompatible models to suggested defaults.

## AI Test connection agent API fix (2026-08-21)

- Fixed Central/Tenant **Test AI connection** calling non-existent `Ai::text()` (laravel/ai v0.10 uses agents). Now uses `AiConnectionTestAgent::prompt()`.
- Pest: `tests/Feature/AiTestConnectionTest.php`.

## AI Assistant production readiness 1.0.1 (2026-08-21)

Catalog PATCH: **`ai` 1.0.0 → 1.0.1**.

- Credit integrity: wallet `lockForUpdate` on burn/grant/rollover; pre-provider credit ceiling + agent `maxTokens` cap; `ensurePeriod()` on chat, Lead Copilot, and credits summary.
- RBAC: Settings AI update/test require `ai.manage`; SPA AI tab gated by module + `ai.manage`.
- Rate limit: `throttle:ai` (30/min) on message send and Lead Copilot routes.
- Production readiness: [AI Assistant](/deployment/ai-production-readiness) — **Go**.

## AI Assistant platform foundation (2026-08-21)

Catalog: billable **`ai`** module v1.0.0 plus prepaid packs `ai-credits-1k`, `ai-credits-5k`, `ai-credits-20k` (depend on `ai`).

- Tenant API: conversations, messages, credit wallet, Lead Copilot, pending write confirmation (`ai.use`, `ai.confirm`, `ai.manage`).
- Platform billing: dual-balance wallet (included monthly + prepaid packs), prorated activation grant, rollover command `ai:rollover-monthly-credits`, HTTP 402 when credits exhausted.
- BYOK + Central provider resolution via `AiConfigResolver`; API keys masked in settings responses.
- Pest: `tests/Feature/Tenant/Ai/*`, `tests/Unit/AI/AiConfigResolverTest.php`.
- Playwright: `npm run test:e2e:ai` — one demo login session covering AI entitlement, Settings → AI validation/save, Ask EloSync send (graceful provider errors), and Lead Copilot summarize.
- Docs: [AI platform](/architecture/ai-platform), [AI tools](/developer-guide/ai-tools), [AI credits](/developer-guide/ai-credits), [Tenant AI API](/api/tenant-v1-ai), [User guide](/user-guide/ai-assistant), [AI deployment](/deployment/ai).

## Form 422 validation visibility (all tenant modules) (2026-08-20)

- Server validation errors (HTTP 422) now always toast the first API message and map onto react-hook-form fields via shared `applyServerValidationErrors` (tenant CRUD forms plus auth, settings, email, users, and related dialogs).
- Assignee pickers filter ineligible users (workspace owners / excluded assignees) and show `assigned_to` field errors; quotation/estimate opportunity auto-fill only copies eligible assignees (fixes silent create failures).
- Vitest covers the shared helper; Playwright dismisses multi-unread announcement inboxes so create actions stay clickable on the shared demo workspace.

## Branded PDF long line-body pagination (2026-08-20)

Catalog PATCH bumps (old → new): **quotations 1.5.1 → 1.5.2**, **estimates 1.4.1 → 1.4.2**, **invoices 1.7.1 → 1.7.2**.

- Dompdf no longer clips long line-item body HTML off-page. Each pricing row stays in a short table; line body is a block-level `.line-body` below so multi-page scope text paginates.
- Same layout fix on quotation, estimate, and invoice PDF Blade templates.
- Pest: long quotation line body asserts more than two `/Type /Page` objects.

## Branded PDF long-notes pagination (2026-08-20)

Catalog PATCH bumps (old → new): **quotations 1.5.0 → 1.5.1**, **estimates 1.4.0 → 1.4.1**, **invoices 1.7.0 → 1.7.1**.

- Dompdf no longer clips long Notes / Terms & Conditions to ~2 pages. Totals stay in a short right-aligned block; memo HTML is rendered as full-width blocks below so multi-page content paginates.
- Same layout fix on quotation, estimate, and invoice PDF Blade templates.
- Pest: long quotation notes assert end-marker text is present and the PDF has more than two `/Type /Page` objects.

## Dedicated record pages UX — production Go (2026-08-20)

- Production readiness: [Dedicated record pages UX](/deployment/dedicated-record-pages-production-readiness) — **Go** (form validation visibility + Playwright hardeners remediated; migrate-first).
- Required-field errors now surface on floating inputs for Employees, Payroll profiles, and Reseller commission rates.
- Playwright: shared-demo authz skips, settings load retry, email empty-state / opt-in IMAP, team-chat settings save/delete hardeners, journal search after create.

## Floating labels, search clear, semantic status badges (2026-08-20)

- Form text fields use **floating labels** (`FloatingInput` / `FloatingTextarea`) on tenant create/edit pages.
- Module list search (`Ctrl/⌘+F`) no longer shows two clear (X) icons — native browser clear is hidden; only the app clear button remains.
- Status badges use semantic colors (paid/posted/accepted → green, unpaid/partial/pending → amber, sent → sky, cancelled/void → red) instead of the tenant brand primary for every “positive” status.

## Local demo login + shared Playwright tenant (2026-08-20)

- Local Vite prefills `/central/login` with `superadmin@saas.com` / `password` and `/login` with `demo@demo.com` / `password` (dev builds only).
- `php artisan migrate:fresh --seed` (`APP_ENV=local`) also runs `local:seed-demo` and creates the **demo-crm** workspace owned by `demo@demo.com`.
- Playwright tenant suites sign in to that shared demo workspace via `E2E_DEMO_*` (see Frontend `.env.e2e.example`).
- Docs: [Installation](/getting-started/installation), [Local Demo Data](/getting-started/local-demo-data).

## Dedicated record pages UX (all tenant CRUD modules) (2026-08-20)

Catalog MINOR bumps (old → new): **leads 1.2.1 → 1.3.0**, **tasks 1.2.0 → 1.3.0**, **invoices 1.6.1 → 1.7.0**, **payments 1.0.1 → 1.1.0**, **quotations 1.4.1 → 1.5.0**, **estimates 1.3.3 → 1.4.0**, **contracts 1.2.1 → 1.3.0**, **products 1.2.0 → 1.3.0**, **expenses 1.1.0 → 1.2.0**, **documents 1.1.0 → 1.2.0**, **opportunities 1.1.1 → 1.2.0**, **todos 1.1.1 → 1.2.0**, **attendance 1.0.1 → 1.1.0**, and **1.0.0 → 1.1.0** for remaining migrated modules (companies, contacts, credit-notes, purchase-orders, projects, meetings, activities, announcements, knowledge-base, help-desk, assets, warehouses, inventory, vendors, employees, departments, leave-management, payroll, accounting, resellers, reseller-payouts).

- Tenant CRUD uses **list + dedicated create/view/edit pages** with stacked cards (`RecordPage` / `RecordSection` / `FormSubmitSplit`). Dialogs remain only for secondary flows (confirm, import, tags/categories).
- Create/edit forms use **separate submit buttons** (no dropdown): **Create** (return to list) and **Create & View**; edit uses **Save**, **Save & View**, and **Save & return to list**. Invoices add **Create & Send** / **Save & Send**; payments add **Post** (save then post).
- Old query deep links (`/invoices?invoice=12`) **redirect** to `/invoices/12`. List **filters** such as `/payments?invoice=` and `/credit-notes?invoice=` are unchanged.
- Notification hrefs and backend task/lead route resolvers emit path URLs (`/tasks/:id`, `/leads/:id`).
- Blueprint: mirror **Leads** pages — [Module Development](/developer-guide/module-development), [Shared Layout](/developer-guide/shared-layout).

## Dedicated record pages: Products, Vendors, HR modules (2026-08-20)

- Products, Vendors, Employees, Departments, Leave requests, and Attendance now use dedicated create, view, and edit pages (same pattern as Expenses) instead of form dialogs and detail sheets. Product categories, leave types, and leave review stay as dialogs.
- Vendor assignment notifications deep-link to `/vendors/:id`. Query-param list redirects (`?product=`, `?vendor=`, `?employee=`, `?department=`, `?request=`, `?record=`) still land on the record page.
- Docs: [Products](/user-guide/products), [Vendors](/user-guide/vendors), [Employees](/user-guide/employees), [Departments](/user-guide/departments), [Leave Management](/user-guide/leave-management), [Attendance](/user-guide/attendance).

## Dedicated record pages for operations modules (2026-08-20)

- Announcements, Knowledge Base, Help Desk, Documents, Assets, and Warehouses now use dedicated create, view, and edit pages (same pattern as Expenses) instead of form dialogs and detail sheets. Category dialogs stay as secondary flows.
- Notification deep links go to `/announcements/:id`, `/help-desk/:id`, and `/assets/:id`. Query-param list redirects (`?announcement=`, `?ticket=`, `?article=`, `?document=`, `?asset=`, `?warehouse=`) still land on the record page.
- Docs: [Announcements](/user-guide/announcements), [Knowledge Base](/user-guide/knowledge-base), [Help Desk](/user-guide/help-desk), [Documents](/user-guide/documents), [Assets](/user-guide/assets), [Warehouses](/user-guide/warehouses).

## Sales document convert integrity hardening (2026-08-19)

Catalog versions: **quotations 1.4.1**, **contracts 1.2.1**, **estimates 1.3.3**, **invoices 1.6.1**.

- Quote/estimate convert uses row locks (`lockForUpdate`) so concurrent converts cannot double-bill.
- Unique nullable `customer_invoices.estimate_id` enforces one-shot estimate convert at the database.
- Estimate convert soft-checks Invoices entitlement (same pattern as quotes/contracts).
- Soft-deleted invoices still block one-shot convert; API errors tell operators to restore or permanently delete.
- Contract progress billing: second and later invoices require `acknowledge_repeat_billing=true` (SPA confirm sends it).
- Go-live: [Sales document convert production readiness](/deployment/sales-document-convert-production-readiness) — **Go**.

## Invoices: auto-fill next recurring date from frequency (2026-08-19)

- Turning on **Recurring invoice** (or changing weekly / monthly / quarterly / semi-annually / yearly) fills **Next invoice date** one period after the issue date (or today). The date stays editable.
- Docs: [Invoices user guide](/user-guide/invoices).

## Sales documents: convert quotations and contracts to invoices (2026-08-18)

Catalog versions: **quotations 1.4.0**, **contracts 1.2.0**, **invoices 1.6.0**, **estimates 1.3.2**.

- **Quotations:** one-shot **Convert to invoice** (sent or accepted) when Invoices is installed. Copies lines, links `quotation_id`, auto-accepts if sent, then hides convert. Soft Invoices entitlement (like PO → expense) — not a Marketplace hard dependency.
- **Contracts:** repeatable **Create invoice** from **Active** contracts. Copies linked quotation lines, or a single line from contract `value`. Sets `customer_invoices.contract_id`. Warns if the linked quotation already has an invoice; the API still allows more contract invoices.
- **Estimates:** convert stays one-shot. Blocked with 422 if the linked quotation is already invoiced (quote convert, prior estimate convert, or a contract invoice that copied `quotation_id`).
- Permissions: `quotations.convert` and `contracts.convert` (admin/manager). `customer_invoices.quotation_id` is **not** unique.
- Docs: [Quotations](/user-guide/quotations), [Contracts](/user-guide/contracts), [Estimates](/user-guide/estimates), [Invoices](/user-guide/invoices); matching API + developer guides; [Module Dependencies](/architecture/module-dependencies).

## Contracts: opportunity auto-fill and rich HTML memos (2026-08-18)

Catalog version: **contracts 1.1.0**.

- Creating a contract: selecting an **Opportunity** auto-fills title (when empty), party name (from contact or company), value, currency, and assignee when those are set on the opportunity.
- **Linked quotation:** auto-selected only when that opportunity has exactly one quotation; with multiple quotations, leave unset for manual choice.
- New **description** field plus existing **notes** use TipTap rich HTML (headings, lists, bold/italic/underline), sanitized on save and display. Timeline comments stay plain text.
- Docs: [Contracts user guide](/user-guide/contracts), [Contracts API](/api/tenant-v1-contracts), [Contracts developer guide](/developer-guide/contracts). Go-live: [Contracts 1.1.0 production readiness](/deployment/contracts-production-readiness) — **Go** (migrate-first).

## Products: auto-generated SKU (2026-08-18)

Catalog version: **products 1.2.0**.

- Creating a product auto-fills the next SKU (`SKU-00001` style). You can override it or click **Generate SKU** to refresh.
- API: `sku` is optional on create; omit/blank to auto-assign. `GET /products/next-sku` returns the preview. Optional tenant setting `products_sku_prefix`.
- Docs: [Products user guide](/user-guide/products), [Products API](/api/tenant-v1-products), [Products developer guide](/developer-guide/products).

## Billing product line picker — production ready (2026-08-18)

Catalog versions: **products 1.1.1**, **quotations 1.3.1**, **estimates 1.3.1**, **invoices 1.5.1**.

- Hardened `LinkableProduct`: requires `products.view` (or superadmin), rejects soft-deleted and inactive products.
- `DocumentHtmlSanitizer` strips inline `style` and neutralizes `data:` / `javascript:` hrefs.
- Billing line picker uses server-side product search with `status=active` (SPA).
- Pest coverage for estimate/invoice entitlement reject, convert + recurring `product_id`, sanitizer cases.
- Playwright: clear product without wiping edited name; picker hidden without Products.
- Canonical audit: [Billing product line picker production readiness](/deployment/billing-product-line-picker-production-readiness) — **Go** (migrate-first).

## Billing product line picker — production readiness draft (2026-08-18)

- Canonical go-live audit draft (superseded by **Go** note above).
- `database.md` quotation / estimate / invoice line schemas updated for `name` / `body` / optional `product_id`.

## Billing documents: product line picker (2026-08-18)

Catalog versions: **quotations 1.3.0**, **estimates 1.3.0**, **invoices 1.5.0**.

- Optional **product** on quotation, estimate, and invoice lines (when Products is installed).
- Selecting a product in the form auto-fills **name**, rich **details** (from product description), and **unit price**; you can still edit those fields afterward.
- Clearing the product link does not wipe edited line text. The API stores the client-sent values plus optional `product_id` (no server-side re-copy from the product catalog on save).
- Docs: [Quotations](/user-guide/quotations), [Estimates](/user-guide/estimates), [Invoices](/user-guide/invoices); matching API + developer guides.

## Products: rich HTML description (2026-08-18)

Catalog version: **products 1.1.0**.

- Product **description** uses TipTap rich HTML (headings, lists, bold/italic/underline), sanitized on save and display.
- Docs: [Products user guide](/user-guide/products), [Products API](/api/tenant-v1-products), [Products developer guide](/developer-guide/products).

## Billing documents: HTML line details & terms (2026-08-18)

Catalog versions: **quotations 1.2.0**, **estimates 1.2.0**, **invoices 1.4.0**.

- Line **body** uses the same TipTap rich HTML editor as document notes (headings, lists, bold/italic/underline).
- New document field **Terms & conditions** (HTML) on quotations, estimates, and invoices — shown on detail overview and branded PDFs under Notes.
- Server sanitizes notes, terms, and line bodies on save; PDFs render sanitized HTML for line details and terms.
- Docs: [Quotations](/user-guide/quotations), [Estimates](/user-guide/estimates), [Invoices](/user-guide/invoices); API + developer guides.

## Estimate create: opportunity auto-fill and quotation pick (2026-08-18)

- Creating an estimate: selecting an **Opportunity** auto-fills Contact, Company, and Assignee when set on the opportunity.
- **Linked quotation:** auto-selected only when that opportunity has exactly one quotation; with multiple quotations, leave unset for manual choice.
- Docs: [Estimates user guide](/user-guide/estimates).

## Quotation create: auto-fill from opportunity (2026-08-18)

- Creating a quotation: selecting an **Opportunity** auto-fills Contact, Company, and Assignee when those fields are set on the opportunity (still editable afterward).
- Docs: [Quotations user guide](/user-guide/quotations).

## Billing documents: line name/body, shared discounts, rich notes, PDFs (2026-08-18)

Catalog versions: **quotations 1.1.0**, **estimates 1.1.0**, **invoices 1.3.0**.

- Line items use short **name** (required) plus optional long **body** under the row (UI + PDF). Former `description` column renamed.
- Shared document `line_discount_type` (`none` \| `percent` \| `fixed`) applies to every line; each line has only `discount_value`. `discount_total` is the sum of line discounts (no separate document-level discount amount). Tax after discounts; `total = subtotal − discount_total + tax_total`.
- Rich HTML notes (headings, lists, bold/italic/underline) on document memos via TipTap; sanitized on display and PDF.
- Downloadable branded PDFs for quotations and estimates (same branding as invoices).
- Invoice PDF: discount rows, payments received table for posted allocations, PARTIAL status chip when partially paid.
- UI: line grid Name | Qty | Unit price | Discount | Tax | Total + body; shared totals panel (subtotal / discount / tax / total; invoices also paid / credits / balance). Invoice list/detail shows **Partial** badge when unpaid with `amount_paid > 0` and `balance_due > 0` (DB status stays `unpaid`).
- Docs: [Quotations user guide](/user-guide/quotations), [Estimates user guide](/user-guide/estimates), [Invoices user guide](/user-guide/invoices); [Quotations API](/api/tenant-v1-quotations), [Estimates API](/api/tenant-v1-estimates), [Invoices API](/api/tenant-v1-invoices); [Quotations developer guide](/developer-guide/quotations), [Estimates developer guide](/developer-guide/estimates), [Invoices developer guide](/developer-guide/invoices).

## Payments allocation picker UX (2026-08-17)

Catalog version: **payments 1.0.1** (PATCH — allocation picker labels + auto-fill).

- Create/edit payment: invoice allocation options show **contact · company · invoice number — balance due**.
- Search allocations by contact name, company name, or invoice number.
- Selecting an invoice auto-fills Contact, Company, and Assignee from that invoice when those fields exist (still editable afterward).
- Docs: [Payments user guide](/user-guide/payments), [Payments developer guide](/developer-guide/payments).

## Module notes and activity newest-first (2026-08-17)

- Show payloads for Leads, Tasks, and other modules with notes/comments and domain activity history return those collections **newest-first** (`created_at`, then `id`).
- Aligns detail-sheet tabs with existing `GET …/timeline` ordering (and Reseller, which already used `latest()`).
- Feedback ticket comments remain oldest-first (conversation thread).
- Playwright: Leads/Tasks detail flows assert newest note/comment first; Lead Import e2e enables the free **Storage** module before CSV upload.
- **Audit residuals remediated:** broader Pest coverage (Contact/Company/Opportunity + all-model relation dataset), API show contract documented newest-first, composite indexes on `*_notes` / lead assignment histories for DESC order (no hard embed limit).
- Production readiness: [Newest-first notes & activity](/deployment/newest-first-notes-activity-production-readiness) — **Go** (L1–L3 remediated).

## Founding Beta invites (2026-08-17)

- Central **Beta Applications** can accept an applicant and send, copy, or resend a time-limited workspace registration invite.
- Accepted applicants register with `invite_token` while public registration remains disabled; tokens are hashed, single-use (via `activated_at`), expiry-checked, and tied to the application email. After activation the hash is retained so the same link shows “already activated”.
- The public beta page can self-resend an eligible invite without revealing whether an application exists.
- General settings add `founding_beta_enabled`, `founding_beta_apply_url`, and `founding_beta_invite_ttl_days`; public bootstrap exposes these non-secret values for registration-closed CTA behavior.
- Playwright: `npm run test:e2e:beta-applications` — one Central admin session covering settings validation, registration-closed CTA, invite issue, invite register validation/activation, and expired + Central resend.
- Production readiness: [Founding Beta invite](/deployment/founding-beta-invite-production-readiness) — **Go** (H1–H3 / M2 / M4 / L1 / L5 remediated).

## Tenant Impersonation history and Audit Logs (2026-08-17)

Central tenant details now surfaces real history instead of empty placeholders:

- **Impersonation** tab: `GET /tenants/{tenant}/impersonation-sessions` (`impersonation.list`) — reason, admin, start/end, duration; **Active** / **Ended** / **Expired** status from `is_active` / `is_expired`.
- **Audit Logs** tab: `GET /tenants/{tenant}/audit-logs` (`tenants.read`) — platform `activity_log` rows for the workspace; list **`properties` allowlisted** (reason, session ids, duration, tenant/actor/ip) with `before` / `after` blobs omitted from API responses.
- Frontend: Central resume after end (`resumeToken` in `sessionStorage` + `skipSessionExpiry` on end); **Impersonation** and **Audit Logs** tabs permission-gated with restricted empty states; **ErrorState** + retry on failed fetches.
- Backend: `ImpersonationSession::isActive()` / `isExpired()` honour `expires_at`; MySQL virtual column + index on `activity_log.properties->tenant_id` for tenant audit list filters.
- Production-readiness residuals **M1 / L1 / L2 / L3 remediated** — [Tenant Audit & Impersonation History](/deployment/tenant-audit-impersonation-production-readiness) — **Go**.

## Central defaults: SalesOS → EloSync (2026-08-17)

- Central `SystemSettingsSeeder` `app_name` / `company_name` defaults are **EloSync** (were still `SalesOS`).
- Idempotent migration renames leftover `SaleOS` / `SalesOS` values only; custom Central branding is unchanged.
- `config('app.name')` fallback is `EloSync` when `APP_NAME` is unset.

## Press-kit brand defaults (2026-08-17)

Platform shell, favicon, web push chrome, and non-Branded email headers use the marketing press-kit **App Store light** icon (`/brand/elosync-app-icon-light.png`) when no Central/tenant branding upload is set. Custom logo/favicon uploads still override. `WEBPUSH_ICON` / `WEBPUSH_BADGE` / `BRAND_DEFAULT_ICON` default to that path relative to `FRONTEND_URL`.

## Documents module 1.1.0 (2026-08-17)

Catalog version: **documents 1.1.0** (MINOR — bulk soft delete + bulk force delete + uploader ownership).

- `POST /documents/bulk-delete` (`documents.delete`) and `POST /documents/bulk-force-delete` (`documents.force.delete`); max 100 ids; returns `processed` / `failed`.
- Force delete (single + bulk) requires the document to already be soft-deleted (Assets parity).
- **Ownership:** delete / force delete only for the uploader (`created_by`) or workspace owner (`superadmin`); permission alone is not enough for another user’s file.
- SPA: row selection on Active / Deleted-only lists with bulk Delete and Delete permanently toolbar actions (selection limited to deletable rows).
- Docs: user / API / developer / deploy notes; production readiness remains Go.

## Documents module 1.0.1 (2026-08-17)

Catalog version: **documents 1.0.1** (PATCH — production-readiness remediations).

- Restore re-checks Storage quota; multipart file replace via `POST /documents/{id}`.
- Soft-deleted documents join workspace trash retention (`TrashPurgeRegistry` + `trash:purge-expired`); `forceDeleting` removes disk objects (API + purge).
- Platform audit: `document_restored`, `document_force_deleted` (plus existing create/update/delete).
- Canonical go-live: [Documents production readiness](/deployment/documents-production-readiness) — **Go**.

## Documents module 1.0.0 (2026-08-16)

Catalog version: **documents 1.0.0** (new free Operations Marketplace opt-in; `is_default_included = false`, `is_billable = false`; **hard** dependency on Storage).

- Flat internal document library: upload, categorize, download, soft delete / restore / force delete.
- Categories are flat (no nested folders); soft/force delete blocked while documents still reference the category.
- Uploads via `FileUploadService`; `WorkspaceStorageService::usedBytes()` includes active `documents.size_bytes` (soft-deleted excluded).
- Permissions: `documents.view|create|update|delete|restore|force.delete` — admin defaults exclude force.delete; manager = view/create/update; staff = view.
- To make billable later: Central → Modules → Documents → set `is_billable` + prices (existing Update Module API; no new Central UI).
- Deferred: soft record links, nested folders, versioning, preview, dashboard widget, Automation triggers.
- Docs: [overview](/user-guide/documents-overview), [user](/user-guide/documents), [developer](/developer-guide/documents), [API](/api/tenant-v1-documents), [deployment](/deployment/documents), [production readiness](/deployment/documents-production-readiness), [roadmap](/getting-started/product-roadmap)

## Product roadmap — Future Expansion tiers (2026-08-16)

Documentation + marketing alignment (no new Marketplace SKU).

- [Product Roadmap](/getting-started/product-roadmap) **Future Expansion** rewritten into **Near-term** (Documents → API & Webhooks → on-demand Customer Portal / Recruitment; WhatsApp post-MVP polish), **Parked** (marketing campaigns, portals/finance depth, AI planning, report builder), and **Out of active scope** (Manufacturing, QA, POS, E-Commerce) unless tenant demand forces them.
- Founding Beta roadmap relationship and Getting Started index updated for Business Operating System framing (not an open-ended ERP ladder).
- Marketing site roadmap / marketplace placeholders aligned: next focus **Documents**; POS and email-campaign cards removed from “planned” marketplace teasers.

## Assets module 1.0.0 (2026-08-16)

Catalog version: **assets 1.0.0** (new free Operations Marketplace opt-in; `is_default_included = false`, `is_billable = false`; **no** hard module dependencies).

- Equipment / fixed-asset register: auto-number (`AST-`), status, category, identity + purchase/warranty fields, free-text location, assignment, notes/timeline.
- Soft optional Vendor / Employee links (`LinkableVendor`, `LinkableEmployee`).
- Assignee eligibility matches CRM lead pool (owners excluded for explicit assign; create still defaults to creator).
- Permission grant migrate hardened against concurrent `role_has_permissions` unique races.
- Deferred: depreciation/Accounting, Products/Inventory/Warehouse FKs, Help Desk maintenance, attachments/barcodes, dashboard widget, Automation triggers.
- Docs: [overview](/user-guide/assets-overview), [user](/user-guide/assets), [developer](/developer-guide/assets), [API](/api/tenant-v1-assets), [deployment](/deployment/assets), [roadmap](/getting-started/product-roadmap)

## WhatsApp Cloud 1.0.0 production readiness — Conditional Go (2026-08-16)

- Audit: staff connection-status access, needs_reauth notify, outbound Queued-only send, OAuth HashRouter callback, headed e2e **6/6**.
- **Conditional Go** pending CI + staging smoke / Forge WhatsApp queues / Meta App setup.
- Canonical page: [WhatsApp Cloud production readiness](/deployment/whatsapp-cloud-production-readiness).

## WhatsApp Cloud module 1.0.0 (2026-08-16)

Catalog version: **whatsapp-cloud 1.0.0** (new billable CRM module, $29 / $290).

- Meta WhatsApp Cloud API: connect WABA/phone, shared inbox, text send/receive, status webhooks, Meta template sync + outside-24h enforcement.
- Soft optional Lead link + timeline activity; Communication Templates `wa.me` remains fallback.
- Deferred: media, Automation triggers, Lead Source WhatsApp Driver.
- Docs: [overview](/user-guide/whatsapp-cloud-overview), [user](/user-guide/whatsapp-cloud), [developer](/developer-guide/whatsapp-cloud-integration), [API](/api/tenant-v1-whatsapp-cloud), [deployment](/deployment/whatsapp-cloud), [production readiness](/deployment/whatsapp-cloud-production-readiness), [roadmap](/getting-started/product-roadmap)

## Reports 1.4.0 production readiness — Go (2026-08-16)

- Closed audit openers: companion PRs Backend [#113](https://github.com/DiligentCreators/SaaS-Backend/pull/113) · Frontend [#109](https://github.com/DiligentCreators/SaaS-Frontend/pull/109) · Docs [#134](https://github.com/DiligentCreators/SaaS-Docs/pull/134) · Website [#28](https://github.com/DiligentCreators/SaaS-Website/pull/28); Backend Laravel Tests + Code Quality Gate **success**; local catalog migrated to **1.4.0**.
- Pest Analytics **23/23**; headed Playwright **14/14**; Frontend / Docs / Website Quality Gates **success**.
- Staging migrate + human smoke (manager Payroll / staff omit) remain ops pre-flight.
- Canonical page: [Analytics production readiness](/deployment/analytics-production-readiness).

## Reports 1.4.0 production readiness — Conditional Go (2026-08-16)

- Audit of `feature/analytics-payroll-people-1-4-0` companions (superseded by Go above after F19/F20 closed).
- Canonical page: [Analytics production readiness](/deployment/analytics-production-readiness).

## Reports People Payroll soft source 1.4.0 (Analytics) (2026-08-16)

Catalog version: **analytics 1.3.1 → 1.4.0**. Display name remains **Reports**.

- People domain soft source **`payroll`**: pay runs overlapping the period, paid net (sum of line `net` for paid runs), payroll profile count, status mix rows (`draft` / `approved` / `paid`).
- Soft gate: Payroll entitled + **`payroll.view`** (stricter than `analytics.view` alone; staff roles omit compensation by default; no self-scope).
- SPA: People copy / nav `anyModules` / donut chart label for Payroll; CSV includes payroll rows when entitled.
- Docs: [overview](/user-guide/analytics-overview), [user guide](/user-guide/analytics), [developer](/developer-guide/analytics), [API](/api/tenant-v1-analytics), [deployment](/deployment/analytics), [roadmap](/getting-started/product-roadmap)

## Reports 1.3.1 production blockers closed — Go (2026-08-16)

- Closed audit blockers before merge: People leave/attendance **self-scope** (F16), catalog bump **SemVer migration order** (F17), People period **whereDate** filters (F18), website PR **Quality Gate** (F15).
- Pest Analytics **21/20+** (includes staff self-scope). Staging migrate through **1.3.1** + smoke remain.
- Canonical page: [Analytics production readiness](/deployment/analytics-production-readiness).

## Reports 1.3.1 / People 1.3.0 production readiness — Go (2026-08-16)

- Audit of `feature/analytics-people-reports-e0a6` companions (Backend [#112](https://github.com/DiligentCreators/SaaS-Backend/pull/112) · Frontend [#108](https://github.com/DiligentCreators/SaaS-Frontend/pull/108) · Docs [#133](https://github.com/DiligentCreators/SaaS-Docs/pull/133) · Website [#27](https://github.com/DiligentCreators/SaaS-Website/pull/27)).
- **Go:** local Pest Analytics green; headed Playwright **14/14**; Docs / Frontend Quality Gates green; Backend Code Quality Gate + Laravel Tests green (dispatched). Staging migrate **1.3.1** + smoke remain.
- Canonical page: [Analytics production readiness](/deployment/analytics-production-readiness).

## Reports chart types 1.3.1 (Analytics) (2026-08-15)

Catalog version: **analytics 1.3.0 → 1.3.1**. Display name remains **Reports**.

- Hub and domain reports pick chart types by context: pie/donut for status mix, horizontal bars for currency, area/line for longer series, vertical bars for simple compares.
- Card badges label chart intent (Share / Mix / Compare / Trend / Series / Bars). Empty periods show a clear placeholder.
- No API contract change; SPA-only Recharts polish on existing overview + domain payloads.
- Docs: [overview](/user-guide/analytics-overview), [developer](/developer-guide/analytics), [API](/api/tenant-v1-analytics)

## Reports People / HR domain 1.3.0 (Analytics) (2026-08-15)

Catalog version: **analytics 1.2.0 → 1.3.0**. Display name remains **Reports**.

- New domain area **`people`**: soft sources Employees, Leave Management, Attendance (entitlement + `{module}.view`).
- KPI cards + per-module charts + breakdown table + CSV export (same contract as CRM/Sales/Billing/Purchasing).
- Period-aware hired/terminated, approved leave overlapping the period, and attendance records in range.
- SPA `/analytics/people`, hub link, sidebar child under Reports.
- Deferred still: Payroll in People report (stricter authz), report builder, saved/scheduled reports, email analytics.
- Docs: [overview](/user-guide/analytics-overview), [user guide](/user-guide/analytics), [developer](/developer-guide/analytics), [API](/api/tenant-v1-analytics), [deployment](/deployment/analytics), [roadmap](/getting-started/product-roadmap)

## Reports 1.2.0 production readiness — Go (2026-08-15)

- Audit findings F6–F7, F9–F12 addressed (refetch/a11y polish, tour length 35, website catalog 1.2.0, Backend CI dispatched, LocalSeed excluded).
- Status **Go** for staging smoke → production after companion CI green.
- Canonical page: [Analytics production readiness](/deployment/analytics-production-readiness).

## Reports: plan People / HR domain (docs) (2026-08-15)

Docs-only future reference (no catalog bump):

- Next Reports domain area: **People / HR** — soft sources Employees, Leave, Attendance first; Payroll later with stricter authz.
- Keep [Department reports](/user-guide/departments) and [Financial Reports](/user-guide/financial-reports-overview) separate from Analytics.
- Likely catalog bump when implemented: **analytics 1.2.0 → 1.3.0**.
- Guides: [overview](/user-guide/analytics-overview), [user guide](/user-guide/analytics), [developer](/developer-guide/analytics), [roadmap](/getting-started/product-roadmap)

## Reports 1.2.0 production readiness re-audit (2026-08-15)

- Re-audited companion PRs Backend [#111](https://github.com/DiligentCreators/SaaS-Backend/pull/111) · Frontend [#107](https://github.com/DiligentCreators/SaaS-Frontend/pull/107) · Docs [#132](https://github.com/DiligentCreators/SaaS-Docs/pull/132) · Website [#26](https://github.com/DiligentCreators/SaaS-Website/pull/26).
- **Conditional Go:** Pest Analytics **17/17** local; Docs CI green; Frontend Quality Gate blocked on module-tour length (**35**); website timeline must show catalog **1.2.0**; Playwright not re-run this audit.
- Canonical page: [Analytics production readiness](/deployment/analytics-production-readiness).

## Reports charts 1.2.0 (Analytics) (2026-08-15)

Catalog version: **analytics 1.1.0 → 1.2.0**. Display name remains **Reports**.

- Hub overview: one bar chart per entitled module (friendly module titles).
- Domain reports (CRM / Sales / Billing / Purchasing): separate charts per source module (e.g. Leads, Invoices); value chart when amounts exist.
- Charts use existing Recharts + theme `--chart-*` tokens; no API contract change.
- Deferred still: People / HR domain report, report builder, saved/scheduled reports, email analytics.
- Docs: [overview](/user-guide/analytics-overview), [user guide](/user-guide/analytics), [developer](/developer-guide/analytics), [API](/api/tenant-v1-analytics), [deployment](/deployment/analytics)

## Reports suite 1.1.0 (Analytics) (2026-08-15)

Catalog version: **analytics 1.0.0 → 1.1.0**. Display name **Reports** (slug remains `analytics`).

- Executive dashboard retained (`GET /analytics/overview`).
- Domain reports: CRM, Sales, Billing, Purchasing — KPI summary + breakdown table + CSV export (`GET /analytics/reports/{area}`, `…/export`).
- Soft sources per area; empty report when none entitled / viewable.
- SPA Overview → Reports hub + domain pages; Playwright covers CRM CSV.
- Deferred still: report builder, saved/scheduled reports, charts, email analytics.
- Docs: [overview](/user-guide/analytics-overview), [user guide](/user-guide/analytics), [developer](/developer-guide/analytics), [API](/api/tenant-v1-analytics), [deployment](/deployment/analytics)

## Analytics module 1.0.0 (2026-08-15)

Free Operations Marketplace module (`analytics` catalog **1.0.0**) — Business Intelligence & Analytics MVP.

- Executive overview API `GET /analytics/overview` with shared period filters (`DashboardPeriod`); soft KPI sections for leads, opportunities, tasks, invoices, help-desk, and projects (omitted without entitlement + view permission).
- Permission `analytics.view` (admin / manager / staff). No hard `module_dependencies`.
- SPA `/analytics` under Overview with period controls and StatCard sections; Playwright `test:e2e:analytics` (modules / authz / workflow).
- Distinct from [Financial Reports](/user-guide/financial-reports-overview) (accounting TB / P&L / BS).
- Deferred: report builder, saved/scheduled reports, CSV export, email analytics.
- Docs: [overview](/user-guide/analytics-overview), [user guide](/user-guide/analytics), [developer](/developer-guide/analytics), [API](/api/tenant-v1-analytics), [deployment](/deployment/analytics), [production readiness](/deployment/analytics-production-readiness)

## Backend CI: pause auto runs + faster Pest (2026-08-15)

- `laravel.yml` and `quality-gate.yml` auto `push`/`pull_request` triggers **paused** — both are `workflow_dispatch` only (Actions → Run workflow) to cut GitHub Actions billing. Re-enable push/PR triggers when required checks should resume.
- When run manually, Pest uses `--parallel --processes=4` on one `ubuntu-latest` runner (`:memory:` SQLite; timeout 15 minutes).

## Invoices status model 1.2.0 (2026-08-15)

Catalog version: **invoices 1.1.1 → 1.2.0**.

- Invoice statuses are now **`draft` / `unpaid` / `paid` / `cancelled`** (replacing `sent` / `partial` / `void`). **Send** moves draft → unpaid; **Cancel** (API still `POST …/void`) moves draft|unpaid → cancelled. Partial payments stay **unpaid** until the balance clears to **paid**.
- Data migration remaps existing rows: `sent`/`partial` → `unpaid`, `void` → `cancelled`.
- SPA filters, KPIs, badges, and Playwright expectations updated; permission slug `invoices.void` unchanged.
- Docs: [user guide](/user-guide/invoices), [overview](/user-guide/invoices-overview), [developer](/developer-guide/invoices), [API](/api/tenant-v1-invoices), [deployment](/deployment/invoices)

## Invoices branded PDF + settings 1.1.1 (2026-08-15)

Catalog version: **invoices 1.1.0 → 1.1.1**.

- Invoice PDF redesigned to a professional layout: logo/header, BILL TO / details, colored line table, notes + totals, balance due bar, optional payment information footer — accent color from workspace **button color**.
- New workspace settings (Settings → Branding): company tagline, address, phone, website, default payment terms, default notes, bank name/account/IBAN/SWIFT. Missing fields stay blank; bank section hides when empty.
- PDF cache key includes a settings fingerprint so branding edits invalidate cached PDFs without waiting for invoice updates.
- Docs: [user guide invoices](/user-guide/invoices), [tenant settings](/user-guide/tenant-settings), [developer invoices](/developer-guide/invoices), [tenant settings](/developer-guide/tenant-settings), [deployment invoices](/deployment/invoices)

## Invoices recurring series + PDF 1.1.0 (2026-08-15)

Catalog version: **invoices 1.0.0 → 1.1.0**.

- Create/edit drafts with **Recurring invoice**, frequency, and a required **Next invoice date** (e.g. invoice on 15 Aug, next draft on 1 Sep; later invoices follow the frequency from that date). Sending the first invoice starts the series; `invoices:generate-recurring` (daily, workspace timezone) creates the next **draft** with copied lines.
- **Stop recurring** on the original invoice ends future generation without changing paid history. Optional checkbox voids the latest unpaid auto-generated draft/sent invoice (same ledger rules as Void).
- **Download PDF** from the invoice sheet and row menu (`GET /invoices/{id}/pdf`, `invoices.view`). Email delivery is still deferred.
- Pest `CustomerInvoiceRecurrenceTest` (catch-up cap, command failure exit, PDF cache, timezone, stop/void, soft-delete skip). Playwright one-session headed workflow (validation, CRUD, Overview memo, PDF sheet + row menu, send/void, generate + stop with optional void, shortcuts, trash). Requires `dompdf/dompdf`.
- Production hardening: generator `chunkById` + per-tenant time budget; catch-up cap default **52**; command **FAILURE** if any tenant series fails; PDF cache + `WarmCustomerInvoicePdfJob` on the default queue; `throttle:invoices-pdf`. Soft-deleted occurrences are treated as already issued for that date.
- Docs: [user guide](/user-guide/invoices), [overview](/user-guide/invoices-overview), [developer](/developer-guide/invoices), [API](/api/tenant-v1-invoices), [deployment](/deployment/invoices), [production readiness](/deployment/invoices-production-readiness)

## Help Desk module v1.0.0 (2026-08-14)

Catalog version: **help-desk 1.0.0** (new Operations SKU).

- Internal workspace ticketing MVP: tickets with status (`open` / `in_progress` / `waiting` / `resolved` / `closed`), priority, tenant-managed categories, assignment, notes/timeline, optional soft Contact/Company links, KPIs, `due_at`, and dashboard widget `help_desk_my_open`
- Free Marketplace opt-in under category `operations` — no hard module dependencies; distinct from Central [Give Feedback](/user-guide/feedback)
- Permissions: `help-desk.view|create|update|delete|restore|force.delete|assign|close|reopen` (admin all except `force.delete`; manager view/create/update/assign/close/reopen; staff view/create/update/close/reopen)
- Tenant setting `help_desk_number_prefix` (default `HD-`); overdue uses workspace timezone convention
- Deferred: SLAs, email ingest/multi-channel, customer portal, Knowledge Base, attachments, `@mentions`, Automation triggers, Communication Template context, Kanban
- Docs: [Help Desk overview](/user-guide/help-desk-overview), [user guide](/user-guide/help-desk), [developer](/developer-guide/help-desk), [API](/api/tenant-v1-help-desk), [database](/developer-guide/database), [deployment](/deployment/help-desk), [Upgrade](/deployment/upgrade)

## Projects 1.0.0 + Tasks 1.2.0 (2026-08-14)

Catalog versions: **projects 1.0.0** (new), **tasks 1.1.2 → 1.2.0**.

- Free Operations Marketplace opt-in **Projects** (`slug: projects`): title, status board (`planned` → `active`/`cancelled`; `active` → `on_hold`/`completed`/`cancelled`; `on_hold` → `active`/`cancelled`), assignee + members, soft Contact/Company/Opportunity links, notes/timeline, stats/board, dashboard widgets `active_projects` / `overdue_projects`.
- Visibility without `projects.assign`: assignee **OR** member **OR** creator. Dates `starts_on`/`ends_on`; overdue uses workspace timezone “today”.
- Soft Task `project_id` (nullable FK, `LinkableProject`) when Projects is entitled.
- Explicitly deferred: Gantt, milestones, task dependencies, workload heatmaps, Calendar projection, Automation `create_project`, tags, `PRJ-` numbers.
- Docs: [Projects overview](/user-guide/projects-overview), [user](/user-guide/projects), [developer](/developer-guide/projects), [API](/api/tenant-v1-projects), [deployment](/deployment/projects), [Tasks](/user-guide/tasks), [module dependencies](/architecture/module-dependencies), [roadmap](/getting-started/product-roadmap)

## Knowledge Base module 1.0.0 (2026-08-14)

Free Operations Marketplace module (`knowledge-base`: not default-included, not billable, catalog **1.0.0**) for **internal** team articles, flat categories, and searchable FAQs. No public/customer portal.

- Articles: title, slug, excerpt, TipTap HTML body, optional category, status `draft` / `published` / `archived`, `published_at` (`UtcDateTime`)
- Permissions: `knowledge-base.view|create|update|delete|restore|force.delete` — admin defaults exclude force.delete; manager = view/create/update; staff = view
- View-only users see published only; editors with update see drafts / archived / trash
- Categories: flat; delete blocked while articles use them
- Notes + domain timeline + Spatie `LogsActivity` + PlatformAuditService; no hard module dependencies
- Tenant API under `/api/tenant/v1/knowledge-base*` and `/knowledge-base-categories*`; SPA `src/pages/knowledge-base/`; tourId `knowledge-base`; Playwright `test:e2e:knowledge-base`
- Deferred: public URLs, Help Desk links, attachments/image upload, nested categories, dashboard widget, Automation triggers, publish fan-out
- Docs: [overview](/user-guide/knowledge-base-overview), [user guide](/user-guide/knowledge-base), [developer](/developer-guide/knowledge-base), [API](/api/tenant-v1-knowledge-base), [deployment](/deployment/knowledge-base)

## Storage module 1.0.0 (2026-08-13)

Catalog versions: **storage** / **storage-10** / **storage-50** / **storage-100** / **storage-500** / **storage-1000** all **1.0.0**.

- Free Marketplace **Storage** unlocks **1 GB** total workspace content storage (chat attachments, feedback screenshots, lead imports). Branding logos/favicons and profile avatars stay on the VPS and do not count.
- Billable capacity packs set **total** allowance: 10 / 50 / 100 / 500 / 1000 GB ($4/$12/$20/$75/$120 monthly; yearly ~10× $40/$120/$200/$750/$1200). Packs require free Storage; only one pack may be active (cancel then buy to change size).
- `WorkspaceStorageService` soft-blocks uploads with `STORAGE_REQUIRED` / `STORAGE_QUOTA_EXCEEDED`; pack install conflicts return `STORAGE_PACK_CONFLICT`.
- Team Chat install companion-installs free Storage; grandfather migrations cover existing workspaces. Settings → **Storage** usage panel; Marketplace pack conflict copy; upload toasts for quota errors.
- Prefer a dedicated Wasabi/S3 bucket for EloSync content. Pest `tests/Feature/Storage/WorkspaceStorageTest.php`; Playwright `test:e2e:storage`.
- Docs: [Storage overview](/user-guide/storage-overview), [user guide](/user-guide/storage), [developer](/developer-guide/storage), [API](/api/tenant-v1-storage), [deployment](/deployment/storage), [production readiness audit](/deployment/storage-production-readiness), [object storage](/developer-guide/object-storage).

## Expenses categories 1.1.0 (2026-08-13)

Catalog version: **expenses 1.0.0 → 1.1.0**.

- Tenant-managed expense categories (`expense_categories`) replace the hardcoded `travel|office|software|utilities|other` enum. CRUD reuses `expenses.*` (same pattern as Product Categories).
- Expenses store `category_id` with embedded `{ id, name, slug }` on the API; list filter is `?category_id=`. Create/PO convert default to seeded **Other**. This is a first-party SPA contract change (MINOR) — **migrate Backend before deploying the SPA**.
- Starter categories (Travel, Office, Software, Utilities, Other) lazy-seed on first list/create/convert. Starter slugs stay stable if renamed. **Other** cannot be deleted. Listing does not restore a deleted Travel/Office/Software/Utilities row; only missing **Other** is restored. Delete is also blocked while expenses still use the category.
- Spatie activity log name `expense-categories` for category CRUD (lazy seed is quiet).
- SPA: **Manage categories** on Expenses (`expenses.create` **or** `update` **or** `delete`); in-dialog create/edit/delete are gated separately. Form/filter/detail use the lookup. Playwright covers creating a custom category and using it on a new expense.
- Docs: [Expenses user guide](/user-guide/expenses), [developer](/developer-guide/expenses), [API](/api/tenant-v1-expenses), [database](/developer-guide/database), [deployment](/deployment/expenses), [Upgrade](/deployment/upgrade)

## Fix — overdue due dates vs workspace timezone (2026-08-13)

Catalog versions: **tasks 1.1.1 → 1.1.2**, **todos 1.1.0 → 1.1.1**, **leads 1.2.0 → 1.2.1**.

- Tasks, ToDos, and lead follow-ups no longer show as **Overdue** when the due time is still upcoming in Settings → General timezone (e.g. Asia/Karachi). SQL was comparing UTC-stored `due_at` to workspace `now()`.
- Due today / this week KPIs and dashboard widgets use workspace calendar day bounds converted to UTC (`App\Support\UtcInstant`).
- Task / ToDo / activity / lead follow-up forms convert `datetime-local` through `appLocalInputToIso` / `isoToAppLocalInput` instead of sending naive strings or slicing UTC ISO.
- Docs: [Workspace timezone](/developer-guide/tenant-settings#timezone-and-scheduled-datetimes), [Tasks](/user-guide/tasks), [ToDos](/user-guide/todos)

## Automation module v1.0.0 (2026-08-10)

Billable marketplace **Automation** SKU (`automation`): cross-module trigger → condition → action workflows with builder UI, templates, runs/logs, queue `automations`, and schedule dispatcher. Wired triggers for Leads, Tasks, Opportunities, Meetings, and Customer Invoices. `NotificationSourceEnum::Workflow` reserved for automation notifications; mentions/DMs use `Mention` / `DirectMessage`.

Hardeners: create always persists inactive then `activate()` (unwired triggers cannot bypass); outbound webhook SSRF + connect timeout; schedule 90s due window + 2-minute dedup + per-workflow cache lock; `ExecuteAutomationRunJob::failed()` + per-run cache lock + 60s timeout; delay_seconds capped at 24h; `AUTOMATION_WEBHOOK_SECRET` in `.env.example`. Docs hubs, Forge/`automations` queue, Meta Lead Ads event note, Playwright create → activate → run, [production readiness](/deployment/automation-production-readiness). Marketing catalog lists Automation as a paid add-on ($29/$290) alongside Branded.

## Lead webhook Copy JSON (2026-08-10)

- Leads → Integrations → Webhooks: **Copy JSON** next to **Copy URL** (also on the one-time secrets panel after create/rotate)
- Clipboard payload is the example POST body for website / Zapier wiring, with that endpoint’s default `source`; extras map under `custom_fields`
- Docs: [Leads user guide](/user-guide/leads), [Custom Lead Webhook](/developer-guide/custom-lead-webhook)

## Email reading pane layout + multi-select bulk actions (2026-08-09)

Catalog version: **email 1.2.0 → 1.3.0**.

- Reading pane: **Right panel** (default, taller viewport, drag-resizable list) or **Full panel**; preference stored in the browser
- Multi-select in each folder/label list with bulk **Mark read/unread**, **Move to**, **Labels** (add/remove), and **Delete** (batch capped at 25 for IMAP timeout safety)
- API: `POST /email/messages/bulk` (owned messages only; up to 25 per request)
- Ops: run `php artisan migrate --force` for the catalog bump (no new tables); keep the standing **`email-sync`** queue worker for mailbox connect/sync (bulk actions run in the HTTP request)
- Docs: [Email user guide](/user-guide/email), [Email developer guide](/developer-guide/email), [Tenant Email API](/api/tenant-v1-email), [Email deployment](/deployment/email)

## Give Feedback — email reporters on Central updates (2026-08-09)

- When Central changes a feedback ticket’s **status**, or posts a **public response**, the submitting workspace user receives a platform-branded email (`FeedbackReporterUpdated`) with the ticket number, title, and update details
- Status emails are delayed ~90 seconds and suppressed if triage moved on (rapid updates only notify for the final status); public replies send immediately
- Mail includes a **View my submissions** CTA (`/#/dashboard?feedback=submissions`) that opens Give Feedback on **My submissions**
- Priority/module-only triage and **internal notes** do not email the reporter; missing/soft-deleted reporters are skipped silently
- Docs: [Central Feedback System](/developer-guide/central-feedback-system), [Give Feedback](/user-guide/feedback)

## CRM digest email visual redesign (2026-08-09)

- Daily CRM (personal + team), task due digest, and department performance digest emails use shared table-based HTML templates: navy header with digest label (`DAILY SUMMARY` / `TASK DIGEST` / `DEPT DIGEST`), tinted metric cards, and card-styled body sections (user CRM cards, task lists, department stats).
- Views live under Backend `resources/views/emails/crm/`; notifications pass data via `CrmDigestMailView` + `BrandedMail::apply()`.
- Docs: [Daily CRM summary](/deployment/daily-crm-summary), notifications API digest notes.

## Daily CRM summary — owner team mail, leads exclusion, mail chrome (2026-08-09)

- **Owners** (`superadmin`) always receive the team (all-users) daily CRM summary; non-owners can still opt in via **Receive all-users daily summary**.
- Personal digests omit the **Leads** block when the user has **Exclude from lead assignment**; leads alone do not trigger a personal send.
- Mail chrome: Branded module → tenant logo/name; otherwise platform (central EloSync) logo/name via `BrandedMail`. Confirm Central Branding logo is set in production.
- First-morning note: expect one team digest per Owner when any member has CRM activity — watch the `emails` queue.
- Docs: daily-crm-summary, branded guides, notifications API, tasks / RBAC user notes.
- Frontend Users dialog help text clarifies Owners already receive the team rollup.

## Give Feedback — required searchable Module + tour tip (2026-08-09)

- Give Feedback: **Module** is required via a searchable picker of installed modules (prefilled from the current page when possible); choose **Other** and enter a required **What area?** when the report is not module-related
- Tenant API: `module_slug` is required on create (`max:100`)
- Module product tours append a shared final step pointing at the avatar menu → **Give Feedback**
- Docs: [Give Feedback](/user-guide/feedback), [Module Tours](/developer-guide/module-tours), [Shared Layout](/user-guide/shared-layout)

## Fix — Team Chat in-pane scroll (2026-08-09)

Catalog version **1.3.1 → 1.3.2**.

- Team Chat fills the remaining viewport height; the **message list** (and conversation sidebar / thread panel) scroll inside the chat chrome instead of growing the page/browser scrollbar
- Message auto-scroll and deep-link highlight scroll within the chat `ScrollArea`, so long history no longer shrinks the browser scrollbar
- Docs: [Team Chat user guide](/user-guide/team-chat)

## Fix — Email delete, HTML view, workspace trash retention (2026-08-09)

- Email: deleting a message already gone from IMAP removes the local EloSync copy; connection/auth failures keep the local copy and error
- Email: reading pane shows sanitized HTML in a sandboxed iframe (popups allowed for links); IMAP body extract walks nested multiparts + charset decode; show re-fetches only when `body_html` is null
- Settings → General: **Trash retention** (`trash.retention_days` — Forever / 30 / 90 / 365, API-validated) with daily `trash:purge-expired` across SoftDeletes modules (`TrashPurgeRegistry`, excludes EmailAccount)

## Fix — @mention composer caret after pick (2026-08-09)

- Tasks comments / Leads notes / Team Chat: after picking an `@` suggestion you can keep typing and Backspace/Delete removes the mention chip
- Root causes: `display:flex` on the contentEditable (Chrome caret stuck next to atomic chips), no Backspace handler for `contentEditable=false` chips, and chip `@Name` text re-triggering autocomplete
- Docs: developer guide Mentions UI notes for Leads / Tasks

## Attendance status badge colors (2026-08-09)

Catalog version: **attendance 1.0.0 → 1.0.1**.

- Status badges in the Attendance table and detail sheet use fixed outline colors: Present (green), Late (red), Absent (slate), Half day (amber), Remote (blue)
- Docs: [Attendance user guide](/user-guide/attendance)

## Pipeline board & table stage colors (2026-08-08)

Catalog versions: **leads 1.1.1 → 1.2.0**, **opportunities 1.0.0 → 1.1.0**, **tasks 1.0.0 → 1.1.0**.

- Leads / Opportunities board: column headers and cards tint from each stage’s stored color; Stage badges in the table and detail drawer use the same soft outline colors
- Tasks board: fixed color per status (To Do, In Progress, Waiting, Completed, Cancelled); Status badges in list and detail match
- Dashboard **Pipeline Board** widget prefers `stage.color` when present (falls back to the previous index palette)
- Docs: user guides for Leads, Opportunities, Tasks, and tenant dashboard overview

## Per-module colored tags — Tasks, ToDos, Opportunities (2026-08-08)

Catalog versions: **tasks 1.1.0 → 1.1.1**, **opportunities 1.1.0 → 1.1.1**, **todos 1.0.0 → 1.1.0**.

- **Tags (Tasks / ToDos / Opportunities):** per-module colored tags (name + color). Create and assign inline from the create/edit dialog (ClickUp-style chips). Filter list/board by tag. Separate catalogs — Tasks tags ≠ ToDos tags ≠ Opportunities tags. Leads keep their existing disposition tags system unchanged.
- Tag catalogs are **create-only** in this MVP (no rename / delete / reorder UI or routes). Detail drawers show tag badges; assignment changes go through the create/edit dialog (or `PUT …/tags` for API clients).
- Docs: user guides, API tag endpoints, developer/database/deployment tables + audit keys

## Central feedback system + Founding Beta intake (2026-08-08)

- Backend: tenant + Central feedback APIs, public beta-application intake, Central permissions (`feedback.*`, `beta-applications.*`), critical-bug mail to System Settings `support_email`
- SPA: Give Feedback dialog (auto page/browser context + My submissions), Central **Platform → Feedback** inbox, **Platform → Beta Applications** triage
- Docs: [Central Feedback System](/developer-guide/central-feedback-system) marked **Implemented**; [Founding Beta](/product/founding-beta) status table updated; user guide [Give Feedback](/user-guide/feedback)
- Marketing site companion (separate repo): Founding Beta homepage funnel, `/beta/`, `/pricing/`, module pages

## Founding Beta program docs + feedback architecture (2026-08-08)

- Document [Founding Beta](/product/founding-beta): objectives, access model, tester expectations, and transition to public launch
- Document [Central Feedback System](/developer-guide/central-feedback-system) architecture (tenant submit / Central manage) — originally Planned; now Implemented (see delivery note above)
- Product Roadmap: Business Operating System positioning note + Founding Beta cross-links
- Marketing site companion work (separate repo): Founding Beta homepage funnel, `/beta/`, `/pricing/`, module pages

## Fix — Lead convert RBAC + meta cleanup (v1.1.1) (2026-08-08)

Catalog version **1.1.0 → 1.1.1**.

- Stub contact backfill that links an existing convert Opportunity now requires `opportunities.update` (same as Opportunities API)
- Clear stale `conversion_meta.company_id` / `company_uuid` when the company cannot be resolved
- Cache-lock company create by tenant + normalized name to reduce concurrent duplicates; document residual race without a unique name constraint
- Pest: stub opportunity backfill + update authz; stale company_id cleanup
- Playwright: convert with company + optional opportunity
- Docs: known limitation + this note

## Leads v1.1.0 — convert creates Company + optional Opportunity (2026-08-08)

Catalog version **1.0.0 → 1.1.0**.

- Convert a lead now creates/links a **Company** when Companies is installed and the lead has a company name (case-insensitive reuse; `companies.create` only when creating)
- Optional **Also create an opportunity** on convert when Opportunities is installed (`create_opportunity` + `opportunity.name`; links lead/contact/company; preserves lead assignee)
- Contact convert behavior unchanged when Contacts is entitled; `conversion_meta` may include `company_id` / `opportunity_id`
- SPA lead drawer: company hint, opportunity checkbox + fields, post-convert View company / View opportunity links
- Pest coverage for company reuse, optional opportunity, validation, and create-permission gates
- Docs: user / developer / API leads (+ contacts convert notes, opportunities overview) + this note

## Fix — Team Chat receive latency on 2 vCPU hosts (2026-08-08)

Catalog version **1.3.0 → 1.3.1**.

- Broadcast `MessageSent` **after** the DB commit and **before** audit/mention side effects so peers see messages as soon as Reverb delivers
- Defer audit + mention/DM notification fan-out until after the HTTP response (`afterResponse`)
- Conversation list: one batched unread query; do not hydrate every `#general` member on each list request (DM members still load for titles)
- SPA: inbound message cache updates use `startTransition`; message rows are memoized

## Team Chat v1.3.0 — channel creator settings (2026-08-08)

Catalog version **1.2.0 → 1.3.0**.

- Channel **creators** can change visibility (public ↔ private), rename, and edit description
- Creators can **permanently delete** a channel and all history (messages, reactions, pins, attachments) after typing the exact channel name
- Workspace **#general** cannot be deleted
- SPA: Channel settings control in the conversation header (creator only)
- Pest coverage for creator authz, confirmation mismatch, #general protection, and slug reuse after delete

## Fix — Team Chat Enter-to-send + snappier UI (2026-08-08)

- Team Chat composer: **Enter** sends, **Shift+Enter** inserts a new line (replaces Ctrl/⌘+Enter)
- Mentions picker still uses Enter to select; lead notes / task comments keep Enter = newline
- Reduced conversation-list refetch storms: send, mark-read, and realtime message events patch the sidebar cache locally instead of invalidating the full list every time
- Debounced mark-read; conversation detail uses list placeholder data while loading for faster channel switches

## Team Chat module (2026-08-08)

Free Collaboration Marketplace module (`team-chat`: not default-included, not billable) for realtime workspace messaging — channels, DMs, mentions, threads, and file sharing.

Catalog versions: registered **1.0.0**, then bumped **1.0.0 → 1.1.0** (threads / reactions / pins / typing), **1.1.0 → 1.2.0** (attachments / search / retention). Shipped through catalog **1.2.0**; see **1.3.0** above for creator channel settings.

- Backend: conversations API under `/api/tenant/v1/conversations` (`module:team-chat` + Spatie permissions), #general auto-provision on install (+ join new users when eligible), Reverb private channel `tenant.{tid}.conversation.{id}` alongside the existing user notification channel, S3 attachments, message search, `team-chat.retention_days` + `team-chat:purge-expired`
- Frontend: SPA route `/team-chat`, unread + notification bell, deep links from mention/DM notifications, authenticated attachment downloads, shortcuts `n` / `mod+f`
- Pest `tests/Feature/Tenant/TeamChat/TeamChatTest.php` (licensing, provision, channels/DMs, mentions, broadcast auth, tenant isolation, authz/privacy, attachments/purge, mention prune) + Playwright `test:e2e:team-chat` (headed multi-user opt-in via `test:e2e:team-chat:headed`)
- Docs: user guide, [Team Chat API](/api/tenant-v1-team-chat), `chat_*` schema in the database guide, tenant settings retention key, module development Reverb + always-on purge schedule note, entitlements/licensing catalog + this note

## Fix — offline banner for real-world disconnects (2026-08-08)

- SPA sticky offline banner is driven by browser `offline`/`online` **and** Axios transport failures (no HTTP response), not only `navigator.onLine`
- Network-error toasts are suppressed while the banner owns connectivity UX (no stacked “Network error. Check your connection.” spam)
- While offline, SPA probes Laravel `/up` on the API origin and marks restored when reachable; successful API responses also clear offline
- Restoring connectivity invalidates React Query so dashboards refetch
- Marketing site: same-origin HEAD probe + visibility/online checks so the banner appears when WAN is down even if Wi‑Fi stays “online”

## Email v1.2.0 — EloSync-only labels (2026-08-08)

Catalog version **1.1.0 → 1.2.0**.

- Per-mailbox **labels** (name + color) stored only in EloSync — not synced to IMAP/Gmail
- Sidebar: IMAP folders, then a **Labels** heading with manage (+) and label filter list
- Apply/remove labels from the reading pane; messages can have many labels while staying in one folder
- Filter message list by label; disconnect removes labels with the mailbox
- Pest: labels create / update / show / duplicate reject / apply / clear / filter / delete / cross-user forbid
- Playwright: labels create / edit / assign / remove / filter / delete (after live mailbox connect)
- Docs: user / developer / API guides + this note

## Docs — module catalog SemVer policy (2026-08-08)

Clarified `modules.version` bumping for all modules:

- **PATCH** (`1.0.1`) for fixes; **MINOR** (`1.1.0`) for additive features; **MAJOR** (`2.0.0`) for large backward-compatible milestones
- Modules ship **without breaking changes**; bumps use `DefaultModuleRegistrar::bumpVersion` data migrations
- Code + catalog version are platform-wide; a bump does **not** auto-install or re-enable modules for workspaces that never entitled them
- Guides: [Module Development Guide — catalog versioning](/developer-guide/module-development-guide#catalog-versioning-modulesversion), [Deployment — module development](/deployment/module-development#bumping-modulesversion-on-module-updates)

## Email v1.1.0 — shared templates + multi-mailbox UX (2026-08-08)

Catalog version **1.0.0 → 1.1.0**.

- Templates: `is_shared` (default **shared** for new templates; existing rows stay private). Teammates can apply shared templates; creator or workspace owner can edit/delete any template.
- Compose template list uses `for_compose=1` (own + shared only). Picker labels show name · creator · Shared/Private (`uuid` remains the identity).
- Multi-mailbox SPA: account switcher, **Add mailbox**, set default / disconnect; compose **From** select among connected accounts.
- Signatures remain personal. Gmail/Outlook still IMAP/SMTP + app passwords (no OAuth).
- Pest coverage for sharing authz + non-default compose From; Playwright asserts shared checkbox default and From/mailbox controls when a mailbox is connected.
- Docs: user / developer / API guides + this note.

## Fix — @mention composer shows name only (2026-08-07)

- Lead notes / Task comments: after picking someone with `@`, the composer shows a name chip (`@Aamir Raza`) instead of the raw `@[Name](user:id)` token
- Stored body (and API payload) still uses `@[Display Name](user:ID)` so mention notifications keep working
- Table/board **Latest note** previews already render `@Name` for saved notes

## Fix — Latest note @mentions show name (2026-08-07)

- Table and board **Latest note** previews (and hover tooltips) render `@Name` instead of the stored `@[Name](user:id)` token
- Applies wherever the shared latest-note component is used (Tasks, Leads, and other modules with notes)

## Announcements module (2026-08-07)

Free Communication Marketplace module (`announcements`: not default-included, not billable) for workspace announcements with read tracking.

- Post-login unread dialog for every signed-in user when the module is installed (**no** `announcements.view` permission)
- Dashboard announcements section after the welcome greeting (**unread only**; hidden when empty or all read)
- Admin CRUD with `create` / `update` / `delete` / `restore` / `force.delete`; readers list via `view_reads` (first/last read + IP)
- Publish fans out in-app notification `type: announcement`
- Pest `AnnouncementTest` (incl. validation + non-UTC expiry) + Playwright `test:e2e:announcements`
- Docs: user / developer / deployment / API + database dictionary
- Production hardening: unread-only dashboard Mark as read, queued publish fan-out, UTC expiry scope, workspace-timezone form helpers

## Connectivity banner — offline / restored (2026-08-07)

- SPA and marketing site show a sticky top banner when connectivity is lost (“You are currently offline”) and a short green “connection was restored” notice when it comes back
- SPA: also triggered by Axios transport failures; health probe via API `/up`; network toasts suppressed in favor of the banner (see 2026-08-08 fix)

## Email — connect SMTP IP note (2026-08-07)

- Connect mailbox dialog and user guide note that the mail provider must allow SMTP from the application server IP (587/465) for Test and send

## Email — security harden + docs honesty (2026-08-06)

- Reading pane sanitizes HTML bodies with DOMPurify before render
- CRM link API authorizes `view` on the target Lead/Contact/Company/Opportunity
- Docs demote attachment download/storage and CRM linking UI (API/schema only in v1)

## Email — per-mailbox sync interval (2026-08-06)

- Each connected mailbox has **Auto-sync interval** (default **5 minutes**; 5 / 10 / 15 / 30 / 60)
- Scheduler runs `email:sync` every minute and only queues jobs for due mailboxes; **Sync** button still forces an immediate sync
- Forge: dedicated `email-sync` queue daemon documented separately from `emails,default`
- Docs: user guide, API, deployment, Laravel Forge

## Email — rich text compose (2026-08-06)

- Compose, Reply, Forward, Templates, and Signatures use a TipTap rich text editor (bold, italic, underline, lists, link, text color)
- Reply/Forward quote the original message as rendered HTML instead of showing source in a raw textarea
- Docs: user guide + developer guide editor notes

## Email — reply, move, trash (2026-08-06)

- Reading pane: **Reply**, **Forward**, and **Move to** folder actions
- Delete moves the message to **Trash** (IMAP) when a trash folder exists; delete again permanently removes it
- Compose sends `in_reply_to` / `thread_key` for replies
- Docs: user guide + tenant API behavior notes

## Email module — personal IMAP/SMTP (2026-08-06)

Free Communication Marketplace module for a **personal** mailbox inside EloSync (Inbox/folders, compose/drafts/sent, templates with `{{variables}}`, signatures). CRM link API and attachment schema are present; SPA linking UI and attachment file sync are deferred.

- Catalog: slug `email`, `is_default_included=false`, `is_billable=false`, prices `$0` (not auto-installed)
- Connect via IMAP/SMTP credentials with Gmail/Outlook **app password** presets — **no OAuth** in v1
- Sync/send jobs on dedicated `email-sync` queue; scheduler `email:sync` every five minutes; requires PHP `ext-imap`
- Fully separate from Settings → Mail / `EmailConfigResolver` (platform transactional mail) and from Communication Templates (WhatsApp plain-text)
- Personal isolation enforced in policies; Spa `/email` + Playwright `test:e2e:email`
- Docs: user, developer, API, and deployment guides

## Phase 1 — Resellers + Reseller Payouts (2026-08-06)

Free Sales Marketplace modules for partner accounts and a two-tier commission ledger on fully **Paid** customer invoices.

- **Resellers** (`resellers`): partner directory with `commission_rate` / `owner_commission_rate`, assignee scoping, soft delete, same-workspace **invite-login** (protected `reseller` role only), Vendor-parity **threaded notes** (`note_entries` / `reseller_notes`) and **domain activity** timeline (`reseller_activities`). Hard dependency on **Payments**. Catalog: `is_default_included=false`, `is_billable=false`, category `sales`, `sort_order=70`.
- **Reseller Payouts** (`reseller-payouts`): `reseller_commission_entries` accrued on `CustomerInvoiceBecamePaid` (not Partial); formula `resellerCut = T×R%`, `ownerCut = (T−resellerCut)×O%`; approve → pay / void. **Pay → void payment → pay again** revives void ledger rows to accrued with refreshed snapshots. Hard dependency on **Resellers**. Catalog: same free Sales flags, `sort_order=80`.
- Invoice link: nullable `customer_invoices.reseller_id` (+ `LinkableReseller`).
- SPA: Resellers list + detail sheet tabs Overview | Notes | Activity | Access; Reseller Payouts ledger workflow.
- **Deferred:** cross-workspace identity (each tenant manages its own reseller logins; no Central multi-tenant reseller person).
- Docs: user/developer/deployment/API guides + module-dependencies + database dictionary.
- Finance ops: voiding a posted payment voids **all** commission rows for that invoice (including already `paid`); re-paying revives them to `accrued`.

## Fix — Leads Ops merge-readiness audit (2026-08-06)

Pre-merge fixes from security/bug audit on `feature/leads-operations`:

- Persist **Receive website leads** on user **update** (`UpdateTenantUserRequest`)
- Snapshot **commission rate** when `assigned_to` changes via `PUT /leads/{id}` (not only `/assign`)
- Import **Update** mode no longer self-matches as a same-day duplicate; Skip/create still notify; preview write-gated
- Department weekly digest week bounds use each tenant’s workspace timezone after `applyRuntimeConfig`
- SPA: refresh `/me` after department save so `is_department_manager` unlocks equal import / reports without reload; edit lead omits forced `lead_type: direct` for legacy null rows
- Docs corrections: eligible assignees vs website flag, digest schedule timezone, `dashboard.view`, current-stage metrics, `lead_commission_rate` / `department_weekly` in database dictionary

## Fix — Leads Playwright coverage for Ops gates (2026-08-05)

Headed `test:e2e:leads` updates for Lead Ops:

- Create-lead helpers target the **Company** textbox exactly so the **Company Lead** system tag does not collide
- Import keep-duplicate flow restored (was referencing an undefined locator)
- Equal-distribute e2e asserts the radio is disabled for non–department-manager owners, and runs a manager path with Departments + a staff member in the managed department
- Integrations waits for webhook endpoints to finish loading before create

Requires a local queue worker on `imports` (and usually `emails`) so import jobs leave `queued`.

## Fix — lead inactivity setting save (2026-08-05)

Settings → Leads **Inactivity alert (working days)** did not persist overrides and did not surface validation errors. The form field used a dotted React Hook Form name (`leads.inactivity_working_days`), which nested into `dirtyFields` / `errors` and skipped the update payload. Renamed the form field to `leads_inactivity_working_days` and map to API key `leads.inactivity_working_days` on save.

## Lead inactivity alerts (2026-08-05)

Assigned open leads (not in Won/Lost stages) trigger daily inactivity alerts when no **meaningful** activity occurs for the configured number of **Mon–Sat working days** (workspace timezone; Sundays excluded). Default threshold: **3** (`leads.inactivity_working_days`). Meaningful types: notes, follow-ups, stage/status changes, CRM activities, tag changes. Assignment/import/create alone do not reset the timer.

- Assignee receives `lead.inactive`; department managers of the assignee receive `lead.inactive_escalation` (workspace owners when no managers).
- Backend: `LeadInactivityService`, `leads:notify-inactive` (daily schedule), `NotificationIdempotency`, Pest `LeadInactiveNotificationTest`
- Frontend: Settings → Leads tab; notification registry entries
- Docs: Leads user + developer guides

## Department performance reports + weekly digest (2026-08-05)

Workspace owners and department managers get an in-app **Department reports** page (`/reports/departments`) with leads open/won/lost and tasks open/completed by department for a selected period. Metrics join assignees via `department_user` membership (plus linked employees and manager). A weekly scheduled command sends database + email digest notifications to owners and managers.

- Backend: `DepartmentPerformanceReportService`, `GET /reports/department-performance`, `reports:send-department-digest`, `DepartmentPerformanceDigestNotification`, Pest authz + metrics + digest tests
- Frontend: HR nav item (owner or `is_department_manager`), period filters, summary cards + table
- Docs: tenant reports API, Departments user + developer guides

## Same-day duplicate leads — notify + Duplicate tag (2026-08-05)

When email or phone matches another lead created the **same workspace calendar day** (Settings → General timezone), EloSync applies the protected **Duplicate** system tag and sends `lead.duplicate_detected` notifications to the existing lead’s assignee, creator, and the actor (importer or manual creator). Import duplicate mode (**Skip** / **Update** / **Keep**) is unchanged; tagging and notifications still run for same-day matches. Inbound ingest skips still tag and notify when the match is same-day.

- Backend: `LeadDuplicateService::findSameDayByContactFields`, `LeadSameDayDuplicateService`, `LeadDuplicateDetected` event + notification, hooks in `LeadService`, `ImportManager`, `LeadIngestionService`, Pest `LeadSameDayDuplicateTest` (non-UTC day boundary)
- Frontend: notification registry entry `lead.duplicate_detected`
- Docs: Leads user + developer guides

## Website lead recipient pool (2026-08-05)

Custom webhook endpoints can **assign to website recipients** after ingest. Users opt in with **Receive website leads** (`receive_website_leads`). Eligible assignees in that pool receive equal distribution; empty pool leaves the lead unassigned and writes a platform audit event. Meta Lead Ads is not part of this pool.

- Backend: migrations, `LeadBulkAssignmentService::eligibleAssigneesForWebsite`, post-create assign in `LeadIngestionService`, `NotificationSourceEnum::Webhook`, Pest `LeadCustomWebhookTest`
- Frontend: user flag toggle; webhook endpoint toggle under Leads → Integrations
- Docs: Users API, Custom Lead Webhook, Leads developer guide

## Lead type Direct / Company (2026-08-05)

Leads now have a first-class **lead type** (`direct` | `company`), required when creating or updating via the API and lead form. Legacy rows may still have a null type until edited.

- System tags **Direct Lead** / **Company Lead** are seeded and kept mutually exclusive with the stored type
- Import mapping adds optional **Lead Type** column (defaults to `direct` when unmapped)
- Table, board cards, and detail drawer show lead type

- Backend: `LeadTypeEnum`, `leads.lead_type` migration, tag sync in `LeadService` / `LeadTagService`, Pest `LeadTypeTest`
- Frontend: lead form select, import field list, list/detail/board display
- Docs: Leads user + developer guides, tenant leads API

## Lead commission rate snapshot (2026-08-05)

Workspace users can have an optional **Default lead commission %** (`users.lead_commission_rate`). When a lead is assigned or reassigned via `POST /leads/{id}/assign`, the assignee’s rate is copied to `leads.commission_rate`; unassign clears it. Display and export only — no payout calculations.

- Backend: migrations, `TenantUserService`, `LeadService::assign`, API resources, CSV/XLSX export column, Pest `LeadCommissionRateTest`
- Frontend: Users create/edit field; read-only commission on lead list (when assigned) and detail drawer
- Docs: Users API, Leads developer + user guides

## Import equal distribute scoped to managed departments (2026-08-05)

Lead import **Automatically distribute** is limited to department managers. Eligible assignees are drawn only from members of active departments where the importer is `manager_id`. Non-managers cannot select the mode (API 422 + SPA disable). Bulk equal distribute is unchanged (org-wide). Login `/me` include `is_department_manager`.

## Lead High Priority dashboard chip (2026-08-05)

Staff with **leads.update** can toggle **High Priority** from the lead detail drawer. The Dashboard **High Priority** widget lists open-pipeline leads with priority **High** only.

**Behavior notes**

- Clearing the chip restores the previous priority when the chip was used to mark High in that browser tab (for example Urgent → High → Urgent). Otherwise clear falls back to Medium.
- **Breaking (dashboard):** Urgent open leads no longer appear on the High Priority widget. Use Leads filters for Urgent, or mark the lead High to surface it on the dashboard card.

- Backend: `high_priority` widget filter + Pest coverage
- Frontend: Overview chip with priority restore; Playwright pipeline flow asserts chip, dashboard card, and Urgent restore
- Docs: Leads / tenant application user guide, [Dashboard API](/api/tenant-v1-dashboard)

## Docs production build unblock (2026-08-05)

Docs CI publish to `build-artifacts` was failing the artifact secret scan on a placeholder FCM PEM example in [Push notifications](/deployment/notifications). The example no longer uses PEM armor headers, and the scanner only flags PEM headers that are followed by real base64 key material.

## Lead tags + Contacts On/Off Boarded (2026-08-05)

Multi-select disposition **tags** on Leads (full catalog CRUD + sort order), seeded defaults (Not Contacted, Contacted, No Response with per-tag auto follow-up days, Invalid Number, Not Interested, Not Applied, Follow Up Later with forced follow-up), badges on board/table/detail/forms, and filter by tag. Tags never change pipeline stage or lead status.

Contacts gain a lifecycle field separate from soft-delete: **On Boarded Clients** / **Off Boarded Clients** (KPIs, filters, form, detail). Lead convert defaults new contacts to on boarded. Trash wording (**Active only**) is unchanged.

- Backend: `lead_tags` + pivot, `PUT /leads/{id}/tags`, tag reorder/CRUD, `contacts.lifecycle_status`, Pest coverage
- Frontend: Manage tags dialog, tag picker + force follow-up UX, contacts lifecycle UI; Playwright `leads.tags.spec.ts`
- Docs: Leads/Contacts user + API + developer guides

## Tenant user impersonation (2026-08-05)

Same-workspace **Login as user** for Owners (permission `users.impersonate`): Users row menu → reason dialog → amber banner → **End impersonation** restores the actor session. Targets cannot be self or workspace Owner; nested impersonation is blocked. Central platform impersonation is unchanged.

Hardening: one active session per actor (prior target PAT revoked), revoke PAT on session delete, reject soft-deleted targets, persist impersonation metadata in `sessionStorage` for refresh/banner restore.

Platform CI note: Laravel 13 `#[AsCommand(name: 'db:seed')]` made stancl/tenancy’s `Seed` command clobber core `db:seed` (missing `--tenants` → Pest suite red). Backend re-registers framework `SeedCommand` after package boot.

- Backend: `user_impersonation_sessions`, `POST /users/{user}/impersonate`, `POST /user-impersonation/{id}/end`, additive permission sync
- Frontend: auth-store modes (`central` / `tenant-user`), Users dialog, AppLayout end routing; Playwright `users.impersonate.spec.ts` (tenant project)
- Docs: [Tenant Users API](/api/tenant-v1-users#user-impersonation-login-as-user), [Authentication](/developer-guide/authentication#impersonation-compatibility), [Tenant RBAC](/user-guide/tenant-rbac)

## Rotating dashboard inspire taglines (2026-08-05)

Central and tenant dashboards show a short curated inspirational line under the welcome greeting. A new line is picked on each visit (session-aware so the same line is not repeated back-to-back).

## Board drag-and-drop auto-saves (2026-08-03)

Kanban drag-and-drop on **Leads**, **Opportunities**, **Tasks**, and **ToDos** now saves the stage/status immediately (same as Calendar reschedule). Dropping a card no longer opens the detail drawer; click still opens it for edits. Cards without update permission remain view-only (non-draggable).

## Role permissions filtered by installed modules (2026-08-03)

Tenant **Roles** edit and the **Permissions matrix** only show core administration permissions plus groups for modules the workspace currently owns. Assigning a permission for an uninstalled module is rejected. Existing grants for a module that was later removed stay in the database (so reinstall can restore prior access) but stay hidden from the UI until the module is installed again.

## Module product tours (Phase 5) (2026-08-03)

Every tenant module list page includes a short product tour (driver.js) explaining how the module works.

- PageHeader help icon (`tourId`) — always re-runnable; first visit auto-prompts once via `localStorage`
- Shared helper + per-module step configs under `SaaS-Frontend/src/tours/` (Leads is the blueprint)
- Wired for nav modules: CRM, sales, billing, purchasing, inventory, accounting, financial reports, and HR (employees, departments, leave, attendance, payroll)
- Docs: [Module Tours](/developer-guide/module-tours); brief note in [Shared Layout](/user-guide/shared-layout)

## Native FCM channel + device tokens (Phase 4b) (2026-08-03)

Additive Firebase Cloud Messaging HTTP v1 delivery for closed/background devices, using the same `PlatformNotificationPayload` mapper as VAPID Web Push. No parallel notification framework; Firebase remains optional for local/dev.

- Backend: `FcmChannel`, `fcm_device_tokens` register/unregister API, env-based service-account credentials (`FCM_*`), graceful skip when unconfigured
- Shared wake trait: existing `SendsWebPushNotification` / `withWebPushChannel()` also enqueues FCM (including mention notifications)
- Frontend: registers an FCM web token when complete `VITE_FIREBASE_*` config is present; VAPID path unchanged
- Docs: deployment secrets + Forge checklist, architecture channels table, tenant API surface

## Web Push hardened (VAPID Phase 4a) (2026-08-03)

Standards browser Web Push is production-hardened for all existing notification types (including mentions).

- Ops: deploy docs require `VAPID_SUBJECT` / `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` and a supervised `emails,default` queue worker (Web Push rides the same notification jobs)
- Reliability: expired endpoints (`404`/`410`) pruned; SW registers with `updateViaCache: 'none'`, activates immediately, and re-syncs on `pushsubscriptionchange`; Profile / Notification Center prompt when re-subscribe is needed
- Click → HashRouter deep link via `PlatformNotificationPayloadMapper` `url`
- Channel skips cleanly when VAPID is unconfigured (database + Reverb unaffected)

## @mentions on Lead/Task notes (2026-08-03)

Mention teammates in **Lead notes** and **Task comments** with `@` autocomplete. Stable body syntax `@[Display Name](user:ID)` persists mention rows (`lead_note_mentions` / `task_note_mentions`) and notifies the mentioned user (skip self; idempotent per note+user).

- Types: `lead.mentioned` (database + broadcast + web push) / `task.mentioned` (database + web push)
- Optional mail gated by Settings → Notifications toggles `lead_mentioned` / `task_mentioned` (default off)
- SPA registry routes to the lead/task detail sheet; composer shared on lead Notes and task Comments tabs

## Leave self-service + salary deduction on approve (2026-08-03)

Staff (and managers) submit leave only for their linked active employee; admin/superadmin may create on behalf of others. Managers still approve others’ pending requests. Reject requires `review_notes`. Approve accepts optional `deduct_salary` (default `!leaveType.is_paid`); overriding the default requires notes. Payroll `PayPeriodCalculator` uses `deduct_salary` (legacy null rows fall back to `!is_paid`). Default staff role gains `leave-management.create` + `leave-management.update` (additive sync).

## Leave catalog authz (2026-08-03)

Staff `leave-management.create` / `update` remain for **leave requests** only. Leave **types** and **balances** writes require admin/owner. Staff balance lists are scoped to self; managers may view for review.

## Attendance self-service production hardening (2026-08-03)

- Staff cannot change attendance `status` (manager/admin only); self marks force Present
- Login and `/me` include `employee_id` for self-service UX
- Managers cannot approve their own leave requests
- Self check-in/out uses workspace timezone

## Attendance self-service (2026-08-03)

Staff linked to an active employee can mark their own attendance and check out; managers/admins can mark anyone and correct times/notes. Login auto check-in is unchanged. Staff lists are scoped to their own records. Default staff role gains `attendance.create` + `attendance.update` (additive sync for existing workspaces).

## Profile avatar upload (2026-08-03)

Users can upload a profile picture on **Profile** (Central and Tenant). The photo replaces initials in the topbar user menu and sidebar account chip.

- `POST/DELETE /api/{central|tenant}/v1/me/avatar` (multipart `file`: jpg/png/webp, max 2 MB)
- Login and `/me` payloads include nullable absolute `avatar_url` (API origin `/storage/...`)
- Avatars always store on the `public` disk (`FILESYSTEM_AVATAR_DISK`, default `public`) — never S3, even when `FILESYSTEM_DISK=s3`
- `storage:migrate-to-s3` skips `/avatars/` keys so profile photos stay on local public storage
- Persist `storage/app/public` across zero-downtime deploys (Forge shared storage) so avatars survive releases
- Tenant `users.avatar_path` column added; central already had `avatar_path`
- SPA resolves relative asset URLs against the API host so Vite/dev origins still show the photo

## Compact UI density + keyboard shortcuts (2026-08-03)

**Density**

- Admin shell tightened toward shadcn / Laravel starter density: Inter UI font, narrower sidebar (`w-60`), shorter topbar (`h-14`), smaller page titles, denser nav rows, tighter content padding and control heights.

**Keyboard shortcuts**

| Shortcut | Scope | Action |
|----------|-------|--------|
| `Ctrl/⌘B` | App shell | Collapse / expand sidebar (mobile: open/close drawer) |
| `Ctrl/⌘K` | App shell | Command palette (navigate pages) — unchanged |
| `N` | Active module list | Open **New** create dialog when permitted |
| `Ctrl/⌘F` | Active module list | Focus that module’s search field (not browser Find / not ⌘K) |

**Note:** Chromium reserves `Ctrl/⌘N` for a new browser window — web apps cannot override it. Create uses bare **`N`** when focus is not in an input.

Shortcuts are ignored while typing in inputs. Module pages register via `useModuleShortcuts` (mirror Leads). UI hints use `ShortcutHint` on New buttons and list search fields.

## Departments module (2026-08-03)

Marketplace HR module (`departments`, not default-included) for organizing users and employees:

- One User manager per department; one user may manage many departments
- Many-to-many membership for users and employees
- Admins see all departments; managers see managed departments + performance; staff see memberships
- Performance dashboard aggregates Leads/Tasks for linked users only (unlinked employees stay on the roster)
- Employee forms use multi-select `department_ids` when Departments is installed (legacy string column retained)
- Manager/member pickers include the signed-in user (Users list API omits self) so a solo owner can manage a department
- Security: tenant-scoped Exists for manager/members; org-wide-only manager assignment; `manage_members` required to sync memberships on create/update
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

Toggles: task assigned, task completed/reopened, task mentioned, follow-up created, follow-up due/overdue, lead mentioned, meeting events, other module assignments.

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

- Credit Notes (`amount_credited`), Estimates, partial refunds of a posted payment, online payment-gateway capture, multi-currency conversion

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

