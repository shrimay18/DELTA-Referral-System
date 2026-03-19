import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────────
   DASHBOARD  —  Delta Education Referral Partner Dashboard
───────────────────────────────────────────────────────────────────────────*/
const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession]     = useState(null);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [copied, setCopied]       = useState(false);

  /* ── Auth guard ── */
  useEffect(() => {
    const raw = localStorage.getItem('delta_session');
    if (!raw) { navigate('/login'); return; }
    const s = JSON.parse(raw);
    setSession(s);
    fetchDashboard(s.email, s.referralCode);
  }, []);

  const fetchDashboard = async (email, referralCode) => {
    setFetchError(false);
    setLoading(true);
    try {
      const res  = await fetch(import.meta.env.VITE_SHEET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        // GAS looks up by referralCode (column D), not email
        body: JSON.stringify({ action: 'getDashboard', referralCode }),
      });
      const json = await res.json();

      if (json.success) {
        // Normalize GAS field names to what the UI expects
        const normalized = {
          ...json,
          earnings:        json.totalEarned    ?? 0,
          amountDue:       json.amountDue      ?? 0,
          recentReferrals: (json.history || []).map(r => ({
            name:   r.studentName,
            course: r.course,
            status: r.status,
            date:   r.date,
            amount: r.amount,
          })),
          referralCode,
        };
        setData(normalized);
        // Update cached session with fresh status
        const raw = localStorage.getItem('delta_session');
        if (raw) {
          const s = JSON.parse(raw);
          s.status = json.status;
          localStorage.setItem('delta_session', JSON.stringify(s));
          setSession(prev => ({ ...prev, status: json.status }));
        }
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('delta_session');
    navigate('/login');
  };

  const copyCode = () => {
    const code = data?.referralCode || session?.referralCode || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <PageShell onLogout={logout} session={session} liveStatus={null}>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <svg className="animate-spin h-8 w-8 text-[#4d90ff]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-white/50 text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Loading your dashboard…
          </p>
        </div>
      </PageShell>
    );
  }

  /* ── Fetch error ── */
  if (fetchError) {
    return (
      <PageShell onLogout={logout} session={session} liveStatus={null}>
        <div className="max-w-lg mx-auto text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Could not load dashboard
          </h2>
          <p className="text-white/50 text-[14px] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Make sure you have deployed the updated GAS script with the <code className="text-[#4d90ff]">getDashboard</code> action.
          </p>
          <button
            onClick={() => fetchDashboard(session?.email, session?.referralCode)}
            className="px-6 py-3 rounded-xl font-bold text-[13px] text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)' }}
          >
            Retry
          </button>
        </div>
      </PageShell>
    );
  }

  /* ── Status comes ONLY from live GAS response ── */
  const status       = data?.status;          // 'approved' | 'pending' — lowercase from GAS
  const referralCode = data?.referralCode || session?.referralCode || '—';

  /* ── PENDING STATE ── */
  if (status !== 'approved') {
    return (
      <PageShell onLogout={logout} session={session} liveStatus={status}>
        <div className="max-w-lg mx-auto text-center py-20 px-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(0,86,210,0.12)', border: '1px solid rgba(0,86,210,0.3)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
            Hi {session?.name?.split(' ')[0]}! Your referral partner application is being reviewed by our admin team.
            Once approved, you'll gain full access to your dashboard, referral code, and earnings.
          </p>

          {/* Status pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-yellow-300">
              Pending Approval
            </span>
          </div>

          <p className="text-[13px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'rgba(255,255,255,0.30)' }}>
            Refresh this page to check for updates. We'll also reach out via email.
          </p>

          <button
            onClick={() => { fetchDashboard(session.email, session.referralCode); }}
            className="mt-6 px-6 py-3 rounded-xl font-bold text-[13px] text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 4px 20px rgba(0,86,210,0.35)' }}
          >
            Check Status
          </button>
        </div>
      </PageShell>
    );
  }

  /* ── APPROVED DASHBOARD ── */
  const stats = [
    { label: 'Total Referrals', value: data?.totalReferrals ?? 0,  icon: UserGroupIcon, suffix: '',  prefix: ''  },
    { label: 'Total Earnings',  value: data?.earnings       ?? 0,  icon: CurrencyIcon,  suffix: '',  prefix: '₹' },
    { label: 'Amount Due',      value: data?.amountDue      ?? 0,  icon: WalletIcon,    suffix: '',  prefix: '₹',  accent: true },
  ];

  return (
    <PageShell onLogout={logout} session={session} liveStatus={status}>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Welcome header */}
        <div className="mb-10">
          <p className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: '#4d90ff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Referral Dashboard
          </p>
          <h1
            className="text-3xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Welcome back, {session?.name?.split(' ')[0]}
          </h1>
        </div>

        {/* Referral Code Banner */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl mb-8"
          style={{ background: 'linear-gradient(135deg, #0056d2, #00348f)', boxShadow: '0 8px 32px rgba(0,86,210,0.40)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1 text-white/60">Your Referral Code</p>
            <p
              className="text-3xl font-black tracking-widest text-white"
              style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.12em' }}
            >
              {referralCode}
            </p>
            <p className="text-white/55 text-[12px] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Share this code with anyone interested in Delta's courses
            </p>
          </div>
          <button
            onClick={copyCode}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[13px] transition-all"
            style={{ background: copied ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
          >
            {copied ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Code</>
            )}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {stats.map(({ label, value, icon: Icon, prefix = '', suffix, accent }) => (
            <div
              key={label}
              className="p-6 rounded-2xl"
              style={accent
                ? { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon accent={accent} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.45)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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
          ))}
        </div>

        {/* Recent Referrals table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h3 className="text-[15px] font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Recent Referrals
            </h3>
          </div>

          {(!data?.recentReferrals || data?.recentReferrals?.length === 0) ? (
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
                    {['Student', 'Course', 'Status', 'Date', 'Amount'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentReferrals.map((r, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-6 py-4 font-semibold text-white">{r.name}</td>
                      <td className="px-6 py-4 text-white/70">{r.course}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
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
      </div>
    </PageShell>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   PAGE SHELL (shared nav + dark bg)
───────────────────────────────────────────────────────────────────────────*/
const PageShell = ({ children, onLogout, session, liveStatus }) => (
  <div
    className="min-h-screen relative"
    style={{ background: 'linear-gradient(160deg, #001e62 0%, #00183d 50%, #000f28 100%)' }}
  >
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
      style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
    />
    <div className="pointer-events-none fixed z-0" style={{
      top: '-15%', left: '-10%', width: '55vw', height: '55vw',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(0,86,210,0.18) 0%, transparent 70%)',
    }} />

    {/* White navbar */}
    <nav
      className="relative z-10 flex items-center justify-between px-6 md:px-14 py-4"
      style={{ background: '#ffffff', borderBottom: '1px solid #e8edf5' }}
    >
      <div className="hidden md:block">
        <Link to="/">
          <div className="px-4 py-2 rounded-lg select-none" style={{ background: '#0056d2' }}>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '13px', letterSpacing: '0.06em', color: '#ffffff', lineHeight: 1, display: 'block' }}>
              DELTA<br />EDUCATION.
            </span>
          </div>
        </Link>
      </div>

      {/* Active Partner pill — only shown when GAS confirms approved */}
      {liveStatus === 'approved' && (
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#22c55e' }}>Active Partner</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <span className="text-[13px] font-semibold hidden sm:block" style={{ color: '#001e62' }}>
          {session?.name}
        </span>
        <button
          onClick={onLogout}
          className="text-[13px] font-bold px-4 py-2 rounded-lg transition-all hover:bg-[#001e62]/10"
          style={{ color: '#001e62', border: '1px solid #e8edf5' }}
        >
          Sign Out
        </button>
      </div>
    </nav>

    <div className="relative z-10">{children}</div>
  </div>
);


/* ─────────────────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────────────────────*/
const StatusBadge = ({ status }) => {
  const map = {
    Enrolled:  { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80' },
    Pending:   { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
    Referred:  { bg: 'rgba(0,86,210,0.12)',   border: 'rgba(0,86,210,0.3)',   text: '#4d90ff' },
  };
  const style = map[status] || map.Referred;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
    >
      {status}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   ICON HELPERS
───────────────────────────────────────────────────────────────────────────*/
const UserGroupIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CurrencyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d90ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const WalletIcon = ({ accent }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent ? '#4ade80' : '#4d90ff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/>
    <path d="M1 10h22"/>
    <circle cx="17" cy="15" r="1.5" fill={accent ? '#4ade80' : '#4d90ff'} stroke="none"/>
  </svg>
);

export default Dashboard;
