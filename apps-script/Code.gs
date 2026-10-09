/**
 * AIESEC in Bangladesh — website forms → Google Sheet (+ EXPA for members)
 * ========================================================================
 * Handles BOTH website forms:
 *   • Apply Now (exchange sign-up)   → tab "Exchange Sign-ups"
 *       The website itself creates the person's AIESEC account on EXPA,
 *       then sends a copy here. Passwords are never sent to this script.
 *   • Join as Member                  → tab "Membership Applications"
 *       This script saves the row, then creates a "Member Lead" in EXPA
 *       using your EXPA access token, and writes the result into the row.
 *
 * Setup steps: see apps-script/SETUP.md in the website folder.
 * Replaces the old join-member-to-sheet.gs — use this file instead.
 */

/* ------------------------------------------------------------------ */
/*  SETTINGS                                                           */
/* ------------------------------------------------------------------ */
var SETTINGS = {
  EXCHANGE_TAB: "Exchange Sign-ups",
  MEMBERSHIP_TAB: "Membership Applications",
  TIMEZONE: "Asia/Dhaka",

  EXPA_GRAPHQL_URL: "https://gis-api.aiesec.org/graphql",
  COUNTRY_CODE: "880",

  /* EXPA's ID lists for member leads. These are global AIESEC values
     (taken from AIESEC in Sri Lanka's live membership form).
     Ask your MC IM team to confirm if EXPA ever rejects them. */
  ACADEMIC_LEVEL_ID: 21796,
  EMPLOYMENT_STATUS_ID: 21790,          // "Unemployed" = full-time student
  CONTACT_MODE_IDS: { "WhatsApp": 21792, "Email": 21794 },
  MOTIVATION_IDS: {
    "Making an impact": 21977,
    "Global networking": 21976,
    "Leadership experience": 21975,
    "Personal development": 21974
  },
  REFERRAL_IDS: {
    "Friend": 21799,
    "Event": 21809,
    "University session or presentation": 21809,
    "Email": 21810,
    "Facebook": 21802,
    "Instagram": 21805,
    "LinkedIn": 21806,
    "Search engine": 21808,
    "Information booth on campus": 21800,
    "Other": 21814
  },

  /* OPTIONAL — EXPA "alignment" (university) IDs. If EXPA says
     alignment is required, ask your IM team for these and add lines like:
       { match: "north south", id: 12345 },
     "match" is any part of the university name, lower-case. */
  UNIVERSITY_ALIGNMENTS: [
  ]
};

var EXCHANGE_COLUMNS = [
  ["Timestamp", "timestamp"], ["Programme", "programme"],
  ["First name", "first_name"], ["Last name", "last_name"],
  ["Email", "email"], ["Phone", "phone"], ["University", "university"],
  ["LC chosen", "lc_choice"], ["LC assigned", "lc_assigned"],
  ["Heard about us", "referral"],
  ["EXPA status", "expa_status"], ["EXPA detail", "expa_detail"],
  ["Page", "page"], ["UTM source", "utm_source"],
  ["UTM medium", "utm_medium"], ["UTM campaign", "utm_campaign"]
];

var MEMBERSHIP_COLUMNS = [
  "Timestamp", "First name", "Last name", "Date of birth", "Age",
  "University", "Department", "Hometown", "Phone", "WhatsApp", "Email",
  "Preferred Local Committee", "EXPA LC ID", "Preferred contact",
  "Motivation", "Heard about us", "EXPA status", "EXPA detail"
];

