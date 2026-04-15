/**
 * DELTA EDUCATION - BACKEND V4.2
 * Changes from V4.1:
 *   - submitEnrollment: colors Pending row red + sends admin "new enrollment" alert
 *   - onEditTrigger: auto-detects Status dropdown change → colors cell + sends welcome email
 *   - sendWelcomeEmail: updated content per user request
 *   - sendNewEnrollmentAlert: notifies owner when a new customer submits
 *   - installEditTrigger: one-click helper to set up the onEdit installable trigger
 *   - Removed debug block from submitEnrollment
 */

const CACHE = CacheService.getScriptCache();

// ─── CONFIG ────────────────────────────────────────────────────────────────
const WHATSAPP_LINK  = 'https://chat.whatsapp.com/JeHuNDd6PfTEiWuC4eVr0R';
const SUPPORT_EMAIL  = 'support@thedelta.co.in';
const SUPPORT_PHONE  = '9322385170';
const ADMIN_WHATSAPP = '+91 93223 85170';
const OWNER_EMAIL    = 'shrimaysomani18@gmail.com, sureshsomani12345@gmail.com';

// ─── STATUS COLORS ─────────────────────────────────────────────────────────
const COLOR_PENDING  = { bg: '#f4cccc', fg: '#7f0000', fw: 'bold' }; // Red
const COLOR_APPROVED = { bg: '#d9ead3', fg: '#274e13', fw: 'bold' }; // Green
const COLOR_REJECTED = { bg: '#434343', fg: '#ffffff', fw: 'bold' }; // Black
const COLOR_NONE     = { bg: '#ffffff', fg: '#000000', fw: 'normal' };

// ─── REFERRER SHEET COLUMN INDICES (0-based) ───────────────────────────────
const COL_NAME          = 0;
const COL_EMAIL         = 1;
const COL_PASSWORD      = 2;
const COL_REFERRAL_CODE = 3;
const COL_TYPE          = 4;
const COL_CATEGORY      = 5;
const COL_UPI           = 6;
const COL_APPROVALS     = 7;
const COL_TOTAL_REFS    = 8;
const COL_TOTAL_EARNED  = 9;
const COL_TOTAL_PAID    = 10;
const COL_ELITE_INC     = 11;
const COL_ACHIEVER_INC  = 12;
const COL_ELEVATE_INC   = 13;
const COL_STATUS        = 14;

