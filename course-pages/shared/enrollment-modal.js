/**
 * enrollment-modal.js — Delta Education Enrollment Flow
 * Shared across Elite, Achiever, Elevate course pages.
 *
 * Usage (per page):
 *   openEnrollModal('elite')
 *   openEnrollModal('achiever')
 *   openEnrollModal('elevate')
 */

// ── COURSE CONFIG ──────────────────────────────────────────────────────────
const COURSE_CONFIG = {
  elite: {
    label: 'Elite Track',
    normalPrice: 8999,
    discountedPrice: 7999,
    upiId: 'raxakantawala-1@okicici',
    upiName: 'Raxa Kantawala',
  },
  achiever: {
    label: 'Achiever Track',
    normalPrice: 5499,
    discountedPrice: 4999,
    upiId: 'raxakantawala-1@okicici',
    upiName: 'Raxa Kantawala',
  },
  elevate: {
    label: 'Elevate Track',
    normalPrice: 3999,
    discountedPrice: 3499,
    upiId: 'raxakantawala-1@okicici',
    upiName: 'Raxa Kantawala',
  },
};

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxVu2JixgtMQV15RrKm9cZ0BwRDzq4yLRdlyp8XiHw5eOS2hNqR952NMsHGeTn8Hx96JQ/exec';
const WHATSAPP_COMMUNITY = 'https://chat.whatsapp.com/JeHuNDd6PfTEiWuC4eVr0R';
const PAYMENT_WHATSAPP   = '+919901716335';

// ── STATE ──────────────────────────────────────────────────────────────────
let _course = null;
let _step = 1;
let _step1Sub = 'form'; // 'form' | 'otp' — sub-state within Step 1
let _formData = {};
let _referralValid = false;
let _finalPrice = 0;

// ── OPEN / CLOSE ────────────────────────────────────────────────────────────
function openEnrollModal(courseKey) {
  _course = COURSE_CONFIG[courseKey];
  if (!_course) return;
  _course.key = courseKey;
  _step = 1;
  _step1Sub = 'form';
  _formData = {};
  _referralValid = false;
  _finalPrice = _course.normalPrice;

  _renderModal();

  const overlay = document.getElementById('em-overlay');
  requestAnimationFrame(() => {
    overlay.classList.add('em-open');
    document.body.style.overflow = 'hidden';
  });
}

function closeEnrollModal() {
  const overlay = document.getElementById('em-overlay');
  overlay.classList.remove('em-open');
  document.body.style.overflow = '';
}

// ── RENDER ──────────────────────────────────────────────────────────────────
function _renderModal() {
  const overlay = document.getElementById('em-overlay') || _createOverlay();
  overlay.innerHTML = _buildHTML();
  _bindEvents();
}

function _createOverlay() {
  const el = document.createElement('div');
  el.id = 'em-overlay';
  el.className = 'em-overlay';
  el.addEventListener('mousedown', (e) => {
    if (e.target === el) closeEnrollModal();
  });
  document.body.appendChild(el);
  return el;
}

