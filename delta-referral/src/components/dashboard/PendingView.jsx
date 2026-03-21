/** PendingView — shown when the partner's application is under review */
import React from 'react';

const PendingView = ({ name, onRefresh }) => (
  <div className="max-w-lg mx-auto text-center py-20 px-6">
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
      style={{ background: 'rgba(0,86,210,0.12)', border: '1px solid rgba(0,86,210,0.3)' }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    </div>

    <h2
      className="text-2xl font-extrabold text-white mb-3 tracking-tight"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      Application Under Review
    </h2>
    <p
      className="text-[15px] leading-relaxed mb-8"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'rgba(255,255,255,0.60)' }}
    >
      Hi {name}! Your referral partner application is being reviewed by our admin team.
      Once approved, you'll gain full access to your dashboard, referral code, and earnings.
    </p>

    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
      style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.3)' }}
    >
      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
      <span className="text-[12px] font-bold uppercase tracking-widest text-yellow-300">
        Pending Approval
      </span>
    </div>

    <p className="text-[13px] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'rgba(255,255,255,0.30)' }}>
      Refresh this page to check for updates. We'll also reach out via email.
    </p>

    <button
      onClick={onRefresh}
      className="px-6 py-3 rounded-xl font-bold text-[13px] text-white transition-all hover:brightness-110"
      style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.35)' }}
    >
      Check Status
    </button>
  </div>
);

export default PendingView;
