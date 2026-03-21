/**
 * SignupModal — multi-step signup form (form → OTP → success).
 * Receives all state and handlers from the useSignup hook via props (Dependency Inversion).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Modal from '../shared/Modal';

/* ── Shared styled input ── */
const ModalInput = (props) => (
  <input
    {...props}
    className={`modal-input ${props.className ?? ''}`}
  />
);

/* ── Step indicator ── */
const StepIndicator = ({ otpStep }) => (
  <div className="flex items-center gap-3 mb-6">
    {['Your Details', 'Verify Email'].map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
            style={{
              background:
                (i === 0 && otpStep === 'form') || (i === 1 && otpStep === 'otp')
                  ? '#0056d2'
                  : i === 0 && otpStep === 'otp'
                  ? '#22c55e'
                  : 'rgba(255,255,255,0.1)',
              color: '#fff',
            }}
          >
            {i === 0 && otpStep === 'otp' ? '✓' : i + 1}
          </div>
          <span
            className="text-[11px] font-semibold"
            style={{
              color:
                (i === 0 && otpStep === 'form') || (i === 1 && otpStep === 'otp')
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.4)',
            }}
          >
            {label}
          </span>
        </div>
        {i === 0 && (
          <div
            className="flex-1 h-px"
            style={{ background: otpStep === 'otp' ? '#0056d2' : 'rgba(255,255,255,0.1)' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ── Success screen ── */
const SuccessScreen = ({ onClose }) => (
  <div className="text-center py-8">
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
      style={{ background: 'rgba(0,86,210,0.15)', border: '2px solid rgba(0,86,210,0.4)' }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-white">Application Submitted!</h2>
    <p className="text-white/70 text-[14px] leading-relaxed mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      Our admin team will review your request. Log in to track your approval status and access your dashboard once approved.
    </p>
    <Link
      to="/login"
      className="block w-full py-4 rounded-xl font-bold text-[14px] tracking-wide text-center text-white transition-all hover:brightness-110 mb-3"
      style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.4)' }}
    >
      Go to Login
    </Link>
    <button
      onClick={onClose}
      className="text-[13px] font-bold tracking-widest text-white/35 hover:text-white/70 transition-colors"
    >
      Close
    </button>
  </div>
);

/* ── Main component ── */
const SignupModal = ({ onClose, signup }) => {
  const {
    formData, field,
    otpStep, otpValue, setOtpValue,
    otpLoading, loading, otpError,
    submitted,
    handleSendOtp, handleVerifyAndRegister, resetOtp,
  } = signup;

  const handleClose = () => { onClose(); resetOtp(); };

  return (
    <Modal onClose={handleClose}>
      {!submitted ? (
        <>
          <div className="mb-7">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Join the <span style={{ color: 'var(--delta-blue)' }}>Circle</span>
            </h2>
            <p className="text-white/65 text-[13px] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {otpStep === 'form'
                ? "Fill your details — we'll send an OTP to verify your email."
                : `OTP sent to ${formData.email}`}
            </p>
          </div>

          <StepIndicator otpStep={otpStep} />

          {otpError && (
            <div
              className="flex flex-col gap-3 p-4 rounded-xl mb-6 text-[13px] font-medium"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <div className="flex items-center gap-2">
                <span>⚠</span>
                {otpError === 'already_exists' 
                  ? 'You already have an account with this email.' 
                  : otpError}
              </div>
              
              {otpError === 'already_exists' && (
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-lg text-center font-bold text-white transition-all bg-white/10 hover:bg-white/15"
                  onClick={onClose}
                >
                  Go to Login
                </Link>
              )}
            </div>
          )}

          {otpStep === 'form' && (
            <form onSubmit={handleSendOtp} className="space-y-3">
              {[
                { label: 'Full Name',      key: 'name',     type: 'text',     placeholder: 'e.g. Priya Sharma' },
                { label: 'Email Address',  key: 'email',    type: 'email',    placeholder: 'you@example.com' },
                { label: 'Password',       key: 'password', type: 'password', placeholder: 'Create a secure password' },
                { label: 'UPI ID',         key: 'upi',      type: 'text',     placeholder: 'yourname@upi' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">{label}</label>
                  <ModalInput type={type} placeholder={placeholder} required value={formData[key]} onChange={field(key)} />
                </div>
              ))}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">Your Category</label>
                <select className="modal-input" value={formData.category} onChange={field('category')}>
                  <option value="SST Student">SST Student</option>
                  <option value="Aspiring SST Aspirant">Aspiring SST Aspirant</option>
                  <option value="Delta Student">Delta Student</option>
                </select>
              </div>
              <button
                type="submit" disabled={otpLoading}
                className="w-full py-4 rounded-xl font-bold text-[14px] tracking-wide mt-2 transition-all hover:brightness-110 disabled:opacity-60 text-white"
                style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.4)' }}
              >
                {otpLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending OTP…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send OTP
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </span>
                )}
              </button>
              <p className="text-center text-[11px] text-white/25 pt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                By registering, you agree to Delta's referral partner terms.
              </p>
            </form>
          )}

          {otpStep === 'otp' && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">6-Digit OTP</label>
                <input
                  type="text" inputMode="numeric" placeholder="_ _ _ _ _ _" required maxLength={6}
                  className="modal-input text-center text-xl tracking-[0.4em] font-bold"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Check your inbox at <span className="text-[#4d90ff]">{formData.email}</span>
                </p>
              </div>
              <button
                type="submit" disabled={loading || otpValue.length < 6}
                className="w-full py-4 rounded-xl font-bold text-[14px] tracking-wide transition-all hover:brightness-110 disabled:opacity-60 text-white"
                style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.4)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Verify & Register
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </span>
                )}
              </button>
              <button
                type="button" onClick={resetOtp}
                className="w-full text-[12px] font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Change email / Resend OTP
              </button>
            </form>
          )}
        </>
      ) : (
        <SuccessScreen onClose={handleClose} />
      )}
    </Modal>
  );
};

export default SignupModal;
