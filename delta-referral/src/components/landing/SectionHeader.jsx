/** SectionHeader — eyebrow + title + subtitle header for landing sections */
import React from 'react';

const SectionHeader = ({ eyebrow, title, subtitle, dark = false }) => (
  <div className="text-center max-w-2xl mx-auto">
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full"
      style={
        dark
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

export default SectionHeader;
