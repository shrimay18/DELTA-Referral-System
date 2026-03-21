/** StatCard — displays a single stat metric for the dashboard */
import React from 'react';

const StatCard = ({ label, value, prefix = '', suffix = '', icon: Icon, accent = false }) => (
  <div
    className="p-6 rounded-2xl"
    style={
      accent
        ? { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)' }
        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
    }
  >
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon accent={accent} />}
      <span
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{
          color: accent ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.45)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      >
        {label}
      </span>
    </div>
    <p
      className="text-3xl font-extrabold"
      style={{ fontFamily: 'Montserrat, sans-serif', color: accent ? '#4ade80' : '#ffffff' }}
    >
      {prefix}{value}{suffix}
    </p>
  </div>
);

export default StatCard;
