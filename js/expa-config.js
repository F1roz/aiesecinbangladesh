/* ==========================================================================
   AIESEC in Bangladesh — EXPA + Google Sheet settings
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to switch the forms on.
   Nothing in here is secret: LC IDs and the Apps Script URL are safe to be
   public. The EXPA access token is NOT kept here — it lives inside the
   Google Apps Script (see apps-script/SETUP.md).
   ========================================================================== */
window.AIESEC_BD_CONFIG = {

  /* 1) Google Apps Script web-app URL (ends in /exec).
        Both forms send a copy of every submission here, and the script
        writes it into your Google Sheet. */
  SHEET_ENDPOINT: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE",

  /* 2) Your Local Committees and their EXPA committee IDs.
        How to find an ID: open the LC in EXPA (expa.aiesec.org) and look
        at the number in the address bar, or ask your MC IM team.
        While an ID is 0, sign-ups still reach the Google Sheet but are NOT
        sent to EXPA for that LC — so you can go live before you have them. */
  LCS: [
    { name: "AIESEC in Dhaka North",        id: 0 },
    { name: "AIESEC in Dhaka North East",   id: 0 },
    { name: "AIESEC in Dhaka NorthWestern", id: 0 },
    { name: "AIESEC in Dhaka South",        id: 0 }
  ],

  /* 3) Where people who choose "Not sure / no preference" are sent.
        Must exactly match one of the names above. */
  DEFAULT_LC: "AIESEC in Dhaka North",

  /* 4) Programme IDs used by EXPA. These are global AIESEC values
        (the same in every country) — you shouldn't need to change them. */
  PROGRAMMES: {
    GV:  { id: 7, label: "Global Volunteer",      short: "Volunteer abroad" },
    GTa: { id: 8, label: "Global Talent",         short: "Intern abroad" },
    GTe: { id: 9, label: "Global Teacher",        short: "Teach abroad" }
  },

  /* 5) EXPA's public sign-up endpoint (creates the person's AIESEC account).
        Same endpoint aiesec.org and other MCs (e.g. AIESEC in Sri Lanka) use. */
  EXPA_SIGNUP_URL: "https://auth.aiesec.org/users.json",

  /* 6) Bangladesh dialling code, sent to EXPA with the phone number. */
  COUNTRY_CODE: "+880"
};
