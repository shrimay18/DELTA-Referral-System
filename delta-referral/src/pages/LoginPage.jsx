/**
 * LoginPage — thin orchestrator for the login page.
 * All logic lives in useLogin; this file is only layout + JSX.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import PageBackground from '../components/shared/PageBackground';
import Logo from '../components/shared/Logo';

/* ── Styled input (focused border via inline handlers) ── */
const FormInput = ({ type, placeholder, value, onChange }) => (
  <input
    type={type}
    required
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-3 rounded-xl text-[14px] font-medium transition-all outline-none"
    style={{ background: '#f5f7fc', border: '1px solid #e0e6f0', color: '#001e62', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    onFocus={(e) => { e.target.style.border = '1.5px solid #0056d2'; e.target.style.background = '#fff'; }}
    onBlur={(e)  => { e.target.style.border = '1px solid #e0e6f0';  e.target.style.background = '#f5f7fc'; }}
  />
);

const LoginPage = () => {
  const { formData, loading, error, handleChange, handleSubmit } = useLogin();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #001e62 0%, #00183d 50%, #000f28 100%)' }}
    >
      <PageBackground />

      {/* Navbar */}
      <nav
        className="relative z-[110] flex items-center justify-between px-6 md:px-14 py-4"
        style={{ background: '#ffffff', borderBottom: '1px solid #e8edf5' }}
      >
        <div className="flex items-center">
          {/* Desktop Logo */}
          <div className="hidden md:block">
            <Logo />
          </div>
          {/* Mobile Back to Home */}
          <div className="md:hidden">
            <Link 
              to="/" 
              className="group flex items-center gap-2 text-[13px] font-bold transition-all hover:text-[#0056d2]" 
              style={{ color: '#001e62' }}
            >
              <svg 
                className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Desktop Back to Home */}
          <Link 
            to="/" 
            className="hidden md:group md:flex items-center gap-2 text-[13px] font-bold transition-all hover:text-[#0056d2]" 
            style={{ color: '#001e62' }}
          >
            <svg 
              className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <Link
            to="/"
            className="text-[13px] font-bold px-5 py-2.5 rounded-lg text-white transition-all hover:brightness-110 hover:-translate-y-px"
            style={{ background: '#0056d2', boxShadow: '0 4px 16px rgba(0,86,210,0.30)' }}
          >
            Join Now
          </Link>
        </div>
      </nav>

      {/* Login Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md p-10 rounded-2xl"
          style={{ background: '#ffffff', border: '1px solid #e8edf5', boxShadow: '0 24px 80px rgba(0,30,98,0.18), 0 4px 24px rgba(0,30,98,0.10)' }}
        >
          {/* Header */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(0,86,210,0.08)', border: '1px solid rgba(0,86,210,0.2)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0056d2] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0056d2]">Partner Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#001e62' }}>
              Welcome Back
            </h1>
            <p className="text-[14px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#6b7a99' }}>
              Sign in to view your referral dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-5 text-[13px] font-medium"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#6b7a99' }}>Email Address</label>
              <FormInput type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange('email')} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#6b7a99' }}>Password</label>
              <FormInput type="password" placeholder="Your password" value={formData.password} onChange={handleChange('password')} />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-[14px] tracking-wide mt-2 transition-all hover:brightness-110 disabled:opacity-60 text-white"
              style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.4)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-[12px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#9aa5bc' }}>
            Not registered yet?{' '}
            <Link to="/" className="text-[#0056d2] font-semibold hover:underline">Join the Referral Program</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
