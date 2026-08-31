# Deployment Guide

Production runbooks and operational checklists for hosting EloSync.

| Start here | When |
|------------|------|
| [Laravel Forge Deployment](./laravel-forge) | Hosting API + SPA + Docs on Forge (recommended) |
| [Production Runbook](./platform-production-runbook) | Launch blockers, smoke, rollback |
| [Installation](/getting-started/installation) | Local Herd / Vite development only |

## Go-live

| Document | Description |
|----------|-------------|
| [Laravel Forge Deployment](./laravel-forge) | Three-site Forge topology, `.env`, deploy scripts, daemons, Reverb, email |
| [Marketing pixels](./marketing-pixels) | Optional GTM, Meta, LinkedIn, X tags (product SPA + marketing site) |
| [Production Runbook](./platform-production-runbook) | Primary deploy / go-live checklist |
| [Upgrade Guide](./upgrade) | Migrate-only upgrades for modules & permissions |
| [Release Process](./release-process) | Tagging, versioning, three-repo release checklist |
| [Notification System](./notifications) | Redis, workers, Reverb, rollout checklist, troubleshooting |
| [RC1 Production Readiness](./rc1-production-readiness) | Release candidate hardening notes (absorbed into v1.1.0) |
| [Phase 7 HR Production Readiness](./hr-phase7-production-readiness) | HR go-live checklist, smoke, rollback, sign-off |
| [Automation Production Readiness](./automation-production-readiness) | Automation go-live checklist, smoke, rollback, sign-off |
| [WhatsApp Cloud Production Readiness](./whatsapp-cloud-production-readiness) | WhatsApp Cloud MVP go-live checklist, smoke, residual risk |
| [Knowledge Base Production Readiness](./knowledge-base-production-readiness) | Knowledge Base audit, go-live checklist, smoke, rollback, sign-off |
| [Storage Production Readiness](./storage-production-readiness) | Storage module audit, blockers, smoke, rollback, sign-off |
| [Invoices Production Readiness](./invoices-production-readiness) | Invoices 1.1.0 recurring + PDF audit, smoke, rollback, sign-off |
| [Contracts Production Readiness](./contracts-production-readiness) | Contracts 1.1.0 auto-fill + HTML memos — **Go** |
| [Billing product line picker](./billing-product-line-picker-production-readiness) | Quotes/estimates/invoices optional `product_id` + Products HTML — **Go** |
| [Sales document convert](./sales-document-convert-production-readiness) | Quote/estimate/contract → invoice integrity — **Go** |
| [Documents Production Readiness](./documents-production-readiness) | Documents 1.0.1 free opt-in audit, smoke, rollback, sign-off |
| [Tenant Audit & Impersonation History](./tenant-audit-impersonation-production-readiness) | Central Impersonation history + Audit Logs tabs — Go |
| [Newest-first notes & activity](./newest-first-notes-activity-production-readiness) | Module show notes/activities DESC — Go |
| [Dedicated record pages UX](./dedicated-record-pages-production-readiness) | List + create/view/edit pages — **Go** |
| [AI Assistant Production Readiness](./ai-production-readiness) | AI module + credits BYOK — **Go** (platform) |
| [AI Workspace Search Production Readiness](./ai-workspace-search-production-readiness) | `search_workspace` / ai **1.3.0** — **Go** (merge + migrate) |
| [Phase 7 HR Security Audit](./hr-phase7-security-audit) | HR findings, remediations, residual risk |
| [Go-Live Hardening](./go-live-hardening-2026-07-15) | Hardening delivery notes |

## Domain ops guides

| Document | Description |
|----------|-------------|
| [Authentication](./authentication) | Mail, reset, session, security ops |
| [Tenant RBAC](./tenant-rbac) | RBAC production checklist |
| [Central Settings](./central-settings) | System settings ops |
| [Tenant Settings](./tenant-settings) | Workspace branding & mail ops |
| [Payment Gateways](./payment-gateways) | Stripe / Creem production ops |
| [Module Development](./module-development) | Shipping modules to production |
| [Leads](./leads) | Leads module ops |
| [Contacts](./contacts) | Contacts module ops |
| [Tasks](./tasks) | Tasks module ops |
| [Projects](./projects) | Projects module ops |
| [ToDos](./todos) | Personal ToDos module ops |
| [Daily CRM Summary](./daily-crm-summary) | Daily Reminder Time CRM summary — pilot / GA checklist |
| [Calendar](./calendar) | Calendar module ops |
| [Meetings](./meetings) | Meetings module ops |
| [Activities](./activities) | Activities module ops |
| [Opportunities](./opportunities) | Opportunities module ops |
| [Quotations](./quotations) | Quotations module ops |
| [Contracts](./contracts) | Contracts module ops ([1.1.0 readiness](./contracts-production-readiness)) |
| [Invoices](./invoices) | Invoices module ops ([1.1.0 readiness](./invoices-production-readiness)) |
| [Payments](./payments) | Payments module ops |
| [Credit Notes](./credit-notes) | Credit Notes module ops |
| [Estimates](./estimates) | Estimates module ops |
| [Communication Templates](./communication-templates) | Templates module ops |
| [Email](./email) | Personal IMAP/SMTP mailbox ops (`email-sync`, ext-imap) |
| [Branded](./branded) | Custom domains ops |
| [Storage](./storage) | Content quota packs + Wasabi mapping |
| [Automation](./automation) | Automation queue, scheduler, webhook SSRF, catalog ops |
| [Knowledge Base](./knowledge-base) | Internal articles Marketplace opt-in ops |
| [Employees](./employees) | Employees module ops |
| [Leave Management](./leave-management) | Leave Management module ops |
| [Attendance](./attendance) | Attendance module ops |
| [Payroll](./payroll) | Payroll module ops |
| [Help Desk](./help-desk) | Help Desk module ops (migrate-only catalog + permissions) |
| [Assets](./assets) | Assets Marketplace opt-in ops |
| [Documents](./documents) | Documents Marketplace opt-in ops ([1.0.1 readiness](./documents-production-readiness); hard Storage dependency) |
| [WhatsApp Cloud](./whatsapp-cloud) | WhatsApp Cloud API ops (env, webhook, queues) |
| [WhatsApp Cloud Production Readiness](./whatsapp-cloud-production-readiness) | Go-live audit / Conditional Go |
| [Reports (Analytics)](./analytics) | Reports suite ops (slug `analytics`; migrate-only catalog + permissions) |
| [Reports Production Readiness](./analytics-production-readiness) | Reports suite 1.1.0 Go / No-Go audit |

## Related repos

- Backend: [EloSync-Backend](https://github.com/DiligentCreators/EloSync-Backend) (Laravel API)
- Frontend: [EloSync-Frontend](https://github.com/DiligentCreators/EloSync-Frontend) (React SPA)
- Docs: [EloSync-Docs](https://github.com/DiligentCreators/EloSync-Docs) (this site)
- Website: [EloSync-Website](https://github.com/DiligentCreators/EloSync-Website) (marketing)
- Mobile: [EloSync-Mobile](https://github.com/DiligentCreators/EloSync-Mobile) (Expo)
