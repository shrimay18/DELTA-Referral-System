/**
 * DELTA EDUCATION - BACKEND V4.0
 * Includes: OTP, Registration, Login, Dashboard,
 *           Referral Code Validation, Customer Enrollment,
 *           Admin Approval + Welcome Email
 */

const CACHE = CacheService.getScriptCache();

// ─── CONFIG ────────────────────────────────────────────────────────────────
const WHATSAPP_LINK  = 'https://chat.whatsapp.com/Iu1h7eC00CG47JCQcpdp7O';
const SUPPORT_EMAIL  = 'support@thedelta.co.in';
const ADMIN_WHATSAPP = '+91 99017 16335';

// ─── ROUTER ────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Referrer');

    if (!sheet) return response({ success: false, error: 'Referrer sheet not found' });

    // ── EXISTING ACTIONS ──────────────────────────────────────────────────

    // 1. SEND OTP
    if (data.action === 'sendOTP') {
      if (checkDuplicateEmail(sheet, data.email)) {
        return response({ success: false, message: 'User already exists' });
      }
      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        CACHE.put(data.email, otp, 600);
        MailApp.sendEmail({
          to: data.email,
          subject: 'Delta Education - Your OTP Code',
          body: 'Your verification code is: ' + otp
        });
        return response({ success: true });
      } catch (f) {
        return response({ success: false, message: 'GAS Email Error: ' + f.message });
      }
    }

    // 2. REGISTER REFERRER
    if (data.action === 'registerReferrer') {
      if (checkDuplicateEmail(sheet, data.email)) {
        return response({ success: false, message: 'User already exists' });
      }
      const savedOtp = CACHE.get(data.email);
      if (!savedOtp || savedOtp !== data.otp) {
        return response({ success: false, error: 'Invalid or expired OTP' });
      }
      const referralCode = generateUniqueCode(sheet);
      // A:Name B:Email C:Password D:Code E:Type F:Cat G:UPI H:Status I:Refs J:Earned K:Paid L:Active
      sheet.appendRow([
        data.name, data.email, data.password, referralCode,
        'External', data.category, data.upi, 'Pending', 0, 0, 0, 'Active'
      ]);
      CACHE.remove(data.email);
      return response({ success: true, code: referralCode });
    }

    // 3. LOGIN
    if (data.action === 'login') {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.email && rows[i][2] === data.password) {
          return response({
            success: true,
            user: {
              name: rows[i][0],
              referralCode: rows[i][3],
              status: rows[i][7].toString().toLowerCase()
            }
          });
        }
      }
      return response({ success: false, error: 'Invalid credentials' });
    }

    // 4. GET DASHBOARD
    if (data.action === 'getDashboard') {
      const rows = sheet.getDataRange().getValues();
      let userData = null;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][3] === data.referralCode) {
          const totalEarned = Number(rows[i][9]) || 0;
          const totalPaid   = Number(rows[i][10]) || 0;
          userData = {
            status:         rows[i][7].toString().toLowerCase(),
            totalReferrals: rows[i][8],
            totalEarned:    totalEarned,
            totalPaid:      totalPaid,
            amountDue:      totalEarned - totalPaid
          };
          break;
        }
      }
      if (!userData) return response({ success: false, error: 'Referrer data not found' });

      const refSheet = ss.getSheetByName('Referrals');
      let history = [];
      if (refSheet) {
        const refData = refSheet.getDataRange().getValues();
        for (let j = 1; j < refData.length; j++) {
          if (refData[j][0] === data.referralCode) {
            history.push({
              studentName: refData[j][1], course: refData[j][2],
              status: refData[j][3], date: refData[j][4], amount: refData[j][5]
            });
          }
        }
      }
      return response({ success: true, ...userData, history });
    }

    // ── NEW ENROLLMENT ACTIONS ─────────────────────────────────────────────

    // 5. VALIDATE REFERRAL CODE
    if (data.action === 'validateReferralCode') {
      return response(validateReferralCode(sheet, data.referralCode));
    }

    // 6. SUBMIT ENROLLMENT (student fills form → goes to "OUR CUSTOMER" sheet as Pending)
    if (data.action === 'submitEnrollment') {
      return response(submitEnrollment(ss, data));
    }

    // 7. APPROVE ENROLLMENT (admin triggers) — pass { row: <rowNumber> }
    if (data.action === 'approveEnrollment') {
      return response(approveEnrollment(ss, sheet, data));
    }

    return response({ success: false, error: 'Unknown action' });

  } catch (err) {
    return response({ success: false, error: err.toString() });
  }
}

