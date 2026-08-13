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
| [Production Runbook](./platform-production-runbook) | Primary deploy / go-live checklist |
| [Upgrade Guide](./upgrade) | Migrate-only upgrades for modules & permissions |
| [Release Process](./release-process) | Tagging, versioning, three-repo release checklist |
| [Notification System](./notifications) | Redis, workers, Reverb, rollout checklist, troubleshooting |
| [RC1 Production Readiness](./rc1-production-readiness) | Release candidate hardening notes (absorbed into v1.1.0) |
| [Phase 7 HR Production Readiness](./hr-phase7-production-readiness) | HR go-live checklist, smoke, rollback, sign-off |
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
| [ToDos](./todos) | Personal ToDos module ops |
| [Daily CRM Summary](./daily-crm-summary) | Daily Reminder Time CRM summary — pilot / GA checklist |
| [Calendar](./calendar) | Calendar module ops |
| [Meetings](./meetings) | Meetings module ops |
| [Activities](./activities) | Activities module ops |
| [Opportunities](./opportunities) | Opportunities module ops |
| [Quotations](./quotations) | Quotations module ops |
| [Contracts](./contracts) | Contracts module ops |
| [Invoices](./invoices) | Invoices module ops |
| [Payments](./payments) | Payments module ops |
| [Credit Notes](./credit-notes) | Credit Notes module ops |
| [Estimates](./estimates) | Estimates module ops |
| [Communication Templates](./communication-templates) | Templates module ops |
| [Email](./email) | Personal IMAP/SMTP mailbox ops (`email-sync`, ext-imap) |
| [Branded](./branded) | Custom domains ops |
| [Automation](./automation) | Automation queue, scheduler, webhook SSRF, catalog ops |
| [Employees](./employees) | Employees module ops |
| [Leave Management](./leave-management) | Leave Management module ops |
| [Attendance](./attendance) | Attendance module ops |
| [Payroll](./payroll) | Payroll module ops |

## Related repos

- Backend: [SaaS-Backend](https://github.com/DiligentCreators/SaaS-Backend) (Laravel API)
- Frontend: [SaaS-Frontend](https://github.com/DiligentCreators/SaaS-Frontend) (React SPA)
- Docs: [SaaS-Docs](https://github.com/DiligentCreators/SaaS-Docs) (this site)
