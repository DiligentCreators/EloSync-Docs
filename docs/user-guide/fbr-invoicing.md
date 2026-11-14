# FBR Invoicing

Pakistan **FBR Digital Invoicing** for EloSync workspaces. Install the free Marketplace module **FBR Invoicing**, set seller credentials, attach HS/UoM profiles to products, then **Validate** and **Submit** from a customer invoice (two separate steps). On FBR workspaces, [Estimates](/user-guide/estimates) also act as **proforma** (never sent to FBR).

Workspaces **without** the module see no FBR fields, columns, Verify button, Validate/Submit actions, readiness checklist, proforma estimate extras, payment gate, FBR share capabilities, FBR permanent-delete guard, or FBR details on PDFs.

## Prerequisites

- Marketplace entitlement: **Invoices** and **Products** (required)
- Optional: **Companies** / **Contacts** for buyer NTN, STRN, registration type, and province; **Estimates** for proforma
- FBR sandbox or live API token from the FBR Digital Invoicing portal
- Platform HS/UoM + scenarios catalog loaded (Central → Catalog → FBR Catalog). An empty catalog blocks useful HS picking until imported.

## Configure credentials

Billing → **FBR Invoicing**:

1. Enter seller business name, NTN/CNIC, STRN, province, and **address**
2. **Seller address is required.** Validate and Submit are **blocked** until it is set. An amber warning appears on this settings page when the address is empty, and the invoice **FBR readiness checklist** also flags it
3. **Seller NTN/CNIC (save vs FBR):** Settings accept a **7–9 digit NTN** or a **13-digit CNIC**. FBR’s API only accepts a **7-digit NTN** or **13-digit CNIC**. When the saved NTN is another length (for example 8 digits), EloSync sends the optional **NTN for validate** (`nic_validate`) value instead when that value is 7 or 13 digits. A **warning** appears when neither the saved NTN nor NIC validation is usable for FBR calls
4. Province must be one of the **7 canonical** FBR names (Sindh, Punjab, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Azad Jammu and Kashmir, Gilgit-Baltistan). Common aliases such as `KP` / `KPK`, `ICT`, `AJK`, or `GB` are accepted and normalised on save
5. An **environment badge** shows Sandbox or Live for the active credentials
6. Switching to **Live** is **admin/owner-only** (with FBR configure permission). You must type `LIVE` (exact, case-sensitive) to confirm. Live cannot be selected on local/test environments unless a platform flag is set — see the [deployment guide](/deployment/fbr-invoicing). Blocked Live-switch attempts are **audited** (who, from/to, reason)
7. Paste the matching API token. Leave a token field **blank** to keep the token already saved. Tokens are **never shown** after save — only a masked hint of **bullets + last 4** (for example `••••cdef`)
8. When the environment was last changed, the page shows **who** changed it and **when**
9. Save

Tokens are encrypted at rest. HS codes and units of measure come from a **platform-wide catalog** (not per-workspace lists).

Sandbox and Live use different tokens and endpoints.

## Buyer details

When FBR Invoicing is installed, company and contact forms show gated FBR buyer fields:

- NTN/CNIC (**7-digit NTN** or **13-digit CNIC**; dashes are stripped), STRN
- Registration type (`Registered` / `Unregistered`) — **never auto-set** on create/import; blank stays blank until you choose
- Province (same 7 canonical names; aliases accepted)
- **Verify with FBR** — shows Registered, Unregistered, Not found, or a clear sandbox/error message (never a blank crash). When the sandbox errors but still returns a readable status, that status is shown as **information only**. Registration type is applied only when FBR clearly returns registered or unregistered; failures and informational statuses never force Registered. You can always set the type yourself.

Buyer NTN and province are required at **invoice validate/submit** when registration is **Registered**. For **Unregistered** buyers, NTN/CNIC is optional (if provided it must still be 7 or 13 digits).

### Import

Company and contact CSV import includes optional FBR columns when the module is entitled:

| Column | Required |
|--------|----------|
| NTN/CNIC | No |
| STRN | No |
| Province | No |
| Registration Type | No |

Invalid FBR values fail **that row** only (the rest of the batch continues). Import does **not** call FBR Verify. Without the module those columns are omitted from templates and mappings.

## Product FBR profile

On product **create** and **edit**, use the FBR profile card:

- HS search by **code or description**
- UoM filtered by HS (catalog short name **Number** is sent to FBR as **Numbers, pieces, units**)
- GST rate — on FBR workspaces, **standard-rate goods default to 18%** from this profile
- **Sale type** (standard registered/unregistered, 3rd schedule, reduced, zero-rated, exempt, FED/services)
- Optional sandbox scenario
- Collapsed extras: retail price (required and visible for **3rd schedule** goods), SRO, FED, extra tax, ST withheld

