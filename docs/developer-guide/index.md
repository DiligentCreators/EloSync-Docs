# Developer Guide

Engineering documentation for extending EloSync. New business capability ships as **modules** that mirror **Leads** and **Tasks**.

## Core standards

| Document | Description |
|----------|-------------|
| [Documentation Governance](./documentation-governance) | Same-PR docs rule — code + tests + docs |
| [Module Development](./module-development) | Module Development Standard + Definition of Done |
| [Module Development Guide](./module-development-guide) | End-to-end engineer checklist |
| [Module Architecture](/architecture/module-architecture) | Self-contained modules and ownership boundaries |
| [Module Dependencies](/architecture/module-dependencies) | Required vs optional; free vs billable dependencies |
| [Module Licensing](/architecture/module-licensing) | Independent licensing convention |
| [Entitlements](./entitlements) | Module licensing vs Spatie authorization |
| [Database](./database) | ERD / table dictionary |
| [Object Storage](./object-storage) | Wasabi / S3 uploads |
| [Frontend Build Artifacts](./frontend-build-artifacts) | CI/CD → `build-artifacts` branch |
| [Playwright](./playwright) | E2E suites (Central + Tenant) |
| [Tenant Provisioning](./tenant-provisioning) | Workspace create → default modules |
| [Notification Architecture Contract](./notification-architecture-contract) | Frozen notification payload, batching, Reverb, registry |

## Auth, RBAC & settings

| Document | Description |
|----------|-------------|
| [Authentication](./authentication) | Auth architecture, guards, reset flow |
| [Tenant RBAC](./tenant-rbac) | Implementing workspace RBAC |
| [Central Settings](./central-settings) | Settings resolution & APIs |
| [Multi-Provider Email](./multi-provider-email) | EmailManager, drivers, logs, queues, body capture, resend |
| [Email Webhooks](./email-webhooks) | Postmark/Mailgun delivery webhooks |
| [Tenant Settings](./tenant-settings) | Tenant configuration hierarchy |

## UI

| Document | Description |
|----------|-------------|
| [Shared UI](./shared-ui) | Design system and reuse strategy |
| [Shared Layout](./shared-layout) | Shell, nav, and page structure |
| [Module Tours](./module-tours) | driver.js product tours on module list pages |

## Billing

| Document | Description |
|----------|-------------|
| [Billing Engine](./billing-engine) | Gateway-agnostic invoicing |
| [Payment Gateways Overview](./payment-gateways-overview) | Architecture & driver map |
| [Payment Gateways](./payment-gateways) | Implementing gateway drivers |
| [Webhooks](./payment-gateways-webhooks) | Webhook reference |
| [Stripe / Cashier](./stripe-cashier) | Cashier driver notes |
| [Creem](./creem) | Creem checkout and ops |

## Modules

| Document | Description |
|----------|-------------|
| [Leads](./leads) | Leads reference implementation |
| [Contacts](./contacts) | Contacts module engineering guide |
| [Tasks](./tasks) | Tasks module engineering guide |
| [ToDos](./todos) | Personal ToDos module engineering guide |
| [Opportunities](./opportunities) | Opportunities + pipeline engineering guide |
| [Quotations](./quotations) | Quotations module engineering guide |
| [Contracts](./contracts) | Contracts module engineering guide |
| [Invoices](./invoices) | Invoices module engineering guide |
| [Payments](./payments) | Payments module engineering guide |
| [Credit Notes](./credit-notes) | Credit Notes module engineering guide |
| [Estimates](./estimates) | Estimates module engineering guide |
| [Communication Templates](./communication-templates) | Templates, placeholders, WhatsApp render |
| [Email](./email) | Personal IMAP/SMTP mailbox, sync jobs, templates, signatures |
| [Automation](./automation) | Cross-module trigger → condition → action engine |
| [Knowledge Base](./knowledge-base) | Internal articles Marketplace opt-in (Operations, free) |

## Lead ingest & integrations

| Document | Description |
|----------|-------------|
| [Lead Source Driver Architecture](./lead-source-driver-architecture) | Shared pipeline for all lead ingestion drivers |
| [Custom Lead Webhook](./custom-lead-webhook) | Per-tenant webhook ingress |
| [Meta App Setup](./meta-app-setup) | Create Meta Developer App + wire EloSync / EloSync (operator guide) |
| [Meta Lead Ads](./meta-lead-ads-integration) | Shipped — `MetaLeadAdsDriver`, OAuth, webhooks |
| [WhatsApp Cloud Integration](./whatsapp-cloud-integration) | Planned — Cloud API messaging beyond `wa.me` |