/* ------------------------------------------------------------------ */
/*  WEB ENTRY POINT                                                    */
/* ------------------------------------------------------------------ */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    if (data._honey) return json_({ result: "ignored" });     // spam bot

    if (data.form === "Exchange") {
      saveExchange_(data);
    } else if (data.Form === "Membership") {
      saveMembership_(data);
    } else {
      return json_({ result: "error", message: "Unknown form" });
    }
    return json_({ result: "success" });
  } catch (err) {
    console.error(err);
    return json_({ result: "error", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("AIESEC in Bangladesh form endpoint is running.");
}

/* ------------------------------------------------------------------ */
/*  EXCHANGE (Apply Now)                                               */
/* ------------------------------------------------------------------ */
function saveExchange_(data) {
  var sheet = getTab_(SETTINGS.EXCHANGE_TAB, EXCHANGE_COLUMNS.map(function (c) { return c[0]; }));
  data.timestamp = new Date();
  var row = EXCHANGE_COLUMNS.map(function (c) { return clean_(data[c[1]]); });
  sheet.appendRow(row);
}

/* ------------------------------------------------------------------ */
/*  MEMBERSHIP (Join as Member)                                        */
/* ------------------------------------------------------------------ */
function saveMembership_(data) {
  var sheet = getTab_(SETTINGS.MEMBERSHIP_TAB, MEMBERSHIP_COLUMNS);
  data["Timestamp"] = new Date();
  data["Age"] = ageFrom_(data["Date of birth"]);
  if (!data["Preferred Local Committee"]) data["Preferred Local Committee"] = "No preference";

  var row = MEMBERSHIP_COLUMNS.map(function (h) { return clean_(data[h]); });
  sheet.appendRow(row);
  var rowNum = sheet.getLastRow();

  var result = sendMemberLead_(data);
  writeExpaResult_(sheet, rowNum, result);
}

function sendMemberLead_(d) {
  var token = PropertiesService.getScriptProperties().getProperty("EXPA_TOKEN");
  if (!token) return { status: "Not sent", detail: "EXPA_TOKEN not set in Script properties" };
  var lcId = parseInt(d["EXPA LC ID"], 10);
  if (!lcId) return { status: "Not sent", detail: "No EXPA LC ID — type the LC's ID into the EXPA LC ID column, then AIESEC menu → Retry" };

  var lead = {
    lead_name: (String(d["First name"] || "") + " " + String(d["Last name"] || "")).trim(),
    email: String(d["Email"] || "").trim(),
    country_code: SETTINGS.COUNTRY_CODE,
    phone: localPhone_(d["Phone"]),
    date_of_birth: dateString_(d["Date of birth"]),
    home_lc_id: lcId,
    academic_level_id: SETTINGS.ACADEMIC_LEVEL_ID,
    employment_status_id: SETTINGS.EMPLOYMENT_STATUS_ID,
    preferred_mode_of_contact_id: SETTINGS.CONTACT_MODE_IDS[d["Preferred contact"]] || SETTINGS.CONTACT_MODE_IDS["WhatsApp"],
    motivation_reason_id: SETTINGS.MOTIVATION_IDS[d["Motivation"]] || SETTINGS.MOTIVATION_IDS["Personal development"],
    referral_type_id: SETTINGS.REFERRAL_IDS[d["Heard about us"]] || SETTINGS.REFERRAL_IDS["Other"],
    backgrounds: []
  };
  var alignmentId = alignmentFor_(d["University"]);
  if (alignmentId) lead.alignment_id = alignmentId;

  var body = {
    operationName: "MemberLeadCreate",
    query: "mutation MemberLeadCreate($memberLead: MemberLeadInput) { memberLeadCreate(member_lead: $memberLead) { id } }",
    variables: { memberLead: lead }
  };

  try {
    var res = UrlFetchApp.fetch(SETTINGS.EXPA_GRAPHQL_URL, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: token },
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    var out = {};
    try { out = JSON.parse(res.getContentText()); } catch (ignore) {}

    if (out.data && out.data.memberLeadCreate && out.data.memberLeadCreate.id) {
      return { status: "Created", detail: "Member lead #" + out.data.memberLeadCreate.id };
    }
    var msg = (out.errors || []).map(function (x) { return x.message; }).join("; ") ||
              res.getContentText().slice(0, 300);
    if (code === 401 || /unauthori[sz]ed|invalid.*token|expired/i.test(msg)) {
      msg = "EXPA token expired or invalid — update EXPA_TOKEN, then use AIESEC menu → Retry. (" + msg + ")";
    }
    return { status: "Failed (" + code + ")", detail: msg };
  } catch (err) {
    return { status: "Failed (network)", detail: String(err) };
  }
}

function writeExpaResult_(sheet, rowNum, result) {
  var statusCol = MEMBERSHIP_COLUMNS.indexOf("EXPA status") + 1;
  sheet.getRange(rowNum, statusCol, 1, 2).setValues([[result.status, result.detail || ""]]);
}

/* ------------------------------------------------------------------ */
/*  SHEET MENU: retry + connection test                                */
/* ------------------------------------------------------------------ */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("AIESEC")
    .addItem("Retry members not yet in EXPA", "retryMemberLeads")
    .addItem("Test EXPA connection", "testExpaConnection")
    .addToUi();
}

function retryMemberLeads() {
  var sheet = getTab_(SETTINGS.MEMBERSHIP_TAB, MEMBERSHIP_COLUMNS);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var statusIdx = headers.indexOf("EXPA status");
  var done = 0, failed = 0;
  for (var r = 1; r < values.length; r++) {
    var status = String(values[r][statusIdx] || "");
    if (status === "Created") continue;
    var d = {};
    headers.forEach(function (h, i) { d[h] = values[r][i]; });
    var result = sendMemberLead_(d);
    writeExpaResult_(sheet, r + 1, result);
    if (result.status === "Created") done++; else failed++;
  }
  SpreadsheetApp.getUi().alert("Sent to EXPA: " + done + "\nStill not sent: " + failed +
    (failed ? "\n\nSee the \"EXPA detail\" column for the reason." : ""));
}

function testExpaConnection() {
  var token = PropertiesService.getScriptProperties().getProperty("EXPA_TOKEN");
  var ui = SpreadsheetApp.getUi();
  if (!token) { ui.alert("No EXPA_TOKEN found. Add it under Project Settings → Script properties."); return; }
  var res = UrlFetchApp.fetch(SETTINGS.EXPA_GRAPHQL_URL, {
    method: "post", contentType: "application/json",
    headers: { Authorization: token },
    payload: JSON.stringify({ query: "{ currentPerson { id full_name } }" }),
    muteHttpExceptions: true
  });
  var out = {};
  try { out = JSON.parse(res.getContentText()); } catch (ignore) {}
  if (out.data && out.data.currentPerson) {
    ui.alert("Connected to EXPA as " + out.data.currentPerson.full_name + " (#" + out.data.currentPerson.id + ").");
  } else {
    ui.alert("EXPA did not accept the token (HTTP " + res.getResponseCode() + "):\n" + res.getContentText().slice(0, 400));
  }
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
function getTab_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Stop spreadsheet formula injection ("=HYPERLINK(...)" typed into a form)
function clean_(v) {
  if (v === undefined || v === null) return "";
  if (v instanceof Date) return v;
  var s = String(v);
  return /^[=+\-@]/.test(s) && !/^\+?\d[\d\s-]*$/.test(s) ? "'" + s : s;
}

function localPhone_(raw) {
  var d = String(raw || "").replace(/\D/g, "");
  if (d.indexOf("880") === 0) d = d.slice(3);
  if (d.charAt(0) === "0") d = d.slice(1);
  return d;
}

function dateString_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, SETTINGS.TIMEZONE, "yyyy-MM-dd");
  return String(v || "");
}

function ageFrom_(dob) {
  var d = dob instanceof Date ? dob : new Date(String(dob || ""));
  if (isNaN(d.getTime())) return "";
  var now = new Date();
  var age = now.getFullYear() - d.getFullYear();
  var m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function alignmentFor_(university) {
  var u = String(university || "").toLowerCase();
  for (var i = 0; i < SETTINGS.UNIVERSITY_ALIGNMENTS.length; i++) {
    var a = SETTINGS.UNIVERSITY_ALIGNMENTS[i];
    if (a.match && u.indexOf(String(a.match).toLowerCase()) !== -1) return a.id;
  }
  return null;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
