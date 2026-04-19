import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('petzee_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('petzee_token');
    if (!token) { setLoading(false); return; }

    authAPI.me()
      .then(({ data }) => { setUser(data.data); updateStorage(data.data, token); })
      .catch(() => { clearStorage(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const { user: u, token } = data.data;
    setUser(u);
    updateStorage(u, token);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authAPI.register(payload);
    const { user: u, token } = data.data;
    setUser(u);
    updateStorage(u, token);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('petzee_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// Helpers
const updateStorage = (user, token) => {
  localStorage.setItem('petzee_user', JSON.stringify(user));
  localStorage.setItem('petzee_token', token);
};
const clearStorage = () => {
  localStorage.removeItem('petzee_user');
  localStorage.removeItem('petzee_token');
};
