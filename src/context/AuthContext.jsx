'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const decodeTokenSafely = (tokenStr) => {
  try {
    if (!tokenStr || typeof tokenStr !== 'string') return null;
    const parts = tokenStr.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    // Check if expired (exp is in seconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
};

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAdmin: false,
  isParticipant: false,
  login: async () => {},
  registerParticipant: async () => {},
  logout: () => {},
  refreshUser: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fast synchronous initial check from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('carrom_token');
      const storedUser = localStorage.getItem('carrom_user');

      if (storedToken) {
        const decoded = decodeTokenSafely(storedToken);
        if (!decoded) {
          // Token is invalid or expired
          localStorage.removeItem('carrom_token');
          localStorage.removeItem('carrom_user');
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        let parsedUser = null;
        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
          } catch (e) {}
        }

        if (!parsedUser && decoded) {
          parsedUser = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            fullName: decoded.role === 'admin' ? 'Tournament Director' : 'Athlete'
          };
        }

        if (parsedUser) {
          setUser(parsedUser);
          setToken(storedToken);
          setLoading(false); // Instantly unblock page!
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }

    // Silent background verification without blocking page rendering
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('carrom_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const decoded = decodeTokenSafely(storedToken);
      if (!decoded) {
        localStorage.removeItem('carrom_token');
        localStorage.removeItem('carrom_user');
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      setToken(storedToken);
      const res = await api.getMe();
      if (res && res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('carrom_user', JSON.stringify(res.user));
      }
    } catch (err) {
      // Only clear session if explicitly unauthorized (401)
      if (err.status === 401) {
        console.warn('Session expired (401), clearing token');
        localStorage.removeItem('carrom_token');
        localStorage.removeItem('carrom_user');
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('carrom_token', res.token);
      if (res.user) {
        localStorage.setItem('carrom_user', JSON.stringify(res.user));
      }
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const registerParticipant = async (formData) => {
    const res = await api.registerParticipant(formData);
    if (res.success && res.token) {
      localStorage.setItem('carrom_token', res.token);
      if (res.user) {
        localStorage.setItem('carrom_user', JSON.stringify(res.user));
      }
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('carrom_token');
    localStorage.removeItem('carrom_user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const isAdmin = user?.role === 'admin';
  const isParticipant = user?.role === 'participant';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isParticipant,
        login,
        registerParticipant,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