// ─── VALIDATE REFERRAL CODE ─────────────────────────────────────────────────
function validateReferralCode(sheet, inputCode) {
  if (!inputCode) return { valid: false };
  const values = sheet.getDataRange().getValues();
  // Column D (index 3) = Referral Code, Column A (index 0) = Name
  const code = inputCode.toString().trim().toUpperCase();
  for (let i = 1; i < values.length; i++) {
    const sheetCode = (values[i][3] || '').toString().trim().toUpperCase();
    if (sheetCode === code) {
      return { valid: true, referrerName: values[i][0] || '' };
    }
  }
  return { valid: false };
}

// ─── SUBMIT ENROLLMENT ──────────────────────────────────────────────────────
function submitEnrollment(ss, data) {
  var customerSheet = ss.getSheetByName('OUR CUSTOMER');

  // Auto-create the sheet if it doesn't exist
  if (!customerSheet) {
    customerSheet = ss.insertSheet('OUR CUSTOMER');
    const headers = [
      'Timestamp', 'Name', 'Email', 'Phone', 'Course',
      'Source', 'Referral Code', 'Referrer Name',
      'Transaction ID', 'Amount Paid', 'Discount Applied',
      'Final Price', 'Status', 'Admin Notes'
    ];
    customerSheet.appendRow(headers);
    customerSheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1a237e')
      .setFontColor('#ffffff');
    customerSheet.setFrozenRows(1);
  }

  const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm:ss');

  customerSheet.appendRow([
    timestamp,
    data.name        || '',
    data.email       || '',
    data.phone       || '',
    data.courseLabel || data.course || '',
    data.source      || '',
    data.referralCode || '',
    data.referrerName || '',
    data.txnId       || '',
    data.amountPaid  || '',
    data.discountApplied || 'No',
    data.finalPrice  || '',
    'Pending',   // Admin will change this to "Approved" via the menu
    ''
  ]);

  return { success: true };
}

// ─── APPROVE ENROLLMENT ─────────────────────────────────────────────────────
// Called from GAS action OR from the admin sheet menu (see approveSelectedRow below)
function approveEnrollment(ss, referrerSheet, data) {
  const customerSheet = ss.getSheetByName('OUR CUSTOMER');
  if (!customerSheet) return { success: false, message: 'OUR CUSTOMER sheet not found' };

  const rowNum = parseInt(data.row);
  if (!rowNum || rowNum < 2) return { success: false, message: 'Invalid row number' };

  const rowValues = customerSheet.getRange(rowNum, 1, 1, 14).getValues()[0];
  const studentName  = rowValues[1];
  const studentEmail = rowValues[2];
  const course       = rowValues[4];
  const referralCode = rowValues[6];

  // 1. Mark as Approved
  customerSheet.getRange(rowNum, 13).setValue('Approved');

  // 2. Increment referrer's count if a referral code was used
  if (referralCode) {
    incrementReferrerCount(referrerSheet, referralCode);
  }

  // 3. Send welcome email to student
  sendWelcomeEmail(studentEmail, studentName, course);

  return { success: true };
}

// ─── INCREMENT REFERRER COUNT ───────────────────────────────────────────────
function incrementReferrerCount(sheet, referralCode) {
  const values = sheet.getDataRange().getValues();
  // Column D (index 3) = Code, Column I (index 8) = Total Referrals
  const code = (referralCode || '').trim().toUpperCase();
  for (let i = 1; i < values.length; i++) {
    const sheetCode = (values[i][3] || '').toString().trim().toUpperCase();
    if (sheetCode === code) {
      const currentCount = parseInt(values[i][8]) || 0;
      sheet.getRange(i + 1, 9).setValue(currentCount + 1); // Column I
      break;
    }
  }
}

