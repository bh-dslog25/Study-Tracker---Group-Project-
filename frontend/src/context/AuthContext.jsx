import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const savedUser = localStorage.getItem('user_info');
          if (savedUser) setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Không thể khôi phục phiên đăng nhập:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await authService.register(name, email, password, role);
    setUser(data.user);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('user_info');
  };

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Custom hook để xài nhanh gọn ở các file khác
export const useAuth = () => useContext(AuthContext);