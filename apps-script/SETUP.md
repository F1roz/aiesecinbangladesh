# Connecting the website forms to Google Sheets and EXPA

This takes about 20 minutes. You don't need any coding experience: you'll paste one file, click Deploy, and copy two values into the website.

## How it works

**Apply Now** (`apply.html`), the exchange sign-up form:
1. The visitor's browser sends their details straight to AIESEC (`auth.aiesec.org/users.json`), the same endpoint aiesec.org uses. This creates their AIESEC account, and they appear in EXPA as a sign-up for the LC you chose.
2. A copy **without the password** goes to your Google Sheet, in the **Exchange Sign-ups** tab, along with the EXPA result: `Created`, `Already had an account` or `Failed`.

**Join as Member** (`join-member.html`):
1. The application is emailed to you through FormSubmit, the same as before.
2. A copy goes to your Google Sheet, in the **Membership Applications** tab.
3. The Apps Script creates a **Member Lead** in EXPA using your EXPA access token, then writes `Created` or the error into the row.

If EXPA is down or not set up yet, every submission still lands in the sheet, so no applicant is lost.

---

## Step 1: Create the sheet and the script

1. Go to **sheets.google.com**. Create a new spreadsheet, for example "AIESEC BD – Website Applications". Use a shared AIESEC account rather than a personal one, so access survives term handovers.
2. Click **Extensions → Apps Script**.
3. Delete everything in the editor. Paste in the whole of `apps-script/Code.gs` and click 💾 **Save**.
4. Click **Deploy → New deployment**, then:
   - Click the ⚙️ next to "Select type" and choose **Web app**.
   - Set **Execute as** to **Me**.
   - Set **Who has access** to **Anyone**.
   - Click **Deploy**.
5. Approve the permissions: click **Advanced → Go to (project name) → Allow**. Google shows this warning for every new script, and this script is yours.
6. Copy the **Web app URL**. It ends in `/exec`.

> **If you already deployed the old membership script:** paste the new code over it. Then go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. That keeps the same URL. New rows will go to the new tabs.

## Step 2: Fill in the website settings

Open **`js/expa-config.js`**. It's the only website file you need to edit.

1. Paste the URL from Step 1 into `SHEET_ENDPOINT`.
2. Fill in each LC's **EXPA committee ID** in `LCS`. To find one, open the LC in EXPA and copy the number from the address bar, or ask your MC IM team.
3. Set `DEFAULT_LC`. That's where people who pick "Not sure" or "No preference" are sent.

While an LC's ID is `0`, sign-ups for that LC still reach the sheet but are not sent to EXPA. That means you can launch before you have the IDs.

## Step 3: Add the EXPA token (membership only)

Creating member leads needs an EXPA access token from your **MC IM team**. Ask them for "an EXPA API access token that can create member leads for AIESEC in Bangladesh".

The token is a password. **Never put it in the website files.** Store it in the Apps Script instead:

1. In the Apps Script editor, click ⚙️ **Project Settings** → scroll to **Script properties** → **Add script property**.
2. Property: `EXPA_TOKEN`. Value: the token. Click **Save script properties**.
3. Reload your Google Sheet. A new **AIESEC** menu appears. Click **AIESEC → Test EXPA connection**. It should say "Connected to EXPA as …".

**If the token expires:** new membership rows will show `Failed` with a note about the token. Paste the new token into Script properties, then click **AIESEC → Retry members not yet in EXPA**.

The Apply Now form doesn't need a token at all.

## Step 4: Test before going live

1. Upload the site and open `apply.html`. Sign up using a test email you control.
   - In the sheet, the **Exchange Sign-ups** tab should get a row with status `Created`.
   - In EXPA, the person should appear under your LC's sign-ups.
   - Submit the same email again. The status should be `Already had an account`.
2. Open `join-member.html` and submit a test application.
   - The **Membership Applications** tab should get a row with status `Created (Member lead #…)`.
   - The person should appear in EXPA under your LC's member leads.
3. Delete the test people from EXPA, or ask your IM team to.

## What to ask your MC IM team

- [ ] The EXPA committee ID for each of the 4 LCs.
- [ ] An EXPA access token that can create member leads (for Step 3).
- [ ] Whether EXPA needs university **alignment IDs** for Bangladesh. If it does, they go in `UNIVERSITY_ALIGNMENTS` at the top of `Code.gs`. You'll know you need them if the sheet's **EXPA detail** column shows an error about "alignment".
- [ ] Confirmation that the member-lead list IDs at the top of `Code.gs` match what EXPA uses today. They're global values taken from AIESEC in Sri Lanka's live form.

## Troubleshooting

| What you see | What to do |
|---|---|
| Nothing appears in the sheet | Check that `SHEET_ENDPOINT` in `js/expa-config.js` is the `/exec` URL. Check that the deployment's access is set to **Anyone**. After any code change, deploy a **New version**. |
| Exchange row says `Not sent (EXPA LC ID not set)` | Fill in that LC's ID in `js/expa-config.js`. |
| Exchange row says `Failed (422)` | Read the **EXPA detail** column. It's usually a missing field (such as alignment) or a weak password. |
| Exchange row says `Failed (network)` | The visitor's connection dropped, or AIESEC's servers were briefly down. Their details are in the sheet, so contact them directly. |
| Membership row says `Not sent` | Either the token is missing (Step 3), or there's no LC ID. If it's the LC ID, type it into the **EXPA LC ID** column, then click **AIESEC → Retry**. |
| Membership row mentions an expired token | Update `EXPA_TOKEN`, then click **AIESEC → Retry members not yet in EXPA**. |

## Privacy notes

- Passwords go only to AIESEC. They never reach the sheet or the script.
- Keep the sheet shared only with people who need applicant data.
- The script stops form answers from being treated as spreadsheet formulas, which blocks a common sheet attack.