Optional at product save; HS + UoM are required at invoice validate/submit.

## How sale types map (sandbox)

| Scenario | What EloSync sends |
|----------|--------------------|
| SN001 / SN002 (standard rate) | Sale type **Goods at standard rate (default)** — buyer type + scenario distinguish registered vs unregistered |
| SN008 | Sale type **3rd Schedule Goods** |

## Invoice lines

When the module is entitled:

- Quantity must be **≥ 1**
- Per-line **Further Tax**: None | **236G 0.10%** | **236H 0.50%** | **Unregistered 4%** (on value excluding sales tax)
- Further tax is **blocked for Registered** buyers
- **Further Tax Total** appears when any line has further tax
- Unregistered buyers with standard-rate goods automatically use the unregistered sale type / sandbox scenario when available
- **Line editor (live totals):** a typed **0%** stays **0** in the running totals and shows an amber **“FBR will reject 0% tax for this sale type”** warning when that sale type needs positive tax; an **empty** rate uses the product FBR profile rate and shows a per-line note (for example `18% from product's FBR profile`)

### Tax rate defaults (create / update)

On FBR workspaces:

- **Omitted / empty** tax rate → defaults from the product FBR profile; the UI shows the per-line profile note, and the API may also report `fbr_adjustments` / an activity note
- **Explicit 0%** on a standard-rate / 3rd-schedule (or reduced) line → **kept as 0** in live totals (never overwritten) and blocked at Validate/Submit with a clear message
- **Zero-rated** / **exempt** lines with 0% are fine

Workspaces without FBR Invoicing are unchanged.

### 3rd-schedule tax (retail)

For 3rd-schedule goods, sales tax uses **retail price × quantity × rate**, not the discounted sale price alone. Retail must be set on the product FBR profile (and is shown there).

Example: sale **1200**, retail **1500**, rate **18%**, qty **1** → tax **270**, line total **1470**.

### Sales tax must match FBR

On FBR workspaces, **Validate** and **Submit** both reject lines that need positive sales tax when:

- The line has **0%** tax on a **standard-rate** or **3rd-schedule** (or reduced) sale type, or
- The stored tax amount does not match the FBR expected amount for the profile rate

**Zero-rated** and **exempt** lines with 0% tax are fine. Workspaces without FBR Invoicing are unchanged (0% invoices work as before).

## Validate and submit

On an invoice detail page (module entitled):

1. Sandbox/Live badge shows the active credentials environment
2. The **FBR readiness checklist** is computed from the **saved** invoice, buyer, and product profiles (buyer NTN/CNIC — required only when Registered; each line’s HS/UoM and tax; credentials including **seller address**; validation state). It refreshes after Validate and after Submit. On **submitted** invoices the checklist stays visible as **read-only** (including any post-submission issues such as a 0% tax line)
3. **Validate with FBR** — must succeed before submit. Seller address must be set first (otherwise validate is blocked without calling FBR). Failures show FBR **status code** and lines like **Item n (product name) [code]: message**. Document-level problems (buyer details, credentials, and similar) appear as **Invoice: message**. Duplicate line errors from FBR are shown **once**. If FBR returns a result that **contradicts** this invoice (for example a 3rd-schedule error when no line is 3rd schedule), EloSync **retries Validate once**, then shows a clear **try again** message if it still fails. Editing the invoice clears validation (it never clears a stored FBR invoice number)
4. **Submit to FBR** — confirm dialog (stronger wording for Live); stores the FBR invoice number (IRN); resubmit is blocked. The same tax and readiness rules apply as Validate. If the FBR sandbox returns a result that **contradicts** the invoice right after a successful validate with the **same data**, EloSync **retries once** automatically and otherwise asks you to try again; **nothing is double-submitted**
5. After a successful submit, a **Draft** invoice moves to the normal issued/unpaid status for your workspace. Non-FBR drafts are unchanged
6. Last FBR error (if any) surfaces on the invoice

API-created invoices on FBR workspaces **default to the workspace currency** (for example PKR) when currency is omitted. Non-FBR API creates keep the previous default.

Invoice list/export include FBR number / submitted status **only** when the module is entitled. Non-FBR export headers stay unchanged.

## After submit: locked invoice + PDF

Once an invoice has an FBR invoice number:

