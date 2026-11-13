import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api/endpoints';
import { setAuthToken } from '../api/client';

const USER_STORAGE_KEY = 'museumx.user';
const UserAuthContext = createContext(null);

function readUserSession() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function UserAuthProvider({ children }) {
  const [userSession, setUserSession] = useState(readUserSession);

  useEffect(() => {
    try {
      const adminRaw = localStorage.getItem('museumx.auth');
      const adminSession = adminRaw ? JSON.parse(adminRaw) : null;
      if (!adminSession?.token && userSession?.token) {
        setAuthToken(userSession.token);
      }
    } catch {
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await api.userLogin(email, password);
    setAuthToken(result.token);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result));
    } catch {
    }
    setUserSession(result);
    return result;
  }, []);

  const register = useCallback(async (payload) => {
    const result = await api.userRegister(payload);
    setAuthToken(result.token);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result));
    } catch {
    }
    setUserSession(result);
    return result;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUserSession(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
    }
  }, []);

  return (
    <UserAuthContext.Provider value={{ userSession, login, register, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error('useUserAuth must be used inside UserAuthProvider');
  return context;
}