// ─── ROUTER ────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Referrer');

    if (!sheet) return response({ success: false, error: 'Referrer sheet not found' });

    // 1. SEND OTP (Referrer registration)
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
          body: 'Your verification code is: ' + otp + '\n\nThis code is valid for 10 minutes.'
        });
        return response({ success: true });
      } catch (f) {
        return response({ success: false, message: 'GAS Email Error: ' + f.message });
      }
    }

    // 2. REGISTER REFERRER — 15 columns in correct order
    if (data.action === 'registerReferrer') {
      if (checkDuplicateEmail(sheet, data.email)) {
        return response({ success: false, message: 'User already exists' });
      }
      const savedOtp = CACHE.get(data.email);
      if (!savedOtp || savedOtp !== data.otp) {
        return response({ success: false, error: 'Invalid or expired OTP' });
      }
      const referralCode = generateUniqueCode(sheet);
      sheet.appendRow([
        data.name, data.email, data.password, referralCode,
        'External', data.category, data.upi,
        0, 0, 0, 0, '', '', '', 'Pending'
      ]);
      CACHE.remove(data.email);
      return response({ success: true, code: referralCode });
    }

    // 3. LOGIN
    if (data.action === 'login') {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][COL_EMAIL] === data.email && rows[i][COL_PASSWORD] === data.password) {
          return response({
            success: true,
            user: {
              name:         rows[i][COL_NAME],
              referralCode: rows[i][COL_REFERRAL_CODE],
              status:       normalizeStatus(rows[i][COL_STATUS])
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
        if (rows[i][COL_REFERRAL_CODE] === data.referralCode) {
          const totalEarned = Number(rows[i][COL_TOTAL_EARNED]) || 0;
          const totalPaid   = Number(rows[i][COL_TOTAL_PAID])   || 0;
          userData = {
            status:         normalizeStatus(rows[i][COL_STATUS]),
            totalReferrals: rows[i][COL_TOTAL_REFS],
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

    // 5. VALIDATE REFERRAL CODE
    if (data.action === 'validateReferralCode') {
      return response(validateReferralCode(sheet, data.referralCode));
    }

    // 6. SUBMIT ENROLLMENT
    if (data.action === 'submitEnrollment') {
      return response(submitEnrollment(ss, data));
    }

    // 7. APPROVE ENROLLMENT (programmatic trigger, optional)
    if (data.action === 'approveEnrollment') {
      return response(approveEnrollment(ss, sheet, data));
    }

    // 8. SEND STUDENT OTP
    if (data.action === 'sendStudentOTP') {
      if (!data.email) return response({ success: false, error: 'Email required' });
      try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        CACHE.put('student_' + data.email, otp, 600);
        MailApp.sendEmail({
          to:      data.email,
          subject: 'Delta Education — Verify Your Email',
          body:
            'Dear ' + (data.name || 'Applicant') + ',\n\n' +
            'Your email verification code is: ' + otp + '\n\n' +
            'This code is valid for 10 minutes. If you did not request this, please ignore.\n\n' +
            'Regards,\nTeam Delta Education\n' + SUPPORT_EMAIL
        });
        return response({ success: true });
      } catch (f) {
        return response({ success: false, error: 'Email send failed: ' + f.message });
      }
    }

    // 9. VERIFY STUDENT OTP
    if (data.action === 'verifyStudentOTP') {
      if (!data.email || !data.otp) return response({ success: false, error: 'Email and OTP required' });
      const saved = CACHE.get('student_' + data.email);
      if (!saved)                        return response({ success: false, error: 'OTP expired. Please request a new one.' });
      if (saved !== data.otp.toString()) return response({ success: false, error: 'Incorrect OTP. Please try again.' });
      CACHE.remove('student_' + data.email);
      return response({ success: true });
    }

    return response({ success: false, error: 'Unknown action' });

  } catch (err) {
    return response({ success: false, error: err.toString() });
  }
}

// ─── ON EDIT TRIGGER (installable) ─────────────────────────────────────────
// This fires when the admin manually changes the Status dropdown in OUR CUSTOMER.
// Must be set up as an installable trigger — see installEditTrigger() below.
function onEditTrigger(e) {
  try {
    const sheet = e.range.getSheet();
    if (sheet.getName() !== 'OUR CUSTOMER') return;
    if (e.range.getColumn() !== 13) return; // Status column only
    const row = e.range.getRow();
    if (row < 2) return; // Skip header

    const newStatus = (e.value || '').toString().trim();
    _applyStatusColor(sheet, row, newStatus);

    if (newStatus === 'Approved') {
      const rowData      = sheet.getRange(row, 1, 1, 14).getValues()[0];
      const studentName  = rowData[1];
      const studentEmail = rowData[2];
      const course       = rowData[4];
      const referralCode = rowData[6];

      sendWelcomeEmail(studentEmail, studentName, course);

      // Update referrer stats: TotalReferrals +1, TotalEarned += course incentive
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const referrerSheet = ss.getSheetByName('Referrer');
      if (referralCode && referrerSheet) {
        updateReferrerStats(referrerSheet, referralCode, course);
      }
    }
  } catch (err) {
    Logger.log('onEditTrigger error: ' + err.toString());
  }
}

// ─── APPLY STATUS COLOR ─────────────────────────────────────────────────────
function _applyStatusColor(sheet, row, status) {
  const cell = sheet.getRange(row, 13);
  const s    = status.toLowerCase();
  if (s === 'pending') {
    cell.setBackground(COLOR_PENDING.bg).setFontColor(COLOR_PENDING.fg).setFontWeight(COLOR_PENDING.fw);
  } else if (s === 'approved') {
    cell.setBackground(COLOR_APPROVED.bg).setFontColor(COLOR_APPROVED.fg).setFontWeight(COLOR_APPROVED.fw);
  } else if (s === 'rejected') {
    cell.setBackground(COLOR_REJECTED.bg).setFontColor(COLOR_REJECTED.fg).setFontWeight(COLOR_REJECTED.fw);
  } else {
    cell.setBackground(COLOR_NONE.bg).setFontColor(COLOR_NONE.fg).setFontWeight(COLOR_NONE.fw);
  }
}

// ─── SUBMIT ENROLLMENT ──────────────────────────────────────────────────────
function submitEnrollment(ss, data) {
  var customerSheet = ss.getSheetByName('OUR CUSTOMER');

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
      .setFontWeight('bold').setBackground('#1a237e').setFontColor('#ffffff');
    customerSheet.setFrozenRows(1);
  }

  const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm:ss');

  customerSheet.appendRow([
    timestamp,
    data.name            || '',
    data.email           || '',
    data.phone           || '',
    data.courseLabel     || data.course || '',
    data.source          || '',
    data.referralCode    || '',
    data.referrerName    || '',
    data.txnId           || '',
    data.amountPaid      || '',
    data.discountApplied || 'No',
    data.finalPrice      || '',
    '',   // Status — set explicitly below
    ''    // Admin Notes
  ]);

  const newRow = customerSheet.getLastRow();

  // Set Status to Pending and apply red color
  customerSheet.getRange(newRow, 13).setValue('Pending');
  _applyStatusColor(customerSheet, newRow, 'Pending');

  // Apply dropdown validation to this cell
  _applyStatusDropdown(customerSheet, newRow);

  // Alert owner that a new student is waiting for approval
  sendNewEnrollmentAlert(
    data.name        || 'Unknown',
    data.email       || '',
    data.phone       || '',
    data.courseLabel || data.course || '',
    data.txnId       || '',
    data.amountPaid  || ''
  );

  return { success: true };
}

// ─── STATUS DROPDOWN HELPER ─────────────────────────────────────────────────
function _applyStatusDropdown(sheet, rowNum) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['None', 'Pending', 'Approved', 'Rejected'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(rowNum, 13).setDataValidation(rule);
}

// ─── APPLY DROPDOWNS + COLORS TO ALL EXISTING ROWS ─────────────────────────
function applyDropdownsToAllRows() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('OUR CUSTOMER');
  if (!sheet) { SpreadsheetApp.getUi().alert('OUR CUSTOMER sheet not found.'); return; }
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) { SpreadsheetApp.getUi().alert('No data rows found.'); return; }
  for (let r = 2; r <= lastRow; r++) {
    _applyStatusDropdown(sheet, r);
    const status = sheet.getRange(r, 13).getValue().toString();
    _applyStatusColor(sheet, r, status);
  }
  SpreadsheetApp.getUi().alert('Dropdowns and colors applied to all ' + (lastRow - 1) + ' rows.');
}

