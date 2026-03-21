/** ReferralCodeBanner — displays the partner's referral code with a copy button */
import React, { useState } from 'react';

const ReferralCodeBanner = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl mb-8"
      style={{
        background: 'linear-gradient(135deg, #0056d2, #00348f)',
        boxShadow: '0 8px 32px rgba(0,86,210,0.40)',
      }}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1 text-white/60">
          Your Referral Code
        </p>
        <p
          className="text-3xl font-black tracking-widest text-white"
          style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.12em' }}
        >
          {code}
        </p>
        <p className="text-white/55 text-[12px] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Share this code with anyone interested in Delta's courses
        </p>
      </div>

      <button
        onClick={copyCode}
        className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[13px] transition-all"
        style={{
          background: copied ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff',
        }}
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Code
          </>
        )}
      </button>
    </div>
  );
};

export default ReferralCodeBanner;
