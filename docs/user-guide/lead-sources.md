# Connect a lead source

Leads can reach EloSync three ways: added by hand, from a website or form tool via a webhook, or from Meta Lead Ads (Facebook lead forms).

You need the **Leads** module (included in every workspace) and the `leads.manage_integrations` permission.

## Website or form tool (custom webhook)
1. Open **Leads → Integrations → Webhooks** and create an endpoint.
2. Copy the API key or signing secret when it's shown. **It's shown only once.** If you lose it, rotate the endpoint to get a new one.
3. Use **Copy URL** to get the endpoint address, and **Copy JSON** for a sample request body you can map your form fields to.
4. In your form tool (for example Zapier, Make or a website form plugin), send a POST request to the URL with the key in the request headers.
   Never put the API key in public website JavaScript.
5. Each lead needs at least a **name**. Email, phone, company, job title, source and extra custom fields are optional.

Duplicates (same external ID, email or phone) are skipped rather than created twice.

**Share website leads automatically (optional):** on the endpoint card, turn on **Assign to website recipients**. New leads are then shared equally among teammates who have **Receive website leads** enabled in **Administration → Users** and who are not marked **Exclude from lead assignment**. If nobody is eligible, the lead stays unassigned.

## Meta Lead Ads (Facebook lead forms)
On the Leads page, click **Integrations**, open the **Meta Lead Ads** tab, then click **Connect Meta** (it shows **Reconnect Meta** once connected). Select the Facebook Pages whose lead forms should send leads to EloSync. New form submissions arrive as leads, with campaign, ad set, ad and form details.

If the platform hasn't configured Meta, the tab says **Meta Lead Ads is not configured by the platform administrator yet.**

If the status badge shows **needs_reauth**, a **Reconnect required** box appears and lead intake is paused until you reconnect.

## Assign every lead an owner
Leads from Meta are assigned by hand. Give each new lead an owner from the lead drawer or board.
