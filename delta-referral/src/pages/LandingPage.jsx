/**
 * LandingPage — thin orchestrator for the landing page.
 * Composes sections and modals; no business logic here.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignup } from '../hooks/useSignup';

import PageBackground from '../components/shared/PageBackground';
import Logo from '../components/shared/Logo';
import HeroSection from '../components/landing/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import MetricCard from '../components/landing/MetricCard';
import CourseCard from '../components/landing/CourseCard';
import SectionHeader from '../components/landing/SectionHeader';
import IncentiveModal from '../components/landing/IncentiveModal';
import SignupModal from '../components/landing/SignupModal';

const METRICS = [
  { metric: '2,500+', label: 'Total Learners', desc: 'Learners across all courses',             isFeatured: false },
  { metric: '48.6%',  label: 'Selection Rate', desc: 'Proven selection rate across all courses', isFeatured: true  },
  { metric: '4.6+',   label: 'Average Rating', desc: 'Average rating across all courses',        isFeatured: false },
];

const COURSES = [
  { title: 'Elevate',  tag: 'Interview Prep',       features: ['3 Structured Mock Interviews', 'Comprehensive Prep Module', '1:1 Personalized Mentorship', 'Exclusive WhatsApp Community Access'] },
  { title: 'Elite',    tag: 'The 1-Stop Solution',  features: ['Everything in Achievers', 'Chapter-wise Video Lectures', 'Topic-wise Practice Sheets', 'Prioritised Doubt Resolution'], isFeatured: true },
  { title: 'Achievers',tag: 'Test Series + Prep',   features: ['All features of Elevate', '15 Mock Tests with Full Solutions', 'Two Weekly Live Doubt-Solving', 'Dedicated Problem-Solving Sessions'] },
];

const LandingPage = () => {
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [showSignupModal,    setShowSignupModal]    = useState(false);
  const [isMenuOpen,         setIsMenuOpen]         = useState(false);
  const signup = useSignup();

  const openSignup    = () => { setShowIncentiveModal(false); setShowSignupModal(true); };
  const closeSignup   = () => { setShowSignupModal(false); signup.resetOtp(); };

  return (
    <div
      className="relative text-white selection:bg-[#0056d2]/30"
      style={{ background: 'linear-gradient(160deg, #001e62 0%, #00183d 50%, #000f28 100%)' }}
    >
      <PageBackground />

      {/* Extra glow for landing */}
      <div
        className="pointer-events-none fixed z-0"
        style={{ top: '40%', right: '-15%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,52,143,0.22) 0%, transparent 70%)' }}
      />

      {/* ── Navbar ── */}
      <nav
        className="relative z-[110] flex items-center justify-between px-6 md:px-14 py-4"
        style={{ background: '#ffffff', borderBottom: '1px solid #e8edf5' }}
      >
        <Logo />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold" style={{ color: '#001e62' }}>
          <a href="#courses" className="hover:text-[#0056d2] transition-colors">Courses</a>
          <button onClick={() => setShowIncentiveModal(true)} className="hover:text-[#0056d2] transition-colors">Incentives</button>
          <div className="flex items-center gap-4 ml-4">
            <Link to="/login" className="px-5 py-2.5 rounded-lg border border-[#e8edf5] hover:bg-gray-50 transition-all text-[#001e62]">Login</Link>
            <button
              onClick={openSignup}
              className="font-bold px-5 py-2.5 rounded-lg text-white transition-all hover:brightness-110 hover:-translate-y-px"
              style={{ background: '#0056d2', boxShadow: '0 4px 16px rgba(0,86,210,0.30)' }}
            >
              Join Now
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`w-6 h-0.5 bg-[#001e62] transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-6 h-0.5 bg-[#001e62] ${isMenuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-[#001e62] transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 flex flex-col p-6 gap-4 md:hidden shadow-xl animate-fade-in">
            <a href="#courses" onClick={() => setIsMenuOpen(false)} className="text-[15px] font-bold text-[#001e62]">Courses</a>
            <button onClick={() => { setShowIncentiveModal(true); setIsMenuOpen(false); }} className="text-left text-[15px] font-bold text-[#001e62]">Incentives</button>
            <hr className="border-gray-100" />
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-[15px] font-bold text-[#0056d2]">Partner Login</Link>
            <button
              onClick={() => { openSignup(); setIsMenuOpen(false); }}
              className="w-full py-3 rounded-lg text-white font-bold text-center"
              style={{ background: '#0056d2' }}
            >
              Join Now
            </button>
          </div>
        )}
      </nav>

      {/* ── Page Sections ── */}
      <HeroSection onJoinClick={openSignup} onIncentiveClick={() => setShowIncentiveModal(true)} />

      <section className="relative z-10 px-6 pb-0" style={{ marginTop: '-2px' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 stagger" style={{ transform: 'translateY(48px)' }}>
          {METRICS.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>
      </section>

      <HowItWorks />

      <section id="courses" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <SectionHeader eyebrow="Our Offerings" title="Courses You'll Refer" subtitle="Best-in-class programs designed for students targeting new-age institutes" dark />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 items-stretch">
          {COURSES.map((c) => <CourseCard key={c.title} {...c} />)}
        </div>
      </section>

      <footer
        className="relative z-10 py-10 text-center text-white/45 text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        © 2026 Delta Education. All Rights Reserved. · Made with ♥ for future leaders.
      </footer>

      {/* ── Modals ── */}
      {showIncentiveModal && <IncentiveModal onClose={() => setShowIncentiveModal(false)} onRegisterClick={openSignup} />}
      {showSignupModal    && <SignupModal onClose={closeSignup} signup={signup} />}
    </div>
  );
};

export default LandingPage;
