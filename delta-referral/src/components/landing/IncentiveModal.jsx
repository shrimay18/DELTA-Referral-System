/** IncentiveModal — displays partnership incentive amounts per course */
import React from 'react';
import Modal from '../shared/Modal';

const INCENTIVES = [
  { course: 'Elite',     tag: 'The 1-Stop Solution', amount: '₹1,500', featured: true },
  { course: 'Achievers', tag: 'Test Series + Prep',   amount: '₹1,000' },
  { course: 'Elevate',   tag: 'Interview Prep',       amount: '₹500' },
];

const IncentiveModal = ({ onClose, onRegisterClick }) => (
  <Modal onClose={onClose}>
    <div className="text-center mb-6">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight">
        Referral <span style={{ color: 'var(--delta-blue)' }}>Incentives</span>
      </h2>
      <p className="text-white/65 text-[13px] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        Earn per successful enrollment — directly to your UPI
      </p>
    </div>

    <div className="space-y-3 mb-5">
      {INCENTIVES.map(({ course, tag, amount, featured }) => (
        <div
          key={course}
          className="flex items-center justify-between px-5 py-4 rounded-xl"
          style={
            featured
              ? { background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.35)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }
          }
        >
          <div>
            <p className="font-bold text-[14px] text-white">{course}</p>
            <p
              className="text-[11px] uppercase tracking-widest"
              style={{ color: featured ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {tag}
            </p>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-[20px] text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{amount}</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: featured ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)' }}>
              per referral
            </p>
          </div>
        </div>
      ))}
    </div>

    <button
      onClick={onRegisterClick}
      className="w-full py-4 rounded-xl font-bold text-[14px] tracking-wide transition-all hover:brightness-110 text-white"
      style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.4)' }}
    >
      <span className="flex items-center justify-center gap-2">
        Register as a Referrer
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </span>
    </button>
  </Modal>
);

export default IncentiveModal;
