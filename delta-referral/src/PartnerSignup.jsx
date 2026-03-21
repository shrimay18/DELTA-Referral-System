import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────────
   PARTNER PAGE  —  Delta Education Referral Portal
   Font hierarchy:
     • Montserrat (headings / display)  →  set globally via h1-h6 in CSS
     • Plus Jakarta Sans (body / UI)    →  set as default body font in CSS
───────────────────────────────────────────────────────────────────────────*/

const PartnerPage = () => {
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile Menu State
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', upi: '', category: 'SST Student',
  });

  // OTP flow state
  const [otpStep, setOtpStep] = useState('form'); // 'form' | 'otp'
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Step 1 — Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch(import.meta.env.VITE_SHEET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'sendOTP', email: formData.email, name: formData.name }),
      });
      const json = await res.json();
      if (json.success) {
        setOtpStep('otp');
      } else {
        setOtpError(json.message || 'Could not send OTP. Try again.');
      }
    } catch {
      setOtpError('Server error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2 — Submit OTP + registration in one call (GAS validates OTP inside registerReferrer)
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    try {
      const res = await fetch(import.meta.env.VITE_SHEET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'registerReferrer', ...formData, otp: otpValue }),
      });
      const json = await res.json();
      if (!json.success) {
        setOtpError(json.error || json.message || 'Invalid OTP. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setOtpError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div
      className="relative text-white selection:bg-[#0056d2]/30"
      style={{ background: 'linear-gradient(160deg, #001e62 0%, #00183d 50%, #000f28 100%)' }}
    >
      {/* ── Dot-grid background ─────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Ambient glow blobs ──────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed z-0"
        style={{
          top: '-15%', left: '-10%', width: '55vw', height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,86,210,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none fixed z-0"
        style={{
          top: '40%', right: '-15%', width: '40vw', height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,52,143,0.22) 0%, transparent 70%)',
        }}
      />

      {/* ════════════════════════════════════════════════════════════════
          NAV BAR
      ════════════════════════════════════════════════════════════════ */}
      <nav
        className="relative z-[110] flex items-center justify-between px-6 md:px-14 py-4"
        style={{ background: '#ffffff', borderBottom: '1px solid #e8edf5' }}
      >
        <div className="flex items-center">
          <Link to="/">
            <div className="px-4 py-2 rounded-lg select-none" style={{ background: '#0056d2' }}>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', color: '#ffffff', lineHeight: 1, display: 'block' }}>
                DELTA<br />EDUCATION.
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold" style={{ color: '#001e62' }}>
          <a href="#courses" className="hover:text-[#0056d2] transition-colors">Courses</a>
          <button onClick={() => setShowIncentiveModal(true)} className="hover:text-[#0056d2] transition-colors">
            Incentives
          </button>
          
          <div className="flex items-center gap-4 ml-4">
            <Link 
                to="/login" 
                className="px-5 py-2.5 rounded-lg border border-[#e8edf5] hover:bg-gray-50 transition-all text-[#001e62]"
            >
                Login
            </Link>
            <button
                onClick={() => setShowSignupModal(true)}
                className="font-bold px-5 py-2.5 rounded-lg text-white transition-all hover:brightness-110 hover:-translate-y-px"
                style={{ background: '#0056d2', boxShadow: '0 4px 16px rgba(0,86,210,0.30)' }}
            >
                Join Now
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className={`w-6 h-0.5 bg-[#001e62] transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-6 h-0.5 bg-[#001e62] ${isMenuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-[#001e62] transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 flex flex-col p-6 gap-4 md:hidden shadow-xl animate-fade-in">
            <a href="#courses" onClick={() => setIsMenuOpen(false)} className="text-[15px] font-bold text-[#001e62]">Courses</a>
            <button onClick={() => { setShowIncentiveModal(true); setIsMenuOpen(false); }} className="text-left text-[15px] font-bold text-[#001e62]">Incentives</button>
            <hr className="border-gray-100" />
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-[15px] font-bold text-[#0056d2]">Partner Login</Link>
            <button
              onClick={() => { setShowSignupModal(true); setIsMenuOpen(false); }}
              className="w-full py-3 rounded-lg text-white font-bold text-center"
              style={{ background: '#0056d2' }}
            >
              Join Now
            </button>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pt-28 pb-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: 'rgba(0,86,210,0.12)', border: '1px solid rgba(0,86,210,0.35)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d90ff] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4d90ff]">
              New-Age Admissions Referral Program
            </span>
          </div>

          <h1
            className="animate-slide-up font-extrabold leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', animationDelay: '0.1s' }}
          >
            Partner With&nbsp;Us.
            <br />
            <span className="text-shimmer">Shape Tomorrow.</span>
          </h1>

          <p
            className="animate-slide-up text-white/75 leading-relaxed mx-auto mb-10"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontWeight: 500,
              maxWidth: '38rem',
              animationDelay: '0.22s',
            }}
          >
            Delta Education prepares students for new-age institutes. Join our referral network,
            share our courses, and earn meaningful commissions doing work that matters.
          </p>

          <div className="animate-slide-up flex flex-wrap justify-center gap-4" style={{ animationDelay: '0.34s' }}>
            <button
              onClick={() => setShowSignupModal(true)}
              className="group relative px-9 py-4 rounded-xl font-bold text-[14px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #0056d2, #00348f)',
                boxShadow: '0 6px 30px rgba(0,86,210,0.45)',
                letterSpacing: '0.03em',
              }}
            >
              <span className="relative z-10">Join the Referral Program →</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #1a6ee0, #0056d2)' }} />
            </button>

            <button
              onClick={() => setShowIncentiveModal(true)}
              className="px-9 py-4 rounded-xl font-bold text-[14px] transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.04)',
                letterSpacing: '0.03em',
              }}
            >
              View Incentives
            </button>
          </div>

          <p className="animate-fade-in mt-8 text-[12px] text-white/50 font-medium tracking-widest uppercase"
            style={{ animationDelay: '0.5s' }}>
            Trusted by 2,500+ learners · 48.6% selection ratio
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          METRICS BAR
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-0" style={{ marginTop: '-2px' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 stagger" style={{ transform: 'translateY(48px)' }}>
          {[
            { metric: '2,500+', label: 'Total Learners',   desc: 'Learners across all courses',              isFeatured: false },
            { metric: '48.6%',  label: 'Selection Rate',   desc: 'Proven selection rate across all courses',  isFeatured: true  },
            { metric: '4.6+',   label: 'Average Rating',   desc: 'Average rating across all courses',         isFeatured: false },
          ].map(({ metric, label, desc, isFeatured }) => (
            <MetricCard key={label} metric={metric} label={label} desc={desc} isFeatured={isFeatured} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HOW IT WORKS  (3-step process)
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto" style={{ paddingTop: '112px', paddingBottom: '80px' }}>
        <SectionHeader
          eyebrow="Simple Process"
          title="How It Works"
          subtitle="Three easy steps to start earning with Delta Education"
          dark={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 stagger">
          {[
            { step: '01', title: 'Register', body: 'Submit your details. Our admin team reviews and approves your application before you go live.' },
            { step: '02', title: 'Share',    body: 'Once approved, spread the word — social media, WhatsApp, or direct conversations. You choose.'  },
            { step: '03', title: 'Earn',     body: 'Earn up to 25% commission for every successful enrollment through your referral.'               },
          ].map(({ step, title, body }) => (
            <div key={step}
              className="animate-slide-up p-7 rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: '#ffffff',
                border: '1px solid #e8edf5',
                boxShadow: '0 4px 24px rgba(0,30,98,0.07)',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black"
                style={{ background: 'rgba(0,86,210,0.10)', color: '#0056d2', border: '1px solid rgba(0,86,210,0.2)' }}
              >
                {step}
              </div>
              <h3 className="text-lg font-bold tracking-tight" style={{ color: '#001e62' }}>{title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#4a5568' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          COURSES SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section id="courses" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Our Offerings"
          title="Courses You'll Refer"
          subtitle="Best-in-class programs designed for students targeting new-age institutes"
          dark={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 items-stretch">
          <CourseCard
            title="Elevate"
            tag="Interview Prep"
            features={[
              '3 Structured Mock Interviews',
              'Comprehensive Prep Module',
              '1:1 Personalized Mentorship',
              'Exclusive WhatsApp Community Access',
            ]}
          />
          <CourseCard
            title="Elite"
            tag="The 1-Stop Solution"
            isFeatured
            features={[
              'Everything in Achievers',
              'Chapter-wise Video Lectures',
              'Topic-wise Practice Sheets',
              'Prioritised Doubt Resolution',
            ]}
          />
          <CourseCard
            title="Achievers"
            tag="Test Series + Prep"
            features={[
              'All features of Elevate',
              '15 Mock Tests with Full Solutions',
              'Two Weekly Live Doubt-Solving',
              'Dedicated Problem-Solving Sessions',
            ]}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer
        className="relative z-10 py-10 text-center text-white/45 text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        © 2026 Delta Education. All Rights Reserved. · Made with ♥ for future leaders.
      </footer>

      {/* ════════════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════════════ */}

      {showIncentiveModal && (
        <Modal onClose={() => setShowIncentiveModal(false)}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Referral <span style={{ color: 'var(--delta-blue)' }}>Incentives</span>
            </h2>
            <p className="text-white/65 text-[13px] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Earn per successful enrollment — directly to your UPI
            </p>
          </div>

          <div className="space-y-3 mb-5">
            {[
              { course: 'Elite',     tag: 'The 1-Stop Solution', amount: '₹1,000', color: '#0056d2', featured: true },
              { course: 'Achievers', tag: 'Test Series + Prep',   amount: '₹750',   color: '#00348f'              },
              { course: 'Elevate',   tag: 'Interview Prep',       amount: '₹500',   color: '#001e62'              },
            ].map(({ course, tag, amount, color, featured }) => (
              <div
                key={course}
                className="flex items-center justify-between px-5 py-4 rounded-xl"
                style={featured
                  ? { background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.35)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }
                }
              >
                <div>
                  <p className="font-bold text-[14px] text-white">{course}</p>
                  <p className="text-[11px] uppercase tracking-widest" style={{ color: featured ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{tag}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[20px] text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{amount}</p>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: featured ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)' }}>per referral</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setShowIncentiveModal(false); setShowSignupModal(true); }}
            className="w-full py-4 rounded-xl font-bold text-[14px] tracking-wide transition-all hover:brightness-110 text-white"
            style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.4)' }}
          >
            Register as a Referrer →
          </button>
        </Modal>
      )}

      {showSignupModal && (
        <Modal onClose={() => { setShowSignupModal(false); setOtpStep('form'); setOtpError(''); }}>
          {!submitted ? (
            <>
              <div className="mb-7">
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Join the <span style={{ color: 'var(--delta-blue)' }}>Circle</span>
                </h2>
                <p className="text-white/65 text-[13px] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {otpStep === 'form' ? 'Fill your details — we\'ll send an OTP to verify your email.' : `OTP sent to ${formData.email}`}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6">
                {['Your Details', 'Verify Email'].map((label, i) => (
                  <React.Fragment key={label}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{
                          background: (i === 0 && otpStep === 'form') || (i === 1 && otpStep === 'otp') ? '#0056d2' : (i === 0 && otpStep === 'otp') ? '#22c55e' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}>
                        {i === 0 && otpStep === 'otp' ? '✓' : i + 1}
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: (i === 0 && otpStep === 'form') || (i === 1 && otpStep === 'otp') ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)' }}>{label}</span>
                    </div>
                    {i === 0 && <div className="flex-1 h-px" style={{ background: otpStep === 'otp' ? '#0056d2' : 'rgba(255,255,255,0.1)' }} />}
                  </React.Fragment>
                ))}
              </div>

              {otpError && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-[13px] font-medium"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <span>⚠</span> {otpError}
                </div>
              )}

              {otpStep === 'form' && (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">Full Name</label>
                    <input type="text" placeholder="e.g. Priya Sharma" required className="modal-input" value={formData.name} onChange={field('name')} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">Email Address</label>
                    <input type="email" placeholder="you@example.com" required className="modal-input" value={formData.email} onChange={field('email')} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">Password</label>
                    <input type="password" placeholder="Create a secure password" required className="modal-input" value={formData.password} onChange={field('password')} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 block mb-1.5">UPI ID</label>
                    <input type="text" placeholder="yourname@upi" required className="modal-input" value={formData.upi} onChange={field('upi')} />
                  </div>
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
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        Sending OTP…
                      </span>
                    ) : 'Send OTP →'}
                  </button>
                  <p className="text-center text-[11px] text-white/25 pt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>By registering, you agree to Delta's referral partner terms.</p>
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
                      onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        Verifying…
                      </span>
                    ) : 'Verify & Register →'}
                  </button>
                  <button type="button" onClick={() => { setOtpStep('form'); setOtpError(''); }} className="w-full text-[12px] font-semibold text-white/35 hover:text-white/60 transition-colors">
                    ← Change email / Resend OTP
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(0,86,210,0.15)', border: '2px solid rgba(0,86,210,0.4)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
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
                onClick={() => setShowSignupModal(false)}
                className="text-[13px] font-bold tracking-widest text-white/35 hover:text-white/70 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   SECTION HEADER HELPER
───────────────────────────────────────────────────────────────────────────*/
const SectionHeader = ({ eyebrow, title, subtitle, dark = false }) => (
  <div className="text-center max-w-2xl mx-auto">
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full"
      style={dark
        ? { color: 'var(--delta-light)', background: 'rgba(0,86,210,0.12)', border: '1px solid rgba(0,86,210,0.25)' }
        : { color: '#0056d2', background: 'rgba(0,86,210,0.08)', border: '1px solid rgba(0,86,210,0.18)' }
      }
    >
      {eyebrow}
    </span>
    <h2
      className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3"
      style={{ color: dark ? '#ffffff' : '#001e62' }}
    >
      {title}
    </h2>
    <p
      className="text-[15px] leading-relaxed"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: dark ? 'rgba(255,255,255,0.70)' : '#4a5568' }}
    >
      {subtitle}
    </p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   METRIC CARD
───────────────────────────────────────────────────────────────────────────*/
const MetricCard = ({ metric, label, desc, isFeatured }) => (
  <div
    className="animate-slide-up p-8 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
    style={isFeatured ? {
      background: '#0056d2',
      boxShadow: '0 8px 32px rgba(0,86,210,0.45)',
      border: '1px solid #0056d2',
    } : {
      background: '#ffffff',
      border: '1px solid #e8edf5',
      boxShadow: '0 4px 24px rgba(0,30,98,0.09)',
    }}
  >
    <div className="flex items-center gap-2 mb-4" style={{ justifyContent: 'flex-start' }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: isFeatured ? 'rgba(255,255,255,0.18)' : 'rgba(0,86,210,0.10)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isFeatured ? '#fff' : '#0056d2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <span
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: isFeatured ? 'rgba(255,255,255,0.7)' : '#6b7a99' }}
      >
        {label}
      </span>
    </div>
    <p
      className="font-extrabold mb-1 text-left"
      style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)', color: isFeatured ? '#ffffff' : '#001e62' }}
    >
      {metric}
    </p>
    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isFeatured ? 'rgba(255,255,255,0.2)' : '#e8edf5'}` }}>
      <p className="text-[12px] text-left leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: isFeatured ? 'rgba(255,255,255,0.75)' : '#6b7a99' }}>{desc}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   COURSE CARD
───────────────────────────────────────────────────────────────────────────*/
const CourseCard = ({ title, tag, features, isFeatured }) => (
  <div
    className={`relative p-8 rounded-2xl flex flex-col transition-all duration-300 ${isFeatured ? 'scale-[1.03] z-10' : 'hover:-translate-y-1'}`}
    style={isFeatured ? {
      background: 'linear-gradient(160deg, #0056d2, #00348f)',
      border: '1px solid #0056d2',
      boxShadow: '0 12px 48px rgba(0,86,210,0.40)',
    } : {
      background: '#ffffff',
      border: '1px solid #e8edf5',
      boxShadow: '0 4px 24px rgba(0,30,98,0.07)',
    }}
  >
    {isFeatured && (
      <div
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-black uppercase tracking-widest px-5 py-1 rounded-full text-white"
        style={{ background: '#001e62', boxShadow: '0 4px 16px rgba(0,30,98,0.4)' }}
      >
        Recommended
      </div>
    )}

    <div className="mb-7 mt-1">
      <h3
        className="text-2xl font-extrabold tracking-tight mb-1"
        style={{ fontFamily: 'Montserrat, sans-serif', color: isFeatured ? '#ffffff' : '#001e62' }}
      >
        {title}
      </h3>
      <p
        className="text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ color: isFeatured ? 'rgba(255,255,255,0.65)' : '#0056d2' }}
      >
        {tag}
      </p>
    </div>

    <ul className="space-y-3.5 flex-grow">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-3 text-[14px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500, color: isFeatured ? 'rgba(255,255,255,0.85)' : '#374151' }}>
          <span
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] mt-0.5"
            style={isFeatured
              ? { background: 'rgba(255,255,255,0.18)', color: '#ffffff' }
              : { background: 'rgba(0,86,210,0.10)', color: '#0056d2' }
            }
          >
            ✓
          </span>
          {f}
        </li>
      ))}
    </ul>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   MODAL WRAPPER
───────────────────────────────────────────────────────────────────────────*/
const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in"
    style={{ background: 'rgba(0,10,30,0.92)', backdropFilter: 'blur(12px)' }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      className="w-full max-w-md p-8 rounded-2xl relative"
      style={{
        background: 'linear-gradient(160deg, #040d1e, #020918)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,86,210,0.1)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-lg"
      >
        ×
      </button>
      {children}
    </div>
  </div>
);

export default PartnerPage;