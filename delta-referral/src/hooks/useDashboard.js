/**
 * useDashboard — Single Responsibility: fetch + normalise dashboard data.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetDashboard } from '../services/api';
import { useAuth } from './useAuth';

export const useDashboard = () => {
  const navigate = useNavigate();
  const { session, updateSession, clearSession } = useAuth();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchDashboard = async (referralCode) => {
    setFetchError(false);
    setLoading(true);
    try {
      const json = await apiGetDashboard(referralCode);
      if (json.success) {
        setData({
          ...json,
          earnings:        json.totalEarned  ?? 0,
          received:        json.totalPaid    ?? 0,
          amountDue:       json.amountDue    ?? 0,
          referralCode,
          recentReferrals: (json.history || []).map((r) => ({
            name:   r.studentName,
            course: r.course,
            status: r.status,
            date:   r.date,
            amount: r.amount,
          })),
        });
        updateSession({ status: json.status });
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  /* Auth guard + initial fetch */
  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    fetchDashboard(session.referralCode);
  }, []);

  const logout = () => { clearSession(); navigate('/login'); };
  const retry  = () => session && fetchDashboard(session.referralCode);

  return { session, data, loading, fetchError, logout, retry };
};
