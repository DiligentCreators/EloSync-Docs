# Knowledge Base — Developer Guide

Marketplace Operations module (`knowledge-base` **1.0.0**). Flat namespaces (no `Modules/` package). Internal workspace articles only — no public portal.

## Backend layout

| Piece | Path |
|-------|------|
| Models | `KnowledgeBaseArticle`, `KnowledgeBaseCategory`, `KnowledgeBaseArticleNote`, `KnowledgeBaseArticleActivity` |
| Enums | `KnowledgeBaseArticleStatusEnum`, `KnowledgeBaseArticleActivityTypeEnum` |
| Services | `KnowledgeBaseArticleService`, `KnowledgeBaseCategoryService` |
| Controllers | `KnowledgeBaseArticleController`, `KnowledgeBaseCategoryController` |
| Requests | `app/Http/Requests/Tenant/Api/V1/KnowledgeBase*`, `KnowledgeBaseCategory*` |
| Resources | `app/Http/Resources/Tenant/Api/V1/KnowledgeBase*`, `KnowledgeBaseCategory*` |
| Policies | `KnowledgeBaseArticlePolicy`, `KnowledgeBaseCategoryPolicy` |
| Events | `KnowledgeBaseArticleCreated`, `Updated`, `Deleted`, `NoteAdded` |
| Subscriber | `KnowledgeBaseArticleEventSubscriber` (PlatformAuditService) |
| Tests | `tests/Feature/Tenant/KnowledgeBase/KnowledgeBaseArticleTest.php` |

## Authz and visibility

- Routes: `module:knowledge-base` for all endpoints
- Reads: `can:knowledge-base.view`
- Mutations: `can:knowledge-base.create|update|delete|restore|force.delete` as on each route
- Categories reuse the same `knowledge-base.*` permissions

**Audience visibility:** actors without `knowledge-base.update` are limited to `scopeVisibleToAudience()` (status `published`). Actors with update may filter `status` and `trashed` (`only` / `true` / `with`). Policy `view` allows update holders any non-gate-failed row; view-only holders only non-trashed published articles.

## Date and time

`published_at` uses `UtcDateTime`. API responses serialize absolute datetimes as UTC ISO-8601 (`...Z` / UtcIso). Publishing sets `published_at` via `now()` when transitioning into published with a null stamp; draft clears it.

## Domain rules

- Slugs unique per tenant for articles and categories
- Category soft/force delete blocked while articles (including trashed for force) still reference the category
- Articles: notes + `knowledge_base_article_activities` timeline; model uses Spatie `LogsActivity` (`useLogName('knowledge-base')`)
- Platform audit: `knowledge_base_article_created|updated|deleted|note_added`
- No hard `module_dependencies`

## Frontend

- Pages: `src/pages/knowledge-base/`
- Tour: `tourId="knowledge-base"` (`src/tours/knowledge-base.ts`)
- Nav: `module:knowledge-base` + `knowledge-base.view`
- Playwright: `npm run test:e2e:knowledge-base`

## Permissions config

```
knowledge-base.view | create | update | delete | restore | force.delete
```

Default roles: admin = all except force.delete; manager = view/create/update; staff = view.

## Catalog registration

Data migration `register_knowledge_base_module` (`is_default_included: false`, `is_billable: false`, version `1.0.0`, category `operations`, sort `60`) — **no** `installForWorkspacesMissingModule`. Permissions sync migration grants additive defaults (not `force.delete`).

## Tests

```bash
php artisan test --compact tests/Feature/Tenant/KnowledgeBase
npm run test:e2e:knowledge-base
```

## Related

- [API](/api/tenant-v1-knowledge-base)
- [Deployment](/deployment/knowledge-base)
- [User guide](/user-guide/knowledge-base)
- [Module development](/developer-guide/module-development)
