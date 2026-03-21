/** HowItWorks — the 3-step process section on the landing page */
import React from 'react';
import SectionHeader from './SectionHeader';

const STEPS = [
  { step: '01', title: 'Register', body: 'Submit your details. Our admin team reviews and approves your application before you go live.' },
  { step: '02', title: 'Share',    body: 'Once approved, spread the word — social media, WhatsApp, or direct conversations. You choose.' },
  { step: '03', title: 'Earn',     body: 'Earn up to 25% commission for every successful enrollment through your referral.' },
];

const HowItWorks = () => (
  <section className="relative z-10 px-6 max-w-5xl mx-auto" style={{ paddingTop: '112px', paddingBottom: '80px' }}>
    <SectionHeader
      eyebrow="Simple Process"
      title="How It Works"
      subtitle="Three easy steps to start earning with Delta Education"
      dark
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 stagger">
      {STEPS.map(({ step, title, body }) => (
        <div
          key={step}
          className="animate-slide-up p-7 rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
          style={{ background: '#ffffff', border: '1px solid #e8edf5', boxShadow: '0 4px 24px rgba(0,30,98,0.07)' }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black"
            style={{ background: 'rgba(0,86,210,0.10)', color: '#0056d2', border: '1px solid rgba(0,86,210,0.2)' }}
          >
            {step}
          </div>
          <h3 className="text-lg font-bold tracking-tight" style={{ color: '#001e62' }}>{title}</h3>
          <p className="text-[14px] leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#4a5568' }}>{body}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
