/** HeroSection — landing page hero with CTAs */
import React from 'react';

const HeroSection = ({ onJoinClick, onIncentiveClick }) => (
  <section className="relative z-10 px-6 pt-28 pb-24 text-center">
    <div className="max-w-4xl mx-auto">
      <div
        className="animate-fade-in hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
        style={{ background: 'rgba(0,86,210,0.12)', border: '1px solid rgba(0,86,210,0.35)' }}
      >
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
          onClick={onJoinClick}
          className="group relative px-9 py-4 rounded-xl font-bold text-[14px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #0056d2, #00348f)',
            boxShadow: '0 6px 30px rgba(0,86,210,0.45)',
            letterSpacing: '0.03em',
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Join the Referral Program
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, #1a6ee0, #0056d2)' }}
          />
        </button>

        <button
          onClick={onIncentiveClick}
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

      <p
        className="animate-fade-in mt-8 text-[12px] text-white/50 font-medium tracking-widest uppercase"
        style={{ animationDelay: '0.5s' }}
      >
        Trusted by 2,500+ learners · 48.6% selection ratio
      </p>
    </div>
  </section>
);

export default HeroSection;