// ─── SEND WELCOME EMAIL ─────────────────────────────────────────────────────
function sendWelcomeEmail(toEmail, studentName, course) {
  const subject = 'Welcome to Delta Education — Your ' + course + ' Access is Confirmed! 🎉';

  const plainBody =
    'Hi ' + studentName + ',\n\n' +
    'Welcome to Delta Education! 🎓\n\n' +
    'Your enrollment in ' + course + ' has been confirmed and your access is now active.\n\n' +
    'JOIN YOUR COURSE WHATSAPP COMMUNITY:\n' + WHATSAPP_LINK + '\n\n' +
    'This is where all course updates, doubt sessions, and peer interactions happen — join right away!\n\n' +
    'If you need any help, WhatsApp us at ' + ADMIN_WHATSAPP + ' or reply to this email.\n\n' +
    'We are rooting for you. Let\'s get that SST offer letter.\n\n' +
    'With belief,\nThe Delta Education Team\n' + SUPPORT_EMAIL;

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;line-height:1.8;font-size:14px;color:#111;">' +
    '<p>Hi <strong>' + studentName + '</strong>,</p>' +
    '<p>Welcome to <strong>Delta Education!</strong> 🎓</p>' +
    '<p>Your enrollment in <strong>' + course + '</strong> has been confirmed and your access is now active.</p>' +
    '<p><strong>📱 Join your course WhatsApp community:</strong><br>' +
    '<a href="' + WHATSAPP_LINK + '" style="color:#0056d2;">' + WHATSAPP_LINK + '</a></p>' +
    '<p style="background:#f0f4ff;padding:14px;border-radius:8px;border-left:4px solid #0056d2;">' +
    'This is where all course updates, live sessions, and peer discussions happen — join right away!</p>' +
    '<p>If you need any help, WhatsApp us at <strong>' + ADMIN_WHATSAPP + '</strong> or reply to this email.</p>' +
    '<br><p>We\'re rooting for you. Let\'s get that SST offer letter.</p>' +
    '<p style="color:#666;font-size:12px;">With belief,<br><strong>The Delta Education Team</strong><br>' + SUPPORT_EMAIL + '</p>' +
    '</div>';

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody,
    name: 'Delta Education',
    replyTo: SUPPORT_EMAIL
  });
}

// ─── ADMIN SHEET MENU ───────────────────────────────────────────────────────
// This creates a "Delta Admin" menu in Google Sheets for easy approvals
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎓 Delta Admin')
    .addItem('✅ Approve Selected Row (OUR CUSTOMER)', 'approveSelectedRow')
    .addSeparator()
    .addItem('📧 Permission Test (send test email)', 'manualPermissionTrigger')
    .addToUi();
}

function approveSelectedRow() {
  const ui       = SpreadsheetApp.getUi();
  const ss       = SpreadsheetApp.getActiveSpreadsheet();
  const sheet    = ss.getActiveSheet();

  if (sheet.getName() !== 'OUR CUSTOMER') {
    ui.alert('⚠️ Please switch to the "OUR CUSTOMER" sheet first, then click on the row to approve.');
    return;
  }

  const row = sheet.getActiveCell().getRow();
  if (row < 2) {
    ui.alert('⚠️ Please select a data row (not the header row).');
    return;
  }

  const currentStatus = sheet.getRange(row, 13).getValue();
  if (currentStatus === 'Approved') {
    ui.alert('ℹ️ This row is already approved. No action taken.');
    return;
  }

  const referrerSheet = ss.getSheetByName('Referrer');
  const result = approveEnrollment(ss, referrerSheet, { row: row });

  if (result.success) {
    ui.alert('✅ Row ' + row + ' approved!\n\nWelcome email sent to the student.');
  } else {
    ui.alert('❌ Error: ' + (result.message || 'Unknown error'));
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function checkDuplicateEmail(sheet, email) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) return true;
  }
  return false;
}

function generateUniqueCode(sheet) {
  const codes = sheet.getRange('D:D').getValues().flat();
  let code;
  do {
    code = 'DELTA' + Math.floor(1000 + Math.random() * 9000);
  } while (codes.includes(code));
  return code;
}

function response(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  // validateReferralCode via GET — avoids the POST redirect CORS issue
  if (e && e.parameter && e.parameter.action === 'validateReferralCode') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Case-insensitive sheet lookup
    let sheet = ss.getSheetByName('Referrer');
    if (!sheet) sheet = ss.getSheetByName('referrer');
    if (!sheet) {
      const sheets = ss.getSheets();
      for (let s of sheets) {
        if (s.getName().toLowerCase().trim() === 'referrer') {
          sheet = s;
          break;
        }
      }
    }
    
    if (!sheet) return response({ valid: false, error: 'Referrer sheet not found' });
    const result = validateReferralCode(sheet, e.parameter.referralCode || '');
    return response(result);
  }
  return ContentService.createTextOutput('Delta API 4.0 Active');
}

function manualPermissionTrigger() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Delta Permission Test', 'Email sending authorised!');
}
