import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { onUnauthorized, setAuthToken } from '../../api';

const STORAGE_KEY = 'museumx.auth';
const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    setAuthToken(parsed.token);
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const clear = useCallback(() => {
    setAuthToken(null);
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  }, []);

  useEffect(() => {
    onUnauthorized(clear);
  }, [clear]);

  const login = useCallback(async (email, password) => {
    const result = await api.login(email, password);
    try { localStorage.removeItem('museumx.user'); } catch {  }
    setAuthToken(result.token);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch {
    }
    setSession(result);
    return result;
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout: clear }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