// ─── APPROVE ENROLLMENT (programmatic / menu) ───────────────────────────────
function approveEnrollment(ss, referrerSheet, data) {
  const customerSheet = ss.getSheetByName('OUR CUSTOMER');
  if (!customerSheet) return { success: false, message: 'OUR CUSTOMER sheet not found' };

  const rowNum = parseInt(data.row);
  if (!rowNum || rowNum < 2) return { success: false, message: 'Invalid row number' };

  const rowValues    = customerSheet.getRange(rowNum, 1, 1, 14).getValues()[0];
  const studentName  = rowValues[1];
  const studentEmail = rowValues[2];
  const course       = rowValues[4];
  const referralCode = rowValues[6];

  customerSheet.getRange(rowNum, 13).setValue('Approved');
  _applyStatusColor(customerSheet, rowNum, 'Approved');

  if (referralCode && referrerSheet) updateReferrerStats(referrerSheet, referralCode, course);

  sendWelcomeEmail(studentEmail, studentName, course);
  return { success: true };
}

// ─── UPDATE REFERRER STATS ON APPROVAL ─────────────────────────────────────
// Called when a customer whose enrollment used a referral code is Approved.
// Updates: TotalReferrals (+1), TotalEarned (+ course-specific incentive).
// TotalPaid is left unchanged — admin updates it manually when paying out.
function updateReferrerStats(sheet, referralCode, course) {
  const values = sheet.getDataRange().getValues();
  const code   = (referralCode || '').trim().toUpperCase();
  const c      = (course || '').toLowerCase();

  for (let i = 1; i < values.length; i++) {
    const sheetCode = (values[i][COL_REFERRAL_CODE] || '').toString().trim().toUpperCase();
    if (sheetCode !== code) continue;

    // 1. TotalReferrals + 1
    const currentRefs = parseInt(values[i][COL_TOTAL_REFS]) || 0;
    sheet.getRange(i + 1, COL_TOTAL_REFS + 1).setValue(currentRefs + 1);

    // 2. Determine incentive based on course name
    let incentiveCol;
    if (c.indexOf('elite') !== -1) {
      incentiveCol = COL_ELITE_INC;       // column 11 (0-based)
    } else if (c.indexOf('achiev') !== -1) {
      incentiveCol = COL_ACHIEVER_INC;    // column 12 (0-based)
    } else if (c.indexOf('elevate') !== -1) {
      incentiveCol = COL_ELEVATE_INC;     // column 13 (0-based)
    } else {
      incentiveCol = null;
    }

    if (incentiveCol !== null) {
      const incentiveAmt  = parseFloat(values[i][incentiveCol]) || 0;
      const currentEarned = parseFloat(values[i][COL_TOTAL_EARNED]) || 0;
      if (incentiveAmt > 0) {
        sheet.getRange(i + 1, COL_TOTAL_EARNED + 1).setValue(currentEarned + incentiveAmt);
      }
      // Log what we did for transparency
      Logger.log(
        'Referrer ' + values[i][COL_NAME] +
        ' | Code: ' + code +
        ' | Course: ' + course +
        ' | Incentive: ₹' + incentiveAmt +
        ' | NewTotal: ₹' + (currentEarned + incentiveAmt)
      );
    } else {
      Logger.log('updateReferrerStats: No matching course for "' + course + '". TotalEarned not updated.');
    }
    break;
  }
}

