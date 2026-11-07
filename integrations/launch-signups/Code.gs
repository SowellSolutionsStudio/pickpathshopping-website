/**
 * PickPath Shopping prelaunch signup receiver, Google Apps Script.
 *
 * Install this as a script BOUND to the private spreadsheet:
 * https://docs.google.com/spreadsheets/d/1PyV5MnJsxkt8jNvUxIeW_isxGGCO1LIyBeDx9RIJ1rM/
 *
 * Run setupPickPathSignups once. Then deploy as Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * The sheet is NOT shared publicly. The web app is a public write endpoint.
 * Never put subscriber emails or secret keys in the website repository.
 */

const PICKPATH = Object.freeze({
  signupTab: 'Launch Signups',
  auditTab: 'Consent Log',
  consentVersion: '2026-11-07-v1',
  consentText:
    'I agree to receive marketing emails from Sowell Solutions LLC ' +
    '(Sowell Solutions Studio) about PickPath Shopping, including launch ' +
    'announcements and occasional product updates. I can unsubscribe at ' +
    'any time using the link in each marketing email.',
  headings: [
    'Email', 'Submitted At UTC', 'Status', 'Consent', 'Consent Version',
    'Consent Text', 'Website', 'Last Request UTC'
  ],
  auditHeadings: [
    'Submitted At UTC', 'Email', 'Action', 'Consent Version',
    'Consent Text', 'Website'
  ],
  allowedSites: [
    'https://sowellsolutionsstudio.github.io',
    'https://pickpathshopping.com',
    'https://www.pickpathshopping.com'
  ],
  previewReturn: 'https://sowellsolutionsstudio.github.io/pickpathshopping-website/',
  liveReturn: 'https://pickpathshopping.com/'
});

/**
 * STEP ONE: Run this manually using the Run button in Apps Script.
 * The script must have been opened via the target Sheet: Extensions > Apps Script.
 *
 * Creates tabs with appropriate headers and freezes their header rows.
 * Does not change other tabs or erase existing rows.
 */
function setupPickPathSignups() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('Open this project from Google Sheets > Extensions > Apps Script.');
  }
  ensureSheet_(spreadsheet, PICKPATH.signupTab, PICKPATH.headings);
  ensureSheet_(spreadsheet, PICKPATH.auditTab, PICKPATH.auditHeadings);
  PropertiesService.getScriptProperties()
    .setProperty('PICKPATH_SPREADSHEET_ID', spreadsheet.getId());
  console.log('PASS: Launch Signups and Consent Log are ready in ' +
    spreadsheet.getName());
}

/** Optional browser health check, with no subscriber details. */
function doGet() {
  return resultPage_(true, 'PickPath signup receiver is ready.',
    PICKPATH.liveReturn, false);
}

/**
 * Cross-origin HTML form POST. We deliberately return a real confirmation
 * page instead of using fetch (opaque/CORS response) or an embedded iframe,
 * which have been unreliable with Apps Script web apps.
 */
