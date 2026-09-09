/**
 * AIESEC in Bangladesh — Join as Member form → Google Sheet logger
 *
 * SETUP (one time, ~5 minutes):
 * 1. Go to https://sheets.google.com and create a new blank spreadsheet.
 *    Name it whatever you like, e.g. "AIESEC BD — Membership Applications".
 * 2. In that sheet: Extensions → Apps Script. This opens a code editor.
 * 3. Delete whatever's in the editor and paste this entire file in its place.
 * 4. Click Deploy → New deployment.
 *    - Click the gear icon next to "Select type" → choose "Web app".
 *    - Description: anything, e.g. "Membership form intake".
 *    - Execute as: Me (your account).
 *    - Who has access: Anyone.
 *    - Click Deploy.
 * 5. Google will ask you to authorize the script (it's yours, so this is
 *    safe) — click through the "Advanced" → "Go to (project name)" prompts.
 * 6. Copy the Web app URL it gives you (ends in /exec).
 * 7. Send that URL back — it goes into build_pages.py at the join-member
 *    form's data-sheet-endpoint attribute (or directly into join-member.html
 *    if you're editing the HTML by hand instead of the Python build script).
 *
 * Every submission will land in this sheet as a new row, with a header row
 * created automatically the first time it runs.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  // Columns, in order. Edit this list if you add/remove fields on the form —
  // just make sure each string here exactly matches that field's `name=`
  // attribute in join-member.html.
  var columns = [
    "Full name", "Age", "University", "Hometown", "Department",
    "Phone", "WhatsApp", "Email", "Preferred Local Committee"
  ];

  // Create the header row once, if the sheet is currently empty.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp"].concat(columns));
  }

  var row = [new Date()];
  columns.forEach(function (col) {
    row.push(data[col] || "");
  });
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
