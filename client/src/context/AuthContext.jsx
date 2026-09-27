import { createContext, useContext, useState } from 'react';
import { loginUser, registerUser, updateMe, deleteMe } from '../api/auth';

const AuthContext = createContext(null);

const persist = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({
    _id: data._id, name: data.name, email: data.email, avatarEmoji: data.avatarEmoji || '👤',
  }));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      persist(data);
      setUser({ _id: data._id, name: data.name, email: data.email, avatarEmoji: data.avatarEmoji || '👤' });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      persist(data);
      setUser({ _id: data._id, name: data.name, email: data.email, avatarEmoji: data.avatarEmoji || '👤' });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally { setLoading(false); }
  };

  const updateUser = async (payload) => {
    setLoading(true);
    try {
      const data = await updateMe(payload);
      const updated = { _id: data._id, name: data.name, email: data.email, avatarEmoji: data.avatarEmoji || '👤' };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    } finally { setLoading(false); }
  };

  const deleteAccount = async () => {
    setLoading(true);
    try {
      await deleteMe();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Delete failed' };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
