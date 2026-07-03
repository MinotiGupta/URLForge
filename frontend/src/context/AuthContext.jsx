import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('uf_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('uf_token', data.access_token);
    const { data: me } = await authApi.me();
    localStorage.setItem('uf_user', JSON.stringify(me));
    setUser(me);
    return me;
  };

  const signup = async (email, password) => {
    await authApi.signup({ email, password });
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('uf_token');
    localStorage.removeItem('uf_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