- It is **locked everywhere** — full page, list, drawer, and **bulk** actions. Edit, Void, and Trash are hidden; the server also rejects them.
- **Record payment** / post payment is allowed **only after** the invoice has been submitted to FBR and has an IRN. Before that, **Record payment** is disabled and the API returns **422** with the reason. After IRN, **partial** and **full** payments (and voiding a payment) update payment status as usual but **keep the FBR lock** — IRN, tax, lines, and buyer stay unchanged. Workspaces without FBR Invoicing are unchanged.
- Validate and Submit are hidden after submission.
- Corrections use a **credit note** or **debit note** (Credit Notes module required), not an edit.
- The PDF shows the **FBR invoice number** and a **QR code**. Invoices without FBR submission keep the normal PDF (no FBR number/QR). The official FBR logo on PDF is not shipped yet.

### Share (email / WhatsApp)

On FBR workspaces, after submit you can:

- **Email** the invoice with the PDF attached (includes **IRN + QR**). Sharing does not change FBR fields.
- **WhatsApp** only when the workspace also has the **WhatsApp** module — opens a share link (`wa.me`) with the invoice public view URL. Without WhatsApp entitlement, the WhatsApp action is hidden.

Workspaces without FBR Invoicing keep the normal invoice share UI (no FBR `share_capabilities` extras).

Bulk “Send N to FBR” and PDF watermark / month-year prefix are **not** part of this release (Batch 4+ — not shipped).

## Companies, contacts, and products (trash)

On FBR workspaces, companies, contacts, and products still support **trash**, **restore**, and **permanent delete**:

- Soft delete (trash) and restore work as usual
- **Permanent delete** is **refused** when that record is used on an **FBR-submitted** invoice or credit/debit note (message explains it can stay in trash but not be permanently removed)
- Records not referenced by an FBR-submitted document can still be permanently deleted

Workspaces without FBR Invoicing keep the previous trash / force-delete behaviour.

## Proforma on Estimates (Batch 2)

When **FBR Invoicing** is installed, existing [Estimates](/user-guide/estimates) gain proforma behaviour. Estimates are **never sent to FBR** — no Validate/Submit, no FBR invoice number, no FBR HTTP.

On FBR workspaces you get:

- Banner: **PROFORMA INVOICE — NOT A FINAL TAX INVOICE** (UI and PDF)
- Proforma fields: **validity** (`valid_until`), **due date**, **payment / delivery / advance** terms (advance can include free text plus optional percent and amount)
- **Estimated GST**, further tax, and grand total (same tax rules as invoices; for example 3rd-schedule sale **1200** @ retail **1500** × **18%** → GST **270**, line total **1470**)
- **Expired** as a **display** status when the validity date is past (stored status is unchanged)
- **Convert to tax invoice** creates a **Draft** customer invoice with **no** IRN: **issue date** is today (workspace timezone), **due date** and **payment terms** copy from the proforma, and **further tax** is included in the invoice total; you must then **Validate** and **Submit** on that invoice as usual

Without the module, estimates are unchanged (no banner, no proforma fields, no estimated FBR tax keys).

## Credit and debit notes

1. On the locked invoice, choose **Issue credit note** or **Issue debit note**
2. The form pre-fills lines and shows the **original FBR invoice number** as a read-only reference
3. On the note detail page, **Validate with FBR** then **Submit to FBR** (same Sandbox/Live badge and per-item errors)
4. After submit, the note stores its own FBR number and locks edit/void
5. PDF shows the note’s FBR number when present, plus the original invoice number and original FBR invoice number

FBR’s Digital Invoicing API currently accepts credit/debit corrections as invoice type **Debit Note** with a reference to the original FBR invoice number. Sandbox rejects the literal type “Credit Note”. Reason is required; choosing “Others” also needs remarks. If FBR rejects the note for type/reason, keep the EloSync credit note in draft until the official reason list is confirmed — this sandbox gap remains open.

Workspaces without FBR Invoicing keep normal credit-note create/issue/apply with no FBR fields.

## Updating the HS/UoM catalog

Platform operators manage the shared catalog from **Central → Catalog → FBR Catalog** (starts empty — nothing is pre-seeded):

1. Download **Sample HS/UoM** / **Sample scenarios** (also inside each import dialog)
2. Import CSV, or use **New HS/UoM** / **New scenario**
3. Edit or delete any row from the table actions menu

HS/UoM CSV columns: `hs_code`, `unit_name`, `description`. Scenario CSV columns: `scenario_id`, `buyer_registration_type`, optional `sale_type`. Codes that start with zero stay intact. Rows with a blank unit are imported as **Others**. One update applies to every workspace.

CLI remains available for automation: `php artisan fbr:sync-hs-uom` / `fbr:sync-scenarios`.

## Still open (brief)

- Credit-note sandbox type/reason gap (see above)
- Some SRO catalog typos (e.g. SN024 pipe character)
- Extra UoM short-name aliases beyond **Number**
- Official FBR logo on PDF
- Bulk “Send N to FBR”, PDF watermark / month-year prefix (Batch 4+ — not shipped)