// ─── WELCOME EMAIL (Student — sent on Approval) ─────────────────────────────
function sendWelcomeEmail(toEmail, studentName, course) {
  const subject = 'Your ' + course + ' Access is Now Active — Delta Education';

  const plainBody =
    'Dear ' + studentName + ',\n\n' +
    'Thank you for trusting Delta Education.\n\n' +
    'We are pleased to inform you that your access to the ' + course + ' has been activated.\n\n' +
    'Make sure to join our WhatsApp community for all course updates, doubt-solving sessions, ' +
    'and peer interactions — everything happens there.\n\n' +
    'Join here: ' + WHATSAPP_LINK + '\n\n' +
    "Let's work together to make this attempt count and get you into Scaler School of Technology.\n\n" +
    'Happy learning.\n\n' +
    'Regards,\nTeam Delta Education\n' + SUPPORT_EMAIL;

  const accent = course.toLowerCase().indexOf('elite')   !== -1 ? '#001e62'
               : course.toLowerCase().indexOf('achiev')  !== -1 ? '#0a4d3c'
               : '#1a237e';

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dde3ed;">' +

    // Header
    '<div style="background:' + accent + ';padding:28px 32px;">' +
    '<p style="margin:0;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);">Delta Education</p>' +
    '<h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">' + course + ' Access Activated</h1>' +
    '<p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Your journey starts now.</p>' +
    '</div>' +

    // Body
    '<div style="padding:32px;">' +
    '<p style="font-size:14px;color:#1a1a1a;margin:0 0 16px;">Dear <strong>' + studentName + '</strong>,</p>' +
    '<p style="font-size:14px;color:#444;line-height:1.75;margin:0 0 8px;">Thank you for trusting Delta Education.</p>' +
    '<p style="font-size:14px;color:#444;line-height:1.75;margin:0 0 24px;">We are pleased to confirm that your access to the <strong>' + course + '</strong> has been activated.</p>' +

    // WhatsApp
    '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>' +
    '<td style="background:#f5f6f8;border-left:3px solid ' + accent + ';padding:16px 18px;">' +
    '<p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#666;">Join Your Course Community</p>' +
    '<p style="margin:0 0 12px;font-size:13px;color:#444;line-height:1.6;">Make sure to join our WhatsApp community for all course updates, doubt-solving sessions, and peer interactions — everything happens there.</p>' +
    '<a href="' + WHATSAPP_LINK + '" style="display:inline-block;background:' + accent + ';color:#fff;font-size:13px;font-weight:600;padding:9px 18px;text-decoration:none;border-radius:3px;">Join WhatsApp Community</a>' +
    '</td></tr></table>' +

    // Motivational line
    '<div style="background:#f5f6f8;border-left:3px solid ' + accent + ';padding:16px 18px;margin-bottom:24px;">' +
    '<p style="margin:0;font-size:14px;color:#333;line-height:1.7;font-style:italic;">' +
    "\"Let's work together to make this attempt count and get you into Scaler School of Technology.\"" +
    '</p>' +
    '</div>' +

    '<p style="font-size:15px;color:#1a1a1a;font-weight:600;margin:0 0 4px;">Happy learning.</p>' +
    '<p style="font-size:14px;color:#1a1a1a;margin:0;">Regards,<br><strong>Team Delta Education</strong></p>' +
    '</div>' +

    // Footer
    '<div style="background:#f5f6f8;border-top:1px solid #dde3ed;padding:14px 32px;">' +
    '<p style="margin:0;font-size:11px;color:#888;line-height:1.6;">' +
    'Need support? WhatsApp: <a href="https://wa.me/91' + SUPPORT_PHONE + '" style="color:#555;">' + SUPPORT_PHONE + '</a>' +
    ' &nbsp;|&nbsp; Email: <a href="mailto:' + SUPPORT_EMAIL + '" style="color:#555;">' + SUPPORT_EMAIL + '</a>' +
    '</p>' +
    '</div>' +

    '</div>';

  MailApp.sendEmail({
    to:       toEmail,
    subject:  subject,
    body:     plainBody,
    htmlBody: htmlBody,
    name:     'Delta Education',
    replyTo:  SUPPORT_EMAIL
  });
}

