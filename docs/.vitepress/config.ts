import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const configDir = fileURLToPath(new URL('.', import.meta.url))
const SITE_URL = 'https://docs.elosync.com'
const SITE_TITLE = 'EloSync Docs'
const SITE_DESCRIPTION = 'Official documentation for the EloSync SaaS Platform.'
const OG_IMAGE = `${SITE_URL}/og-image.svg`

function pageUrl(relativePath: string): string {
  const path = relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')

  if (!path || path === '/') {
    return `${SITE_URL}/`
  }

  return `${SITE_URL}/${path.replace(/^\//, '')}`
}

export default defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,

  // Root deployment at https://docs.elosync.com (not GitHub Pages)
  base: '/',

  cleanUrls: true,
  lastUpdated: true,
  appearance: true,
  ignoreDeadLinks: false,

  // Relative to docs/ — produces docs/.vitepress/dist
  outDir: '.vitepress/dist',

  vite: {
    publicDir: resolve(configDir, 'public'),
    // Docs site bundles grow with roadmap/search-index pages; the local search
    // index chunk alone is already ~1 MB, so 1000 kB triggers Rollup's advisory
    // and the Quality Gate (which greps build logs for "warning") fails. Give
    // enough headroom above current chunk sizes so this doesn't warn again as
    // more pages are added.
    build: {
      chunkSizeWarningLimit: 2500,
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0f766e' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: SITE_TITLE }],
    ['meta', { property: 'og:title', content: SITE_TITLE }],
    ['meta', { property: 'og:description', content: SITE_DESCRIPTION }],
    ['meta', { property: 'og:url', content: `${SITE_URL}/` }],
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: SITE_TITLE }],
    ['meta', { name: 'twitter:description', content: SITE_DESCRIPTION }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
  ],

  sitemap: {
    hostname: SITE_URL,
    transformItems: (items) =>
      items.filter((item) => !item.url.replace(/\/$/, '').endsWith('404')),
  },

  markdown: {
    languageAlias: {
      env: 'ini',
    },
  },

  transformPageData(pageData) {
    const title =
      pageData.frontmatter.layout === 'home'
        ? SITE_TITLE
        : pageData.title
          ? `${pageData.title} | ${SITE_TITLE}`
          : SITE_TITLE

    const description =
      pageData.description ||
      (typeof pageData.frontmatter.description === 'string'
        ? pageData.frontmatter.description
        : SITE_DESCRIPTION)

    const url = pageUrl(pageData.relativePath)

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: OG_IMAGE }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: OG_IMAGE }],
      ['link', { rel: 'canonical', href: url }],
    )
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: SITE_TITLE,

    nav: [
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Product', link: '/product/founding-beta' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'User Guide', link: '/user-guide/' },
      { text: 'Developer Guide', link: '/developer-guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Deployment', link: '/deployment/' },
      { text: 'Changelog', link: '/changelog/' },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/getting-started/' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Platform Freeze', link: '/getting-started/platform-freeze' },
            { text: 'Product Roadmap', link: '/getting-started/product-roadmap' },
            { text: 'Founding Beta', link: '/product/founding-beta' },
            { text: 'Documentation Governance', link: '/developer-guide/documentation-governance' },
            { text: 'Local Demo Data', link: '/getting-started/local-demo-data' },
          ],
        },
      ],
      '/product/': [
        {
          text: 'Product',
          items: [
            { text: 'Founding Beta', link: '/product/founding-beta' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Module Architecture', link: '/architecture/module-architecture' },
            { text: 'Module Dependencies', link: '/architecture/module-dependencies' },
            { text: 'Module Licensing', link: '/architecture/module-licensing' },
          ],
        },
      ],
      '/user-guide/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Overview', link: '/user-guide/' },
            { text: 'Tenant Application', link: '/user-guide/tenant-application' },
            { text: 'Authentication', link: '/user-guide/authentication' },
            { text: 'Admin UI', link: '/user-guide/admin-ui' },
            { text: 'Shared Layout', link: '/user-guide/shared-layout' },
          ],
        },
        {
          text: 'Access & Settings',
          items: [
            { text: 'Tenant RBAC Overview', link: '/user-guide/tenant-rbac-overview' },
            { text: 'Tenant RBAC', link: '/user-guide/tenant-rbac' },
            { text: 'Central Settings Overview', link: '/user-guide/central-settings-overview' },
            { text: 'Central Settings', link: '/user-guide/central-settings' },
            { text: 'Tenant Settings Overview', link: '/user-guide/tenant-settings-overview' },
            { text: 'Tenant Settings', link: '/user-guide/tenant-settings' },
            { text: 'Payment Gateways', link: '/user-guide/payment-gateways' },
          ],
        },
        {
          text: 'Modules',
          items: [
            { text: 'Leads Overview', link: '/user-guide/leads-overview' },
            { text: 'Leads', link: '/user-guide/leads' },
            { text: 'Companies Overview', link: '/user-guide/companies-overview' },
            { text: 'Companies', link: '/user-guide/companies' },
            { text: 'Contacts Overview', link: '/user-guide/contacts-overview' },
            { text: 'Contacts', link: '/user-guide/contacts' },
            { text: 'Tasks Overview', link: '/user-guide/tasks-overview' },
            { text: 'Tasks', link: '/user-guide/tasks' },
            { text: 'Projects Overview', link: '/user-guide/projects-overview' },
            { text: 'Projects', link: '/user-guide/projects' },
            { text: 'Automation Overview', link: '/user-guide/automation-overview' },
            { text: 'Automation', link: '/user-guide/automation' },
            { text: 'Knowledge Base Overview', link: '/user-guide/knowledge-base-overview' },
            { text: 'Knowledge Base', link: '/user-guide/knowledge-base' },
            { text: 'Reports Overview', link: '/user-guide/analytics-overview' },
            { text: 'Reports', link: '/user-guide/analytics' },
            { text: 'ToDos Overview', link: '/user-guide/todos-overview' },
            { text: 'ToDos', link: '/user-guide/todos' },
            { text: 'Announcements Overview', link: '/user-guide/announcements-overview' },
            { text: 'Announcements', link: '/user-guide/announcements' },
            { text: 'Team Chat', link: '/user-guide/team-chat' },
            { text: 'Give Feedback', link: '/user-guide/feedback' },
            { text: 'Calendar Overview', link: '/user-guide/calendar-overview' },
            { text: 'Calendar', link: '/user-guide/calendar' },
            { text: 'Meetings Overview', link: '/user-guide/meetings-overview' },
            { text: 'Meetings', link: '/user-guide/meetings' },
            { text: 'Activities Overview', link: '/user-guide/activities-overview' },
            { text: 'Activities', link: '/user-guide/activities' },
            { text: 'Opportunities Overview', link: '/user-guide/opportunities-overview' },
            { text: 'Opportunities', link: '/user-guide/opportunities' },
            { text: 'Quotations Overview', link: '/user-guide/quotations-overview' },
            { text: 'Quotations', link: '/user-guide/quotations' },
            { text: 'Contracts Overview', link: '/user-guide/contracts-overview' },
            { text: 'Contracts', link: '/user-guide/contracts' },
            { text: 'Resellers Overview', link: '/user-guide/resellers-overview' },
            { text: 'Resellers', link: '/user-guide/resellers' },
            { text: 'Reseller Payouts Overview', link: '/user-guide/reseller-payouts-overview' },
            { text: 'Reseller Payouts', link: '/user-guide/reseller-payouts' },
            { text: 'Invoices Overview', link: '/user-guide/invoices-overview' },
            { text: 'Invoices', link: '/user-guide/invoices' },
            { text: 'Payments Overview', link: '/user-guide/payments-overview' },
            { text: 'Payments', link: '/user-guide/payments' },
            { text: 'Credit Notes Overview', link: '/user-guide/credit-notes-overview' },
            { text: 'Credit Notes', link: '/user-guide/credit-notes' },
            { text: 'Estimates Overview', link: '/user-guide/estimates-overview' },
            { text: 'Estimates', link: '/user-guide/estimates' },
            { text: 'Vendors Overview', link: '/user-guide/vendors-overview' },
            { text: 'Vendors', link: '/user-guide/vendors' },
            { text: 'Purchase Orders Overview', link: '/user-guide/purchase-orders-overview' },
            { text: 'Purchase Orders', link: '/user-guide/purchase-orders' },
            { text: 'Expenses Overview', link: '/user-guide/expenses-overview' },
            { text: 'Expenses', link: '/user-guide/expenses' },
            { text: 'Products Overview', link: '/user-guide/products-overview' },
            { text: 'Products', link: '/user-guide/products' },
            { text: 'Warehouses Overview', link: '/user-guide/warehouses-overview' },
            { text: 'Warehouses', link: '/user-guide/warehouses' },
            { text: 'Inventory Overview', link: '/user-guide/inventory-overview' },
            { text: 'Inventory', link: '/user-guide/inventory' },
            { text: 'Accounting Overview', link: '/user-guide/accounting-overview' },
            { text: 'Accounting', link: '/user-guide/accounting' },
            { text: 'Financial Reports Overview', link: '/user-guide/financial-reports-overview' },
            { text: 'Financial Reports', link: '/user-guide/financial-reports' },
            { text: 'Employees Overview', link: '/user-guide/employees-overview' },
            { text: 'Employees', link: '/user-guide/employees' },
            { text: 'Departments Overview', link: '/user-guide/departments-overview' },
            { text: 'Departments', link: '/user-guide/departments' },
            { text: 'Leave Management Overview', link: '/user-guide/leave-management-overview' },
            { text: 'Leave Management', link: '/user-guide/leave-management' },
            { text: 'Attendance Overview', link: '/user-guide/attendance-overview' },
            { text: 'Attendance', link: '/user-guide/attendance' },
            { text: 'Payroll Overview', link: '/user-guide/payroll-overview' },
            { text: 'Payroll', link: '/user-guide/payroll' },
            { text: 'Help Desk Overview', link: '/user-guide/help-desk-overview' },
            { text: 'Help Desk', link: '/user-guide/help-desk' },
            { text: 'Communication Templates', link: '/user-guide/communication-templates' },
            { text: 'Email', link: '/user-guide/email' },
            { text: 'Branded', link: '/user-guide/branded' },
            { text: 'Storage Overview', link: '/user-guide/storage-overview' },
            { text: 'Storage', link: '/user-guide/storage' },
          ],
        },
      ],
      '/developer-guide/': [
        {
          text: 'Developer Guide',
          items: [
            { text: 'Overview', link: '/developer-guide/' },
            { text: 'Documentation Governance', link: '/developer-guide/documentation-governance' },
            { text: 'Module Development', link: '/developer-guide/module-development' },
            { text: 'Module Development Guide', link: '/developer-guide/module-development-guide' },
            { text: 'Module Architecture', link: '/architecture/module-architecture' },
            { text: 'Module Dependencies', link: '/architecture/module-dependencies' },
            { text: 'Module Licensing', link: '/architecture/module-licensing' },
            { text: 'Entitlements', link: '/developer-guide/entitlements' },
            { text: 'Database', link: '/developer-guide/database' },
            { text: 'Object Storage', link: '/developer-guide/object-storage' },
            { text: 'Storage', link: '/developer-guide/storage' },
            { text: 'Frontend Build Artifacts', link: '/developer-guide/frontend-build-artifacts' },
            { text: 'Playwright', link: '/developer-guide/playwright' },
            { text: 'Tenant Provisioning', link: '/developer-guide/tenant-provisioning' },
          ],
        },
        {
          text: 'Auth, RBAC & Settings',
          items: [
            { text: 'Authentication', link: '/developer-guide/authentication' },
            { text: 'Tenant RBAC', link: '/developer-guide/tenant-rbac' },
            { text: 'Central Settings', link: '/developer-guide/central-settings' },
            { text: 'Tenant Settings', link: '/developer-guide/tenant-settings' },
            { text: 'Central Feedback System', link: '/developer-guide/central-feedback-system' },
            { text: 'Multi-Provider Email', link: '/developer-guide/multi-provider-email' },
            { text: 'Email Webhooks', link: '/developer-guide/email-webhooks' },
          ],
        },
        {
          text: 'UI',
          items: [
            { text: 'Shared UI Architecture', link: '/developer-guide/shared-ui' },
            { text: 'Shared Layout', link: '/developer-guide/shared-layout' },
            { text: 'Module Tours', link: '/developer-guide/module-tours' },
          ],
        },
        {
          text: 'Billing',
          items: [
            { text: 'Billing Engine', link: '/developer-guide/billing-engine' },
            { text: 'Payment Gateways Overview', link: '/developer-guide/payment-gateways-overview' },
            { text: 'Payment Gateways', link: '/developer-guide/payment-gateways' },
            { text: 'Webhooks', link: '/developer-guide/payment-gateways-webhooks' },
            { text: 'Stripe / Cashier', link: '/developer-guide/stripe-cashier' },
            { text: 'Creem', link: '/developer-guide/creem' },
          ],
        },
        {
          text: 'Modules',
          items: [
            { text: 'Leads', link: '/developer-guide/leads' },
            { text: 'Companies', link: '/developer-guide/companies' },
            { text: 'Contacts', link: '/developer-guide/contacts' },
            { text: 'Tasks', link: '/developer-guide/tasks' },
            { text: 'Projects', link: '/developer-guide/projects' },
            { text: 'Automation', link: '/developer-guide/automation' },
            { text: 'Knowledge Base', link: '/developer-guide/knowledge-base' },
            { text: 'Reports (Analytics)', link: '/developer-guide/analytics' },
            { text: 'ToDos', link: '/developer-guide/todos' },
            { text: 'Announcements', link: '/developer-guide/announcements' },
            { text: 'Calendar', link: '/developer-guide/calendar' },
            { text: 'Meetings', link: '/developer-guide/meetings' },
            { text: 'Activities', link: '/developer-guide/activities' },
            { text: 'Opportunities', link: '/developer-guide/opportunities' },
            { text: 'Quotations', link: '/developer-guide/quotations' },
            { text: 'Contracts', link: '/developer-guide/contracts' },
            { text: 'Resellers', link: '/developer-guide/resellers' },
            { text: 'Reseller Payouts', link: '/developer-guide/reseller-payouts' },
            { text: 'Invoices', link: '/developer-guide/invoices' },
            { text: 'Payments', link: '/developer-guide/payments' },
            { text: 'Credit Notes', link: '/developer-guide/credit-notes' },
            { text: 'Estimates', link: '/developer-guide/estimates' },
            { text: 'Vendors', link: '/developer-guide/vendors' },
            { text: 'Purchase Orders', link: '/developer-guide/purchase-orders' },
            { text: 'Expenses', link: '/developer-guide/expenses' },
            { text: 'Products', link: '/developer-guide/products' },
            { text: 'Warehouses', link: '/developer-guide/warehouses' },
            { text: 'Inventory', link: '/developer-guide/inventory' },
            { text: 'Accounting', link: '/developer-guide/accounting' },
            { text: 'Financial Reports', link: '/developer-guide/financial-reports' },
            { text: 'Employees', link: '/developer-guide/employees' },
            { text: 'Departments', link: '/developer-guide/departments' },
            { text: 'Leave Management', link: '/developer-guide/leave-management' },
            { text: 'Attendance', link: '/developer-guide/attendance' },
            { text: 'Payroll', link: '/developer-guide/payroll' },
            { text: 'Help Desk', link: '/developer-guide/help-desk' },
            { text: 'Communication Templates', link: '/developer-guide/communication-templates' },
            { text: 'Email', link: '/developer-guide/email' },
            { text: 'Branded', link: '/developer-guide/branded' },
            { text: 'Storage', link: '/developer-guide/storage' },
          ],
        },
        {
          text: 'Future Integrations',
          items: [
            { text: 'Lead Source Driver Architecture', link: '/developer-guide/lead-source-driver-architecture' },
            { text: 'Custom Lead Webhook', link: '/developer-guide/custom-lead-webhook' },
            { text: 'Meta App Setup', link: '/developer-guide/meta-app-setup' },
            { text: 'Meta Lead Ads', link: '/developer-guide/meta-lead-ads-integration' },
            { text: 'WhatsApp Cloud Integration', link: '/developer-guide/whatsapp-cloud-integration' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Central v1', link: '/api/central-v1' },
            { text: 'Tenant Dashboard', link: '/api/tenant-v1-dashboard' },
            { text: 'Tenant Leads', link: '/api/tenant-v1-leads' },
            { text: 'Tenant Companies', link: '/api/tenant-v1-companies' },
            { text: 'Tenant Contacts', link: '/api/tenant-v1-contacts' },
            { text: 'Tenant Tasks', link: '/api/tenant-v1-tasks' },
            { text: 'Tenant Projects', link: '/api/tenant-v1-projects' },
            { text: 'Tenant Automation', link: '/api/tenant-v1-automation' },
            { text: 'Tenant Knowledge Base', link: '/api/tenant-v1-knowledge-base' },
            { text: 'Tenant Reports (Analytics)', link: '/api/tenant-v1-analytics' },
            { text: 'Tenant ToDos', link: '/api/tenant-v1-todos' },
            { text: 'Tenant Announcements', link: '/api/tenant-v1-announcements' },
            { text: 'Tenant Calendar', link: '/api/tenant-v1-calendar' },
            { text: 'Tenant Meetings', link: '/api/tenant-v1-meetings' },
            { text: 'Tenant Activities', link: '/api/tenant-v1-activities' },
            { text: 'Tenant Opportunities', link: '/api/tenant-v1-opportunities' },
            { text: 'Tenant Quotations', link: '/api/tenant-v1-quotations' },
            { text: 'Tenant Contracts', link: '/api/tenant-v1-contracts' },
            { text: 'Tenant Resellers', link: '/api/tenant-v1-resellers' },
            { text: 'Tenant Reseller Payouts', link: '/api/tenant-v1-reseller-payouts' },
            { text: 'Tenant Invoices', link: '/api/tenant-v1-invoices' },
            { text: 'Tenant Payments', link: '/api/tenant-v1-payments' },
            { text: 'Tenant Credit Notes', link: '/api/tenant-v1-credit-notes' },
            { text: 'Tenant Estimates', link: '/api/tenant-v1-estimates' },
            { text: 'Tenant Vendors', link: '/api/tenant-v1-vendors' },
            { text: 'Tenant Purchase Orders', link: '/api/tenant-v1-purchase-orders' },
            { text: 'Tenant Expenses', link: '/api/tenant-v1-expenses' },
            { text: 'Tenant Accounting', link: '/api/tenant-v1-accounting' },
            { text: 'Tenant Financial Reports', link: '/api/tenant-v1-financial-reports' },
            { text: 'Tenant Products', link: '/api/tenant-v1-products' },
            { text: 'Tenant Warehouses', link: '/api/tenant-v1-warehouses' },
            { text: 'Tenant Inventory', link: '/api/tenant-v1-inventory' },
            { text: 'Tenant Employees', link: '/api/tenant-v1-employees' },
            { text: 'Tenant Departments', link: '/api/tenant-v1-departments' },
            { text: 'Tenant Leave Management', link: '/api/tenant-v1-leave-management' },
            { text: 'Tenant Attendance', link: '/api/tenant-v1-attendance' },
            { text: 'Tenant Payroll', link: '/api/tenant-v1-payroll' },
            { text: 'Tenant Help Desk', link: '/api/tenant-v1-help-desk' },
            { text: 'Tenant Communication Templates', link: '/api/tenant-v1-communication-templates' },
            { text: 'Tenant Email', link: '/api/tenant-v1-email' },
            { text: 'Tenant Notifications', link: '/api/tenant-v1-notifications' },
            { text: 'Tenant Team Chat', link: '/api/tenant-v1-team-chat' },
            { text: 'Tenant Marketplace', link: '/api/tenant-v1-marketplace' },
            { text: 'Tenant Users', link: '/api/tenant-v1-users' },
            { text: 'Tenant Branded Domain', link: '/api/tenant-v1-branded' },
            { text: 'Tenant Storage', link: '/api/tenant-v1-storage' },
          ],
        },
      ],
      '/deployment/': [
        {
          text: 'Deployment',
          items: [
            { text: 'Overview', link: '/deployment/' },
            { text: 'Laravel Forge', link: '/deployment/laravel-forge' },
            { text: 'Production Runbook', link: '/deployment/platform-production-runbook' },
            { text: 'Upgrade Guide', link: '/deployment/upgrade' },
            { text: 'Release Process', link: '/deployment/release-process' },
            { text: 'Notification System', link: '/deployment/notifications' },
            { text: 'RC1 Production Readiness', link: '/deployment/rc1-production-readiness' },
            { text: 'Phase 7 HR Production Readiness', link: '/deployment/hr-phase7-production-readiness' },
            { text: 'Phase 7 HR Security Audit', link: '/deployment/hr-phase7-security-audit' },
            { text: 'Knowledge Base Production Readiness', link: '/deployment/knowledge-base-production-readiness' },
            { text: 'Reports Production Readiness', link: '/deployment/analytics-production-readiness' },
            { text: 'Storage Production Readiness', link: '/deployment/storage-production-readiness' },
            { text: 'Invoices Production Readiness', link: '/deployment/invoices-production-readiness' },
            { text: 'Go-Live Hardening', link: '/deployment/go-live-hardening-2026-07-15' },
            { text: 'Authentication', link: '/deployment/authentication' },
            { text: 'Tenant RBAC', link: '/deployment/tenant-rbac' },
            { text: 'Central Settings', link: '/deployment/central-settings' },
            { text: 'Tenant Settings', link: '/deployment/tenant-settings' },
            { text: 'Payment Gateways', link: '/deployment/payment-gateways' },
            { text: 'Module Development', link: '/deployment/module-development' },
            { text: 'Leads', link: '/deployment/leads' },
            { text: 'Companies', link: '/deployment/companies' },
            { text: 'Contacts', link: '/deployment/contacts' },
            { text: 'Tasks', link: '/deployment/tasks' },
            { text: 'Projects', link: '/deployment/projects' },
            { text: 'Automation', link: '/deployment/automation' },
            { text: 'Knowledge Base', link: '/deployment/knowledge-base' },
            { text: 'Reports (Analytics)', link: '/deployment/analytics' },
            { text: 'Storage', link: '/deployment/storage' },
            { text: 'ToDos', link: '/deployment/todos' },
            { text: 'Announcements', link: '/deployment/announcements' },
            { text: 'Daily CRM Summary', link: '/deployment/daily-crm-summary' },
            { text: 'Calendar', link: '/deployment/calendar' },
            { text: 'Meetings', link: '/deployment/meetings' },
            { text: 'Activities', link: '/deployment/activities' },
            { text: 'Opportunities', link: '/deployment/opportunities' },
            { text: 'Quotations', link: '/deployment/quotations' },
            { text: 'Contracts', link: '/deployment/contracts' },
            { text: 'Resellers', link: '/deployment/resellers' },
            { text: 'Reseller Payouts', link: '/deployment/reseller-payouts' },
            { text: 'Invoices', link: '/deployment/invoices' },
            { text: 'Payments', link: '/deployment/payments' },
            { text: 'Credit Notes', link: '/deployment/credit-notes' },
            { text: 'Estimates', link: '/deployment/estimates' },
            { text: 'Vendors', link: '/deployment/vendors' },
            { text: 'Purchase Orders', link: '/deployment/purchase-orders' },
            { text: 'Expenses', link: '/deployment/expenses' },
            { text: 'Products', link: '/deployment/products' },
            { text: 'Warehouses', link: '/deployment/warehouses' },
            { text: 'Inventory', link: '/deployment/inventory' },
            { text: 'Accounting', link: '/deployment/accounting' },
            { text: 'Financial Reports', link: '/deployment/financial-reports' },
            { text: 'Employees', link: '/deployment/employees' },
            { text: 'Departments', link: '/deployment/departments' },
            { text: 'Leave Management', link: '/deployment/leave-management' },
            { text: 'Attendance', link: '/deployment/attendance' },
            { text: 'Payroll', link: '/deployment/payroll' },
            { text: 'Help Desk', link: '/deployment/help-desk' },
            { text: 'Communication Templates', link: '/deployment/communication-templates' },
            { text: 'Email', link: '/deployment/email' },
            { text: 'Branded', link: '/deployment/branded' },
            { text: 'Storage', link: '/deployment/storage' },
          ],
        },
      ],
      '/changelog/': [
        {
          text: 'Changelog',
          items: [
            { text: 'Delivery Notes', link: '/changelog/' },
            { text: 'v1.1.0', link: '/changelog/v1.1.0' },
            { text: 'v1.1.0 (legacy alias)', link: '/changelog/v1.1.0-platform' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/DiligentCreators/SaaS-Docs' },
    ],

    notFound: {
      title: 'PAGE NOT FOUND',
      quote: 'This page does not exist, or the URL may have changed. Try Getting Started or search from the top navigation.',
      linkLabel: 'Go to home',
      linkText: 'Take me home',
    },

    editLink: {
      pattern: 'https://github.com/DiligentCreators/SaaS-Docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: SITE_DESCRIPTION,
      copyright: '© 2026 EloSync. All rights reserved.',
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },

    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },
  },
})
