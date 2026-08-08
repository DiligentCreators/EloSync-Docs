# Founding Beta

EloSync is in **Founding Beta** — a pre-launch phase focused on recruiting real businesses to run real workflows, report product problems, and shape the roadmap.

> **Product principle**
>
> We're building EloSync **with** real businesses, not only **for** them.

Related: [Product Roadmap](/getting-started/product-roadmap) · [Central Feedback System](/developer-guide/central-feedback-system) (architecture) · Marketing site campaign: `https://elosync.com/beta/`

---

## 1. Beta objectives

1. Put EloSync in front of businesses that will use it with **real operational work**.
2. Collect **actionable** feedback: bugs, UX friction, missing features, performance, and integration needs.
3. Validate module workflows end-to-end across CRM → Sales → Billing → Finance → HR → Inventory.
4. Turn feedback into triage decisions in the **Central Application**, then into roadmap and releases.
5. Avoid a conventional paid launch posture (no “buy now” / aggressive trial sell) until the product-learning loop is healthy.

---

## 2. Target beta users

Ideal participants:

- Small and mid-size businesses running operations across **multiple tools today**
- Teams willing to use EloSync for at least one real workflow (not only a clickthrough demo)
- Operators who can articulate what EloSync should **replace**
- People with authority (or sponsorship) to try connected CRM / billing / people / operations workflows

Not a priority for founding beta:

- Agencies shopping for white-label resale without hands-on testing
- Pure “feature tourism” without any real workflow commitment
- Competitors running extractive evaluation only

---

## 3. Beta access model

| Topic | Policy |
|-------|--------|
| Cost | **Free during Founding Beta** — no credit card required |
| Capacity | Limited cohort (quality of feedback over volume) |
| Entitlements | Participants receive workspace access to available Marketplace modules per current catalog rules |
| Pricing narrative | Catalog pricing (included / free opt-in / paid add-ons such as Branded) may be published for transparency but is **not** the conversion goal during beta |
| Intake | Public application via marketing site `/beta/` → Central public API (see feedback / beta intake implementation notes) |
| Activation | Central team reviews applications and provisions / invites workspaces |

---

## 4. Feedback philosophy

- Prefer **specific, reproducible reports** over vague sentiment.
- Prefer feedback from **real workflows** over sandbox-only clicks.
- Separate **bugs** (broken) from **UX** (confusing) from **features** (missing).
- Internal triage priority and internal notes stay on the Central team; tenants see public status/responses only.
- Roadmap influence is earned by frequency, severity, and multi-tenant signal — not by the loudest single request.

Continuous loop:

```text
Tenant uses EloSync
→ experiences friction
→ submits feedback
→ Central team triages
→ roadmap / fix decision
→ release
→ tenant benefits
→ loop continues
```

---

## 5. Bug reporting process

**During / after in-app feedback ships** (see [Central Feedback System](/developer-guide/central-feedback-system)):

1. Tenant user opens **Give Feedback** in the tenant app.
2. Chooses type **Bug**, describes expected vs actual, attaches screenshot when useful.
3. System captures workspace, user, route/module, and environment context automatically.
4. Central team triages (reproduce → status → priority).
5. Public responses / status updates are visible to the submitting tenant when appropriate.

Until the in-app channel is live, founding beta participants may use the agreed operator channel called out in their onboarding mail.

---

## 6. Feature request process

1. Submit as type **Feature Request** with the problem to solve (not only a solution sketch).
2. Include which modules / tools the request would replace or connect.
3. Central associates requests with modules; roadmap linkage can be added when issue/roadmap integration exists.
4. Participants receive acknowledgement via public response where the Central team chooses to reply.

---

## 7. UX feedback process

1. Submit as type **UX / Usability**.
2. Capture what the user tried to do, where they got stuck, and what they expected.
3. Screenshots and route context are especially valuable.
4. UX themes that recur across tenants inform product polish before paid launch.

---

## 8. Product roadmap relationship

- The [Product Roadmap](/getting-started/product-roadmap) remains the long-term CRM → modular SaaS ERP direction.
- Founding Beta does **not** rewrite platform freeze or module architecture standards.
- Feedback informs **priority** within the roadmap — it does not invent parallel product foundations.
- Marketing positioning during beta emphasizes **Business Operating System** (connected modular operations), not “another CRM.”

---

## 9. Beta tester expectations

Participants should:

- Use EloSync with at least one real workflow
- Report bugs and confusing UX promptly
- Be honest about what they would replace
- Accept that beta software will change and may break
- Not redistribute credentials or scrape the product

EloSync will:

- Provide free beta access
- Review feedback in Central
- Communicate material status changes when useful
- Credit founding participants with priority consideration on requests that fit the product vision

---

## 10. Transition from beta to public launch

Planned transition criteria (product judgment, not a hard checklist):

1. Core CRM → Sales → Billing workflows are stable for beta cohorts.
2. Feedback volume of **Critical / High** bugs is trending down.
3. Central feedback triage process is operational.
4. Pricing / billing surfaces are ready without contradicting beta promises.
5. Marketing CTAs can shift from Founding Beta recruitment to self-serve / commercial conversion.

When launch begins:

- Document what happens to beta workspaces and any founding pricing commitments
- Freeze contradictory “free forever everything” marketing claims
- Keep the feedback loop as a permanent product channel (not a temporary beta-only gadget)

---

## Status of related systems

| Surface | Status |
|---------|--------|
| Marketing Founding Beta pages | Shipped (`/`, `/beta/`, `/pricing/`, module pages) |
| Public beta application API | Shipped (`POST /api/central/v1/public/beta-applications`) |
| Tenant in-app feedback submission | Shipped (user menu + command palette → Give Feedback) |
| Central feedback + beta applications UI | Shipped (**Platform → Feedback**, **Platform → Beta Applications**) |
| This product page | Living — update when access model or expectations change |