// ─── NEW ENROLLMENT ALERT (to owner — fired on submitEnrollment) ────────────
function sendNewEnrollmentAlert(studentName, studentEmail, phone, course, txnId, amountPaid) {
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');
  const subject   = 'New Enrollment Pending Approval — ' + studentName + ' | ' + course;

  const plainBody =
    'Hi Suresh,\n\n' +
    'A new student has submitted an enrollment request and is waiting for your approval.\n\n' +
    'Student  : ' + studentName + '\n' +
    'Email    : ' + studentEmail + '\n' +
    'Phone    : ' + phone + '\n' +
    'Course   : ' + course + '\n' +
    'Txn ID   : ' + txnId + '\n' +
    'Amount   : ₹' + amountPaid + '\n' +
    'Submitted: ' + timestamp + '\n\n' +
    'Please open the "OUR CUSTOMER" tab in Delta Master Sheet and change the Status to "Approved" to send them the access email.\n\n' +
    'This is an automated alert from the Delta Enrollment System.';

  const tr = function(label, value, shade) {
    return '<tr style="border-top:1px solid #e0e6f0;' + (shade ? 'background:#fafbfd;' : '') + '">' +
      '<td style="padding:10px 16px;font-size:13px;color:#666;width:35%;">' + label + '</td>' +
      '<td style="padding:10px 16px;font-size:13px;color:#111;font-weight:600;">' + value + '</td>' +
      '</tr>';
  };

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #dde3ed;">' +
    '<div style="background:#b91c1c;padding:20px 28px;">' +
    '<p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.6);">Delta Education — Action Required</p>' +
    '<h2 style="margin:6px 0 0;color:#fff;font-size:17px;font-weight:700;">New Enrollment Awaiting Approval</h2>' +
    '</div>' +
    '<div style="padding:24px 28px;">' +
    '<p style="font-size:14px;color:#444;margin:0 0 18px;line-height:1.7;">Hi Suresh, a new student has enrolled and is waiting for your approval. Please review and approve their access.</p>' +
    '<table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e0e6f0;border-radius:4px;">' +
    '<tr style="background:#f5f6f8;"><td style="padding:9px 16px;font-size:11px;font-weight:700;text-transform:uppercase;color:#777;">Field</td><td style="padding:9px 16px;font-size:11px;font-weight:700;text-transform:uppercase;color:#777;">Details</td></tr>' +
    tr('Student Name', studentName, false) +
    tr('Email', studentEmail, true) +
    tr('Phone', phone, false) +
    tr('Course', course, true) +
    tr('Transaction ID', txnId, false) +
    tr('Amount Paid', '&#8377;' + amountPaid, true) +
    tr('Submitted At', timestamp, false) +
    '</table>' +
    '<p style="font-size:13px;color:#b91c1c;font-weight:600;margin:18px 0 0;">Open "OUR CUSTOMER" sheet → change Status to "Approved" to send the student their access email automatically.</p>' +
    '</div>' +
    '<div style="background:#f5f6f8;border-top:1px solid #dde3ed;padding:12px 28px;">' +
    '<p style="margin:0;font-size:11px;color:#aaa;">Automated alert from the Delta Enrollment System.</p>' +
    '</div>' +
    '</div>';

  MailApp.sendEmail({
    to:       OWNER_EMAIL,
    subject:  subject,
    body:     plainBody,
    htmlBody: htmlBody,
    name:     'Delta Enrollment System'
  });
}

