# Deployment Guide

Production runbooks and operational checklists for hosting SaleOS.

| Start here | When |
|------------|------|
| [Laravel Forge Deployment](./laravel-forge) | Hosting API + SPA + Docs on Forge (recommended) |
| [Production Runbook](./platform-production-runbook) | Launch blockers, smoke, rollback |
| [Installation](/getting-started/installation) | Local Herd / Vite development only |

## Go-live

| Document | Description |
|----------|-------------|
| [Laravel Forge Deployment](./laravel-forge) | Three-site Forge topology, `.env`, deploy scripts, daemons, Reverb, email |
| [Production Runbook](./platform-production-runbook) | Primary deploy / go-live checklist |
| [Upgrade Guide](./upgrade) | Migrate-only upgrades for modules & permissions |
| [Release Process](./release-process) | Tagging, versioning, three-repo release checklist |
| [Notification System](./notifications) | Redis, workers, Reverb, rollout checklist, troubleshooting |
| [RC1 Production Readiness](./rc1-production-readiness) | Release candidate hardening notes (absorbed into v1.1.0) |
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
| [Daily CRM Summary](./daily-crm-summary) | Daily Reminder Time CRM summary — pilot / GA checklist |
| [Calendar](./calendar) | Calendar module ops |
| [Meetings](./meetings) | Meetings module ops |
| [Activities](./activities) | Activities module ops |
| [Opportunities](./opportunities) | Opportunities module ops |
| [Quotations](./quotations) | Quotations module ops |
| [Contracts](./contracts) | Contracts module ops |
| [Communication Templates](./communication-templates) | Templates module ops |
| [Branded](./branded) | Custom domains ops |

## Related repos

- Backend: [SaaS-Backend](https://github.com/DiligentCreators/SaaS-Backend) (Laravel API)
- Frontend: [SaaS-Frontend](https://github.com/DiligentCreators/SaaS-Frontend) (React SPA)
- Docs: [SaaS-Docs](https://github.com/DiligentCreators/SaaS-Docs) (this site)
