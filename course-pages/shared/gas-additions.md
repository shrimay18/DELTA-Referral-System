# Google Apps Script — New Functions to Add

> **Instructions:** Open your Google Apps Script editor (the same one managing your existing referral system) and paste the following functions. Then re-deploy as a new version.

---

## 1. Add the "OUR CUSTOMER" Sheet Setup

In your `doPost` function (or wherever you handle the `action` switch), add these new cases:

```javascript
case 'validateReferralCode':
  return validateReferralCode(data);
case 'submitEnrollment':
  return submitEnrollment(data);
case 'approveEnrollment':
  return approveEnrollment(data);
```

---

## 2. `validateReferralCode` Function

Looks up the referral code in the "Referrer" sheet.

```javascript
function validateReferralCode(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('referrer');
  if (!sheet) return { valid: false };

  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function(h) { return h.toString().toLowerCase().trim(); });
  var codeCol = headers.indexOf('referral code');
  var nameCol = headers.indexOf('name');

  if (codeCol === -1) return { valid: false };

  var inputCode = (data.referralCode || '').toString().trim().toUpperCase();

  for (var i = 1; i < values.length; i++) {
    var sheetCode = (values[i][codeCol] || '').toString().trim().toUpperCase();
    if (sheetCode === inputCode) {
      return {
        valid: true,
        referrerName: nameCol !== -1 ? values[i][nameCol] : ''
      };
    }
  }
  return { valid: false };
}
```

---

## 3. `submitEnrollment` Function

Writes a new row to the "OUR CUSTOMER" sheet.

```javascript
function submitEnrollment(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('OUR CUSTOMER');

  // Auto-create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('OUR CUSTOMER');
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Phone', 'Course', 'Source',
      'Referral Code', 'Referrer Name', 'Transaction ID', 'Amount Paid',
      'Discount Applied', 'Final Price', 'Status', 'Admin Notes'
    ]);
    // Bold header
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold');
  }

  var timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  sheet.appendRow([
    timestamp,
    data.name || '',
    data.email || '',
    data.phone || '',
    data.courseLabel || data.course || '',
    data.source || '',
    data.referralCode || '',
    data.referrerName || '',
    data.txnId || '',
    data.amountPaid || '',
    data.discountApplied || 'No',
    data.finalPrice || '',
    'Pending',   // ← Admin changes this to "Approved" to trigger email
    ''
  ]);

  return { success: true };
}
```

---

## 4. `approveEnrollment` Function

**Triggered manually by admin** (or via a button in your admin sheet). Pass the row number.

```javascript
function approveEnrollment(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('OUR CUSTOMER');
  if (!sheet) return { success: false, message: 'Sheet not found' };

  var rowNum = parseInt(data.row);
  if (!rowNum || rowNum < 2) return { success: false, message: 'Invalid row' };

  var values = sheet.getRange(rowNum, 1, 1, 14).getValues()[0];
  var studentName  = values[1];
  var studentEmail = values[2];
  var course       = values[4];
  var referralCode = values[6];
  var referrerName = values[7];

  // 1. Update status to "Approved"
  sheet.getRange(rowNum, 13).setValue('Approved');

  // 2. If referral code was used, increment referrer's count
  if (referralCode) {
    _incrementReferrerCount(referralCode);
  }

  // 3. Send welcome email
  _sendWelcomeEmail(studentEmail, studentName, course);

  return { success: true };
}

function _incrementReferrerCount(referralCode) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('referrer');
  if (!sheet) return;

  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function(h) { return h.toString().toLowerCase().trim(); });
  var codeCol = headers.indexOf('referral code');
  var countCol = headers.indexOf('total referrals');  // ← adjust to your actual column name

  if (codeCol === -1 || countCol === -1) return;

  var code = (referralCode || '').toUpperCase().trim();
  for (var i = 1; i < values.length; i++) {
    if ((values[i][codeCol] || '').toString().toUpperCase().trim() === code) {
      var currentCount = parseInt(values[i][countCol]) || 0;
      sheet.getRange(i + 1, countCol + 1).setValue(currentCount + 1);
      break;
    }
  }
}

function _sendWelcomeEmail(toEmail, studentName, course) {
  var whatsappLink = 'https://chat.whatsapp.com/Iu1h7eC00CG47JCQcpdp7O';

  var subject = 'Welcome to Delta Education — Your ' + course + ' Access is Confirmed! 🎉';

  var body = `
Hi ${studentName},

Welcome to Delta Education! 🎓

Your enrollment in the **${course}** has been confirmed and your access is now active.

Here's what to do next:

📱 **Join your course WhatsApp community:**
${whatsappLink}

This is where all course updates, doubt sessions, and peer interactions happen — so make sure you join right away.

If you face any issues accessing your materials, reply to this email or WhatsApp us at +91 99017 16335.

We're rooting for you. Let's get that SST offer letter.

With belief,
The Delta Education Team
support@thedelta.co.in
  `.trim();

  var htmlBody = body
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  GmailApp.sendEmail(toEmail, subject, body, {
    htmlBody: '<div style="font-family:Arial,sans-serif;line-height:1.7;font-size:14px;">' + htmlBody + '</div>',
    name: 'Delta Education',
    replyTo: 'support@thedelta.co.in'
  });
}
```

---

## 5. Admin Approval Shortcut (Optional)

Add a custom menu so you can approve directly from the sheet:

```javascript
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Delta Admin')
    .addItem('Approve Selected Row', 'approveSelectedRow')
    .addToUi();
}

function approveSelectedRow() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = sheet.getActiveCell().getRow();
  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a data row (not the header).');
    return;
  }
  approveEnrollment({ row: row });
  SpreadsheetApp.getUi().alert('Row ' + row + ' approved and welcome email sent!');
}
```

---

## Important Notes

> **"Total Referrals" column name:** In `_incrementReferrerCount`, update `'total referrals'` to match the **exact column header name** in your "Referrer" sheet.

> **Re-deploy:** After pasting, go to **Deploy → Manage Deployments → Edit → New Version → Deploy**. The URL stays the same.

> **Sender email:** The email will be sent from the Google account that owns the Apps Script. Make sure `support@thedelta.co.in` is configured as a send-as alias in that account, or the reply-to header will be used instead.