// ─── ADMIN SHEET MENU ───────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Delta Admin')
    .addItem('Approve Selected Row (OUR CUSTOMER)',    'approveSelectedRow')
    .addItem('Apply Dropdowns + Colors to All Rows',  'applyDropdownsToAllRows')
    .addSeparator()
    .addItem('SETUP: Install Auto-Approve Trigger',   'installEditTrigger')
    .addSeparator()
    .addItem('Permission Test (send test email)',      'manualPermissionTrigger')
    .addToUi();
}

function approveSelectedRow() {
  const ui    = SpreadsheetApp.getUi();
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  if (sheet.getName() !== 'OUR CUSTOMER') {
    ui.alert('Please switch to the "OUR CUSTOMER" sheet first.');
    return;
  }

  const row = sheet.getActiveCell().getRow();
  if (row < 2) { ui.alert('Please select a data row (not the header).'); return; }

  const currentStatus = sheet.getRange(row, 13).getValue();
  if (currentStatus === 'Approved') {
    ui.alert('This row is already approved. No action taken.');
    return;
  }

  const referrerSheet = ss.getSheetByName('Referrer');
  const result = approveEnrollment(ss, referrerSheet, { row: row });

  if (result.success) {
    ui.alert('Row ' + row + ' approved. Welcome email sent to student.');
  } else {
    ui.alert('Error: ' + (result.message || 'Unknown error'));
  }
}

// ─── INSTALL EDIT TRIGGER ───────────────────────────────────────────────────
// Run this ONCE from the menu: Delta Admin → SETUP: Install Auto-Approve Trigger
// After this, changing any Status cell to "Approved" automatically sends the email.
function installEditTrigger() {
  // Remove any existing onEditTrigger to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  for (let t of triggers) {
    if (t.getHandlerFunction() === 'onEditTrigger') {
      ScriptApp.deleteTrigger(t);
    }
  }
  ScriptApp.newTrigger('onEditTrigger')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
  SpreadsheetApp.getUi().alert(
    'Auto-approve trigger installed.\n\n' +
    'From now on, whenever you change any "Status" cell in "OUR CUSTOMER" to "Approved", ' +
    'the welcome email will be sent automatically and the cell will turn green.'
  );
}

// ─── VALIDATE REFERRAL CODE ─────────────────────────────────────────────────
function validateReferralCode(sheet, inputCode) {
  if (!inputCode) return { valid: false };
  const values = sheet.getDataRange().getValues();
  const code   = inputCode.toString().trim().toUpperCase();
  for (let i = 1; i < values.length; i++) {
    const sheetCode = (values[i][COL_REFERRAL_CODE] || '').toString().trim().toUpperCase();
    if (sheetCode === code) {
      return { valid: true, referrerName: values[i][COL_NAME] || '' };
    }
  }
  return { valid: false };
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function normalizeStatus(raw) {
  const s = (raw || '').toString().trim().toLowerCase();
  if (s === 'active') return 'approved';
  return s;
}

function checkDuplicateEmail(sheet, email) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][COL_EMAIL] === email) return true;
  }
  return false;
}

function generateUniqueCode(sheet) {
  const codes = sheet.getRange('D:D').getValues().flat();
  let code;
  do { code = 'DELTA' + Math.floor(1000 + Math.random() * 9000); }
  while (codes.includes(code));
  return code;
}

function response(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'validateReferralCode') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Referrer');
    if (!sheet) {
      const sheets = ss.getSheets();
      for (let s of sheets) {
        if (s.getName().toLowerCase().trim() === 'referrer') { sheet = s; break; }
      }
    }
    if (!sheet) return response({ valid: false, error: 'Referrer sheet not found' });
    return response(validateReferralCode(sheet, e.parameter.referralCode || ''));
  }
  return ContentService.createTextOutput('Delta API 4.2 Active');
}

function manualPermissionTrigger() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Delta Permission Test', 'Email sending is authorised.');
}
