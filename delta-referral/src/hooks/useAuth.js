/**
 * useAuth — Single Responsibility: read/write the session from localStorage.
 * Components never touch localStorage directly.
 */
import { useState } from 'react';

const SESSION_KEY = 'delta_session';

export const useAuth = () => {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const saveSession = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setSession(data);
  };

  const updateSession = (patch) => {
    const next = { ...session, ...patch };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return { session, saveSession, updateSession, clearSession };
};
