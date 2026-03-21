/** StatusBadge — small coloured pill for referral status */
import React from 'react';

const STATUS_STYLES = {
  Enrolled: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',   text: '#4ade80' },
  Pending:  { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
  Referred: { bg: 'rgba(0,86,210,0.12)',   border: 'rgba(0,86,210,0.3)',   text: '#4d90ff' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Referred;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