function doPost(e) {
  const p = e && e.parameter ? e.parameter : {};
  const site = String(p.siteOrigin || '').trim();
  const returnUrl = site === PICKPATH.allowedSites[0]
    ? PICKPATH.previewReturn : PICKPATH.liveReturn;

  try {
    if (PICKPATH.allowedSites.indexOf(site) === -1) {
      throw new Error('Unknown source website');
    }
    if (String(p.companyWebsite || '').trim()) {
      // Honeypot: silently accept but do not store.
      return resultPage_(true, 'Thanks for your interest in PickPath!', returnUrl, true);
    }

    const email = String(p.email || '').trim().toLowerCase();
    const consent = String(p.marketingConsent || '') === 'yes';
    const version = String(p.consentVersion || '');
    if (!consent || version !== PICKPATH.consentVersion) {
      return resultPage_(false, 'Please agree to receive launch emails before signing up.', returnUrl, true);
    }
    if (!validEmail_(email)) {
      return resultPage_(false, 'Please enter a valid email address.', returnUrl, true);
    }

    const spreadsheetId = PropertiesService.getScriptProperties()
      .getProperty('PICKPATH_SPREADSHEET_ID');
    if (!spreadsheetId) {
      throw new Error('Please run setupPickPathSignups before deploying.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const sheet = spreadsheet.getSheetByName(PICKPATH.signupTab);
      const audit = spreadsheet.getSheetByName(PICKPATH.auditTab);
      if (!sheet || !audit) throw new Error('Signup tabs not found.');

      const now = new Date().toISOString();
      // The list is provisional until email ownership can be verified.
      // When the marketing provider is configured, use its double-opt-in flow.
      const status = 'Pending email verification';
      const existingCount = Math.max(sheet.getLastRow() - 1, 0);
      let rowNumber = -1;
      if (existingCount > 0) {
        const values = sheet.getRange(2, 1, existingCount, 1).getValues();
        const i = values.findIndex(row =>
          String(row[0]).trim().toLowerCase() === email);
        if (i >= 0) rowNumber = i + 2;
      }

      if (rowNumber < 0) {
        sheet.appendRow([
          email, now, status, 'Yes', PICKPATH.consentVersion,
          PICKPATH.consentText, site, now
        ]);
      } else {
        // An address may resubmit. Preserve its original submission timestamp
        // but update the latest consent and request time.
        sheet.getRange(rowNumber, 3, 1, 6).setValues([[
          status, 'Yes', PICKPATH.consentVersion,
          PICKPATH.consentText, site, now
        ]]);
      }

      audit.appendRow([
        now, email, rowNumber < 0 ? 'Signup request' : 'Renewed opt-in',
        PICKPATH.consentVersion, PICKPATH.consentText, site
      ]);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    return resultPage_(true,
      "You're on the launch-interest list! We'll confirm your email before marketing begins.",
      returnUrl, true);
  } catch (error) {
    console.error('PickPath signup failed: ' + String(error));
    return resultPage_(false,
      'We could not save your request. Please try again or email studio@sowellsolutions.com.',
      returnUrl, true);
  }
}

function validEmail_(email) {
  // Practical validation for collection, not proof of email ownership.
  return email.length <= 254 &&
    /^[a-z0-9][a-z0-9._%+\-]{0,63}@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#005a3e')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 270);
    if (headers.length >= 6) sheet.setColumnWidth(6, 350);
  } else {
    const actual = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (actual.some((value, i) => value !== headers[i])) {
      throw new Error('Existing "' + name +
        '" headers do not match. No existing rows were altered.');
    }
  }
}

function resultPage_(success, message, destination, showReturn) {
  // message and destination are selected from known constants in this script.
  const heading = success ? 'Thanks for joining us!' : 'Almost there';
  const bg = success ? '#005a3e' : '#9d412d';
  const link = showReturn
    ? '<p><a href="' + destination +
      '" target="_top" rel="noopener">Back to PickPath Shopping</a></p>'
    : '';
  const page = '<!doctype html><html lang="en"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>PickPath Shopping</title>' +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;' +
    'font-family:system-ui,sans-serif;background:#fff9eb;color:#153b32}' +
    'main{max-width:520px;padding:52px 32px;text-align:center}' +
    '.symbol{display:inline-grid;place-items:center;width:88px;height:88px;' +
    'border-radius:30px;background:' + bg + ';color:white;font-size:44px}' +
    'h1{font-size:clamp(2rem,6vw,3rem);line-height:1.1}' +
    'p{font-size:1.08rem;line-height:1.65}a{display:inline-block;' +
    'padding:13px 20px;background:#005a3e;color:white;border-radius:13px;' +
    'font-weight:700;text-decoration:none;margin-top:18px}</style></head>' +
    '<body><main><div class="symbol">' + (success ? '&#10003;' : '!') +
    '</div><h1>' + heading + '</h1><p>' + message + '</p>' +
    link + '</main></body></html>';
  return HtmlService.createHtmlOutput(page)
    .setTitle('PickPath Shopping | Launch Notifications');
}