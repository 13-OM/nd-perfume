import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const d = await api.post('/auth/login', { email, password });
      setToken(d.token);
      setUser(d.user);
      toast(`Welcome back, ${d.user.fullName.split(' ')[0]}!`);
      return d.user;
    },
    [toast]
  );

  const register = useCallback(
    async (payload) => {
      const d = await api.post('/auth/register', payload);
      setToken(d.token);
      setUser(d.user);
      toast(`Welcome to ND Perfume, ${d.user.fullName.split(' ')[0]}!`);
      return d.user;
    },
    [toast]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    toast('You have been logged out.');
  }, [toast]);

  const refreshUser = useCallback(async () => {
    try {
      const d = await api.get('/auth/me');
      setUser(d.user);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