function _buildHTML() {
  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Source' },
    { num: 3, label: 'Payment' },
  ];

  const progressHTML = steps.map((s, i) => {
    const cls = _step === s.num ? 'active' : _step > s.num ? 'done' : '';
    const lineCls = _step > s.num ? 'done' : '';
    const dotContent = _step > s.num
      ? `<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
      : s.num;
    return `
      <div class="em-step-item ${cls}">
        <div class="em-step-dot ${cls}">${dotContent}</div>
        <div class="em-step-label">${s.label}</div>
      </div>
      ${i < steps.length - 1 ? `<div class="em-step-line ${lineCls}"></div>` : ''}
    `;
  }).join('');

  let bodyHTML = '';
  if (_step === 1 && _step1Sub === 'form') bodyHTML = _buildStep1();
  else if (_step === 1 && _step1Sub === 'otp') bodyHTML = _buildStep1OTP();
  else if (_step === 2) bodyHTML = _buildStep2();
  else if (_step === 3) bodyHTML = _buildStep3();
  else if (_step === 4) bodyHTML = _buildConfirm();

  return `
    <div class="em-modal">
      <button class="em-close" onclick="closeEnrollModal()" aria-label="Close">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      ${_step < 4 ? `<div class="em-progress">${progressHTML}</div>` : ''}
      <div class="em-body">${bodyHTML}</div>
    </div>
  `;
}

// ── STEP 1: Contact ─────────────────────────────────────────────────────────
function _buildStep1() {
  const d = _formData;
  return `
    <div class="em-heading">Let's get started.</div>
    <div class="em-sub">Enrolling in <strong style="color:#fff">${_course.label}</strong></div>

    <div class="em-global-error" id="em-err1"></div>

    <div class="em-field">
      <label>Full Name</label>
      <input type="text" id="em-name" placeholder="Your full name" value="${d.name || ''}" autocomplete="name"/>
      <div class="em-field-error" id="em-name-err">Please enter your name.</div>
    </div>

    <div class="em-field">
      <label>Email Address</label>
      <input type="email" id="em-email" placeholder="your@email.com" value="${d.email || ''}" autocomplete="email"/>
      <div class="em-field-error" id="em-email-err">Please enter a valid email address.</div>
    </div>

    <div class="em-field">
      <label>Mobile Number</label>
      <input type="tel" id="em-phone" placeholder="10-digit mobile number" value="${d.phone || ''}" maxlength="12" autocomplete="tel"/>
      <div class="em-field-error" id="em-phone-err">Please enter a valid 10-digit mobile number.</div>
    </div>

    <button class="em-btn" id="em-next1" onclick="_submitStep1()">
      Continue
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
  `;
}

async function _submitStep1() {
  const name  = document.getElementById('em-name').value.trim();
  const email = document.getElementById('em-email').value.trim();
  const phone = document.getElementById('em-phone').value.trim().replace(/\s|-/g, '');

  let valid = true;
  _clearError('em-name-err'); _clearError('em-email-err'); _clearError('em-phone-err');

  if (!name) { _showError('em-name-err'); _markError('em-name'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    _showError('em-email-err'); _markError('em-email'); valid = false;
  }
  if (!phone || !/^\d{10}$/.test(phone)) {
    _showError('em-phone-err'); _markError('em-phone'); valid = false;
  }
  if (!valid) return;

  _formData.name  = name;
  _formData.email = email;
  _formData.phone = phone;

  // Send OTP to student's email before proceeding
  const btn = document.getElementById('em-next1');
  const btnText = btn ? btn.querySelector('span') || btn : btn;
  if (btn) { btn.disabled = true; btn.textContent = 'Sending OTP…'; }

  try {
    const res  = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'sendStudentOTP', email, name })
    });
    const json = await res.json();
    console.log('[OTP] sendStudentOTP response:', json);
    if (json.success) {
      _step1Sub = 'otp';
      _renderModal();
    } else if (json.error === 'Unknown action') {
      // Old GAS deployed — skip OTP and proceed directly to step 2
      console.warn('[OTP] GAS does not support sendStudentOTP. Skipping OTP check. Please deploy updated GAS.');
      _step = 2;
      _step1Sub = 'form';
      _renderModal();
    } else {
      if (btn) { btn.disabled = false; btn.textContent = 'Continue'; }
      const errEl = document.getElementById('em-err1');
      if (errEl) { errEl.textContent = json.error || 'Could not send OTP. Please try again.'; errEl.classList.add('show'); }
    }
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Continue'; }
    const errEl = document.getElementById('em-err1');
    if (errEl) { errEl.textContent = 'Network error. Please try again.'; errEl.classList.add('show'); }
  }
}

// ── STEP 1 OTP SUB-STEP ──────────────────────────────────────────────────────
function _buildStep1OTP() {
  return `
    <div class="em-heading">Verify your email.</div>
    <div class="em-sub">We sent a 6-digit code to <strong style="color:#fff">${_formData.email}</strong></div>

    <div class="em-global-error" id="em-otp-err"></div>

    <div class="em-field">
      <label>6-Digit OTP</label>
      <input
        type="text"
        id="em-student-otp"
        placeholder="_ _ _ _ _ _"
        maxlength="6"
        inputmode="numeric"
        autocomplete="one-time-code"
        style="text-align:center;letter-spacing:0.4em;font-size:1.2rem;font-weight:700"
        oninput="this.value=this.value.replace(/\\D/g,'').slice(0,6)"
      />
      <div class="em-field-hint">Check your inbox at ${_formData.email}</div>
    </div>

    <button class="em-btn" id="em-verify-otp" onclick="_submitStudentOTP()">
      <span id="em-otp-btn-text">Verify &amp; Continue</span>
      <div class="em-spinner" id="em-otp-spin"></div>
      <svg id="em-otp-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
    <button class="em-btn em-btn-secondary" onclick="_backToStep1Form()">← Change Email / Resend</button>
  `;
}

async function _submitStudentOTP() {
  const otp = (document.getElementById('em-student-otp')?.value || '').trim();
  const errEl = document.getElementById('em-otp-err');
  if (errEl) errEl.classList.remove('show');

  if (!otp || otp.length < 6) {
    if (errEl) { errEl.textContent = 'Please enter the 6-digit OTP.'; errEl.classList.add('show'); }
    return;
  }

  const btn  = document.getElementById('em-verify-otp');
  const spin = document.getElementById('em-otp-spin');
  const icon = document.getElementById('em-otp-icon');
  const txt  = document.getElementById('em-otp-btn-text');
  if (btn) btn.disabled = true;
  if (spin) spin.classList.add('show');
  if (icon) icon.style.display = 'none';
  if (txt) txt.textContent = 'Verifying…';

  try {
    const res  = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'verifyStudentOTP', email: _formData.email, otp })
    });
    const json = await res.json();
    if (json.success) {
      _step = 2;
      _step1Sub = 'form'; // reset for next time
      _renderModal();
    } else {
      if (btn) btn.disabled = false;
      if (spin) spin.classList.remove('show');
      if (icon) icon.style.display = '';
      if (txt) txt.textContent = 'Verify & Continue';
      if (errEl) { errEl.textContent = json.error || 'Incorrect OTP. Please try again.'; errEl.classList.add('show'); }
    }
  } catch (err) {
    if (btn) btn.disabled = false;
    if (spin) spin.classList.remove('show');
    if (icon) icon.style.display = '';
    if (txt) txt.textContent = 'Verify & Continue';
    if (errEl) { errEl.textContent = 'Network error. Please try again.'; errEl.classList.add('show'); }
  }
}

function _backToStep1Form() {
  _step1Sub = 'form';
  _renderModal();
}

// ── STEP 2: Source + Referral ───────────────────────────────────────────────
function _buildStep2() {
  const sources = [
    'SST Official Website',
    'Shrimay Bhaiya\'s Social Pages',
    'Other SST Student Social Pages',
    'Delta Education Social Pages',
    'Other',
  ];
  const d = _formData;
  return `
    <div class="em-heading">Almost there.</div>
    <div class="em-sub">Help us understand how you found us.</div>

    <div class="em-global-error" id="em-err2"></div>

    <div class="em-field">
      <label>How did you hear about Delta Education?</label>
      <select id="em-source" onchange="_onSourceChange(this.value)">
        <option value="" disabled ${!d.source ? 'selected' : ''}>Select an option</option>
        ${sources.map(s => `<option value="${s}" ${d.source === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
      <div class="em-field-error" id="em-source-err">Please select an option.</div>
    </div>

    <div class="em-field" id="em-other-wrap" style="display:${d.source === 'Other' ? 'block' : 'none'}">
      <label>Please specify</label>
      <input type="text" id="em-other" placeholder="Tell us where you heard about us" value="${d.sourceOther || ''}"/>
    </div>

    <div class="em-referral-section">
      <div class="em-referral-label">Referral Code <span style="color:rgba(240,244,255,0.25);font-weight:500;text-transform:none;letter-spacing:0">(optional)</span></div>
      <div class="em-referral-hint">Have a referral code? Enter it below to get a special discount. If you don't have one, leave this blank.</div>
      <div class="em-field">
        <input type="text" id="em-refcode" placeholder="Enter referral code" value="${d.referralCode || ''}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"/>
      </div>
      <div class="em-code-result" id="em-code-result"></div>
    </div>

    <button class="em-btn" id="em-next2" onclick="_submitStep2()">
      <span id="em-next2-text">Continue to Payment</span>
      <div class="em-spinner" id="em-next2-spin"></div>
      <svg id="em-next2-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
    <button class="em-btn em-btn-secondary" onclick="_goBack()">← Back</button>
  `;
}

function _onSourceChange(val) {
  const wrap = document.getElementById('em-other-wrap');
  if (wrap) wrap.style.display = val === 'Other' ? 'block' : 'none';
}

async function _submitStep2() {
  const source = document.getElementById('em-source').value;
  const sourceOther = document.getElementById('em-other')?.value.trim() || '';
  const refCode = (document.getElementById('em-refcode')?.value || '').trim().toUpperCase();

  _clearError('em-source-err');
  if (!source) { _showError('em-source-err'); _markError('em-source'); return; }

  _formData.source = source;
  _formData.sourceOther = sourceOther;
  _formData.referralCode = refCode;

  // If no referral code, skip validation
  if (!refCode) {
    _referralValid = false;
    _finalPrice = _course.normalPrice;
    _step = 3;
    _renderModal();
    _renderQR();
    return;
  }

  // Validate referral code via GET (avoids GAS redirect CORS issue)
  const btn = document.getElementById('em-next2');
  const spin = document.getElementById('em-next2-spin');
  const icon = document.getElementById('em-next2-icon');
  const txt  = document.getElementById('em-next2-text');
  btn.disabled = true; spin.classList.add('show'); icon.style.display = 'none'; txt.textContent = 'Validating...';

  try {
    const url = GAS_URL + '?action=validateReferralCode&referralCode=' + encodeURIComponent(refCode);
    console.log('Validating ref code via:', url);
    const res  = await fetch(url);
    
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    
    const text = await res.text();
    console.log('GAS Response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON response from GAS: ' + text);
    }

    if (data.valid) {
      _referralValid = true;
      _formData.referrerName = data.referrerName || '';
      _finalPrice = _course.discountedPrice;
      _step = 3;
      _renderModal();
      _renderQR();
    } else {
      _referralValid = false;
      btn.disabled = false; spin.classList.remove('show'); icon.style.display = ''; txt.textContent = 'Continue to Payment';
      const result = document.getElementById('em-code-result');
      if (result) {
        result.className = 'em-code-result show invalid';
        result.innerHTML = `
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          Invalid referral code — please check and try again.
        `;
      }
    }
  } catch (err) {
    console.error('Validation Error Details:', err);
    btn.disabled = false; spin.classList.remove('show'); icon.style.display = ''; txt.textContent = 'Continue to Payment';
    const errEl = document.getElementById('em-err2');
    if (errEl) { 
      errEl.textContent = 'Could not validate the referral code. Check console for details.'; 
      errEl.classList.add('show'); 
    }
  }
}

function _goBack() {
  _step -= 1;
  if (_step === 1) _step1Sub = 'form'; // always reset OTP sub-state when going back to step 1
  _renderModal();
}

// ── STEP 3: Payment ─────────────────────────────────────────────────────────
function _buildStep3() {
  const displayPrice = _finalPrice;
  const originalPrice = _course.normalPrice;
  const hasDiscount = _referralValid && displayPrice < originalPrice;

  return `
    <div class="em-heading">Complete Your Payment</div>
    <div class="em-sub">Scan the QR below or pay via UPI ID.</div>

    <div class="em-qr-wrap">
      ${hasDiscount ? `<div class="em-qr-discount-badge">🎉 Referral applied — ₹${originalPrice - displayPrice} off!</div>` : ''}
      <div class="em-qr-canvas-wrap">
        <canvas id="em-qr-canvas" width="200" height="200"></canvas>
      </div>
      <div class="em-qr-price-badge">
        ${hasDiscount ? `<span>₹${originalPrice.toLocaleString('en-IN')}</span>` : ''}
        ₹${displayPrice.toLocaleString('en-IN')}
      </div>
      <div class="em-qr-upi">UPI ID: ${_course.upiId}</div>
    </div>

    <div class="em-payment-note">
      📲 After paying, <strong>WhatsApp your payment screenshot</strong> to
      <a href="https://wa.me/${PAYMENT_WHATSAPP.replace('+', '')}" target="_blank">${PAYMENT_WHATSAPP}</a>.
      Then fill in your transaction details below and submit.
    </div>

    <div class="em-global-error" id="em-err3"></div>

    <div class="em-field">
      <label>Transaction ID / UTR Number</label>
      <input type="text" id="em-txnid" placeholder="e.g. T2504011234567890" value="${_formData.txnId || ''}"/>
      <div class="em-field-error" id="em-txn-err">Please enter your Transaction ID / UTR number.</div>
      <div class="em-field-hint">Find this in your UPI app under payment history.</div>
    </div>

    <div class="em-field">
      <label>Amount Paid (₹)</label>
      <input type="number" id="em-amount" placeholder="${displayPrice}" value="${_formData.amountPaid || displayPrice}"/>
      <div class="em-field-error" id="em-amount-err">Please enter the amount paid.</div>
    </div>

    <button class="em-btn" id="em-submit" onclick="_submitEnrollment()">
      <span id="em-submit-text">Submit Enrollment</span>
      <div class="em-spinner" id="em-submit-spin"></div>
    </button>
    <button class="em-btn em-btn-secondary" onclick="_goBack()">← Back</button>
  `;
}

function _renderQR() {
  const canvas = document.getElementById('em-qr-canvas');
  if (!canvas) return;
  // UPI deep-link that payment apps parse
  const upiString = `upi://pay?pa=${_course.upiId}&pn=${encodeURIComponent(_course.upiName)}&am=${_finalPrice}&cu=INR`;

  // Clear previous QR
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (typeof QRious !== 'undefined') {
    new QRious({
      element: canvas,
      value: upiString,
      size: 200,
      background: '#ffffff',
      foreground: '#000000',
    });
  } else {
    // Load QRious library dynamically
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    s.onload = function() {
      new QRious({
        element: document.getElementById('em-qr-canvas'),
        value: upiString,
        size: 200,
        background: '#ffffff',
        foreground: '#000000',
      });
    };
    document.head.appendChild(s);
  }
}

async function _submitEnrollment() {
  const txnId  = document.getElementById('em-txnid').value.trim();
  const amount = document.getElementById('em-amount').value.trim();

  _clearError('em-txn-err'); _clearError('em-amount-err');
  let valid = true;
  if (!txnId)  { _showError('em-txn-err');  _markError('em-txnid');  valid = false; }
  if (!amount) { _showError('em-amount-err'); _markError('em-amount'); valid = false; }
  if (!valid) return;

  _formData.txnId      = txnId;
  _formData.amountPaid = amount;

  const btn  = document.getElementById('em-submit');
  const spin = document.getElementById('em-submit-spin');
  const txt  = document.getElementById('em-submit-text');
  btn.disabled = true; spin.classList.add('show'); txt.textContent = 'Submitting...';

  const payload = {
    action:          'submitEnrollment',
    course:          _course.key,
    courseLabel:     _course.label,
    name:            _formData.name,
    email:           _formData.email,
    phone:           _formData.phone,
    source:          _formData.source + (_formData.sourceOther ? ` — ${_formData.sourceOther}` : ''),
    referralCode:    _formData.referralCode   || '',
    referrerName:    _formData.referrerName   || '',
    txnId:           _formData.txnId,
    amountPaid:      _formData.amountPaid,
    discountApplied: _referralValid ? 'Yes' : 'No',
    finalPrice:      _finalPrice,
  };

  console.log('[Enrollment] Submitting payload:', payload);
  _gasFetch(GAS_URL, JSON.stringify(payload));

  // Show confirmation after a short delay (GAS processes in background)
  setTimeout(function() {
    _step = 4;
    _renderModal();
  }, 800);
}


/**
 * Reliable GAS POST helper.
 *
 * Why XHR instead of fetch?
 *   - fetch with CORS mode triggers an OPTIONS preflight that GAS rejects.
 *   - fetch with no-cors mode makes an opaque request — the browser still
 *     blocks following the GAS redirect, so doPost never receives the body.
 *   - XHR with Content-Type: text/plain avoids the preflight (simple request),
 *     follows the redirect transparently, and GAS reads e.postData.contents.
 *
 * Status 0 in onload = opaque cross-origin success (redirect was followed).
 */
function _gasFetch(url, jsonBody) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
  xhr.withCredentials = false;
  xhr.onload = function() {
    console.log('[Enrollment] GAS POST done. Status:', xhr.status, '| Response:', xhr.responseText);
  };
  xhr.onerror = function() {
    console.error('[Enrollment] XHR POST failed — check GAS deployment URL and access settings.');
  };
  xhr.send(jsonBody);
}




// ── STEP 4: Confirmation ────────────────────────────────────────────────────
function _buildConfirm() {
  return `
    <div class="em-confirm">
      <div class="em-confirm-icon">✓</div>
      <h3>Enrollment Submitted!</h3>
      <p>
        Thank you, <strong style="color:#fff">${_formData.name}</strong>. We've received your enrollment for
        <strong style="color:#fff">${_course.label}</strong>.
      </p>
      <p>
        Our team will verify your payment and send you access details at
        <strong style="color:#4d90ff">${_formData.email}</strong> within 24 hours.
      </p>
      <p style="font-size:0.78rem;color:rgba(240,244,255,0.3)">
        Questions? Reach us on WhatsApp at ${PAYMENT_WHATSAPP}.
      </p>
      <button class="em-btn" onclick="closeEnrollModal()">Done</button>
    </div>
  `;
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function _showError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}
function _clearError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
function _markError(inputId) {
  const el = document.getElementById(inputId);
  if (el) { el.classList.add('error'); el.addEventListener('input', () => el.classList.remove('error'), { once: true }); }
}
function _bindEvents() {
  // After render on step 3, generate QR
  if (_step === 3) {
    _renderQR();
  }
}

// ── INIT ─────────────────────────────────────────────────────────────────────
// Ensure the overlay container exists on page load
document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('em-overlay')) {
    const el = document.createElement('div');
    el.id = 'em-overlay';
    el.className = 'em-overlay';
    el.addEventListener('mousedown', (e) => {
      if (e.target === el) {
        // Modal only closes via X button — ignore overlay click
      }
    });
    document.body.appendChild(el);
  }
});
