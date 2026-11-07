# PickPath launch signups: Google Sheet receiver

This integration belongs to **Sowell Solutions LLC** and records voluntary marketing signup requests from the PickPath website.

## Initial setup

1. Open the private PickPath signup Google Sheet you already created.
2. Select **Extensions → Apps Script**.
3. Replace the editor's `Code.gs` contents with [Code.gs](./Code.gs) from this folder. Save.
4. Select the function **setupPickPathSignups**, click **Run**, and approve the Google permissions. Confirm that two private tabs appeared: **Launch Signups** and **Consent Log**.
5. Select **Deploy → New deployment → Web app**, with **Execute as: Me** and **Who has access: Anyone** (anonymous visitors). Click Deploy and copy the **/exec** URL.
6. Test the /exec URL in an incognito browser. It should show "PickPath signup receiver is ready."
7. Send the /exec URL for insertion into the website form. A real end-to-end test must create one pending signup row and one consent audit row.

## Important constraints

- The spreadsheet itself must **remain private**. Only the Apps Script **web app** is publicly accessible.
- The endpoint is a **public write service**, not authenticated. It includes basic input validation and a honeypot, but is not a spam-proof, rate-limited subscription service. Review rows for abuse.
- Site submissions use a normal HTML form POST to the web app and then a dedicated confirmation page. This avoids CORS and cross-origin iframe problems with Apps Script in 2026.
- The signup checkbox must be **unchecked by default**, required, and must explicitly record agreement. The backend records the fixed consent text and version rather than trusting client-supplied legal wording.
- **Pending email verification** is not double opt-in. Verify addresses via your eventual email provider's opt-in flow before sending marketing to unverified contacts.
- Your outgoing marketing mail must identify the sender, include a valid postal mailing address, and include a functioning unsubscribe mechanism. Maintain the Google Sheet status when unsubscribes occur.
- Update the website Privacy Policy **before enabling the form** to disclose collection of email, consent proof and Google Sheets processing.
- Changes to this file require updating/redeploying the corresponding Apps Script deployment.

## Sheet schema

**Launch Signups**: Email, Submitted At UTC, Status, Consent, Consent Version, Consent Text, Website, Last Request UTC.

**Consent Log**: Submitted At UTC, Email, Action, Consent Version, Consent Text, Website.

Neither sheet should be made public or embedded on the website.
