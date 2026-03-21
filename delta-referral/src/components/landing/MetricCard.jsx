/** MetricCard — single stat metric card for the landing metrics bar */
import React from 'react';

const MetricCard = ({ metric, label, desc, isFeatured }) => (
  <div
    className="animate-slide-up p-8 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
    style={
      isFeatured
        ? { background: '#0056d2', boxShadow: '0 8px 32px rgba(0,86,210,0.45)', border: '1px solid #0056d2' }
        : { background: '#ffffff', border: '1px solid #e8edf5', boxShadow: '0 4px 24px rgba(0,30,98,0.09)' }
    }
  >
    <div className="flex items-center gap-2 mb-4" style={{ justifyContent: 'flex-start' }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: isFeatured ? 'rgba(255,255,255,0.18)' : 'rgba(0,86,210,0.10)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isFeatured ? '#fff' : '#0056d2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
      <p className="text-[12px] text-left leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: isFeatured ? 'rgba(255,255,255,0.75)' : '#6b7a99' }}>
        {desc}
      </p>
    </div>
  </div>
);

export default MetricCard;
