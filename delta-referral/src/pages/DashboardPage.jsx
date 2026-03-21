/**
 * DashboardPage — thin orchestrator for the partner dashboard.
 * All data-fetching and auth logic lives in useDashboard.
 */
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';

import PageBackground from '../components/shared/PageBackground';
import Navbar from '../components/shared/Navbar';
import Logo from '../components/shared/Logo';
import StatCard from '../components/dashboard/StatCard';
import ReferralCodeBanner from '../components/dashboard/ReferralCodeBanner';
import ReferralsTable from '../components/dashboard/ReferralsTable';
import PendingView from '../components/dashboard/PendingView';

/* ── Icon helpers (Open-Closed: add new icons without changing StatCard) ── */
const UserGroupIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CurrencyIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const CheckCircleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const WalletIcon      = ({ accent }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent ? '#4ade80' : '#4d90ff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/><circle cx="17" cy="15" r="1.5" fill={accent ? '#4ade80' : '#4d90ff'} stroke="none"/></svg>;

/* ── Shared raise-query + sign-out actions ── */
const NavActions = ({ onLogout }) => (
  <>
    <a
      href="https://mail.google.com/mail/?view=cm&fs=1&to=support@thedelta.co.in&su=Partner%20Portal%20Query"
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 rounded-lg text-[12px] font-bold text-white transition-all hover:brightness-110 shadow-md"
      style={{ background: '#e11d48' }}
    >
      Raise Query
    </a>
    <button
      onClick={onLogout}
      className="text-[12px] font-bold px-4 py-2 rounded-lg transition-all hover:bg-[#001e62]/10"
      style={{ color: '#001e62', border: '1px solid #e8edf5' }}
    >
      Sign Out
    </button>
  </>
);

/* ── Loading spinner ── */
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-32 gap-4">
    <svg className="animate-spin h-8 w-8 text-[#4d90ff]" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
    <p className="text-white/50 text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Loading your dashboard…</p>
  </div>
);

/* ── Fetch error screen ── */
const FetchErrorScreen = ({ onRetry }) => (
  <div className="max-w-lg mx-auto text-center py-20 px-6">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
      style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <h2 className="text-xl font-extrabold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Could not load dashboard</h2>
    <p className="text-white/50 text-[14px] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      Make sure you have deployed the updated GAS script with the <code className="text-[#4d90ff]">getDashboard</code> action.
    </p>
    <button
      onClick={onRetry}
      className="px-6 py-3 rounded-xl font-bold text-[13px] text-white transition-all hover:brightness-110"
      style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)' }}
    >
      Retry
    </button>
  </div>
);

/* ── Page wrapper ── */
const Shell = ({ children, onLogout }) => (
  <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #001e62 0%, #00183d 50%, #000f28 100%)' }}>
    <PageBackground />
    <Navbar
      leftContent={<Logo responsive />}
      desktopActions={<NavActions onLogout={onLogout} />}
      mobileMenuContent={<NavActions onLogout={onLogout} />}
    />
    <div className="relative z-10">{children}</div>
  </div>
);

/* ── Main page ── */
const DashboardPage = () => {
  const { session, data, loading, fetchError, logout, retry } = useDashboard();

  const referralCode = data?.referralCode ?? session?.referralCode ?? '—';
  const isApproved   = data?.status === 'approved';

  const stats = [
    { label: 'Total Referrals', value: data?.totalReferrals ?? 0, icon: UserGroupIcon },
    { label: 'Total Earnings',  value: data?.earnings       ?? 0, icon: CurrencyIcon,    prefix: '₹' },
    { label: 'Amount Received', value: data?.received       ?? 0, icon: CheckCircleIcon, prefix: '₹' },
    { label: 'Amount Due',      value: data?.amountDue      ?? 0, icon: WalletIcon,      prefix: '₹', accent: true },
  ];

  return (
    <Shell onLogout={logout}>
      {loading    && <LoadingSpinner />}
      {fetchError && <FetchErrorScreen onRetry={retry} />}

      {!loading && !fetchError && !isApproved && (
        <PendingView name={session?.name?.split(' ')[0]} onRefresh={retry} />
      )}

      {!loading && !fetchError && isApproved && (
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Welcome header */}
          <div className="mb-10">
            <p className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: '#4d90ff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Referral Dashboard
            </p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Welcome back, {session?.name?.split(' ')[0]}
            </h1>
          </div>

          <ReferralCodeBanner code={referralCode} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <ReferralsTable referrals={data?.recentReferrals} />
        </div>
      )}
    </Shell>
  );
};

export default DashboardPage;
