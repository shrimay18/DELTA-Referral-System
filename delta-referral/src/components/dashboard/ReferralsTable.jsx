/** ReferralsTable — table of recent referrals */
import React from 'react';
import StatusBadge from './StatusBadge';

const ReferralsTable = ({ referrals }) => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <h3 className="text-[15px] font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        Recent Referrals
      </h3>
    </div>

    {!referrals?.length ? (
      <div className="py-14 text-center">
        <p className="text-white/35 text-[14px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          No referrals yet. Start sharing your code!
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Student', 'Course', 'Status', 'Date', 'Amount'].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr
                key={i}
                className="transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td className="px-6 py-4 font-semibold text-white">{r.name}</td>
                <td className="px-6 py-4 text-white/70">{r.course}</td>
                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-4 text-white/50">{r.date}</td>
                <td className="px-6 py-4 font-semibold" style={{ color: '#4d90ff' }}>
                  {r.amount ? `₹${r.amount}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default ReferralsTable;
