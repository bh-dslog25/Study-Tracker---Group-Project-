import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminVerified, setAdminVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin/Teacher Login
  const adminLogin = async (email, password) => {
    try {
      console.log('=== ADMIN LOGIN ===');
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const responseData = response.data.data || response.data;

      if (responseData && responseData.user) {
        if (responseData.user.role !== 'teacher') {
          return {
            success: false,
            message: 'This account is not a teacher account. Please use a teacher account to access admin.'
          };
        }
        
        const { user, accessToken, refreshToken } = responseData;

        // Xóa dữ liệu cũ trước khi lưu (tránh lưu lẫn lộn giữa các tài khoản)
        localStorage.removeItem('user_info');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('admin_info');
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_verified');

        setAdmin(user);
        localStorage.setItem('admin_info', JSON.stringify(user));
        if (accessToken) localStorage.setItem('admin_access_token', accessToken);
        if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken);

        return { success: true };
      }

      return {
        success: false,
        message: responseData?.message || 'Login failed: Invalid response from server'
      };
    } catch (error) {
      console.error('=== ADMIN LOGIN ERROR ===');
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Incorrect email or password';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if backend is running on http://localhost:5000';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Admin/Teacher Register
  const adminRegister = async ({ username, email, password }) => {
    try {
      console.log('=== ADMIN REGISTER ===');
      console.log('Sending:', { username, email, role: 'teacher' });
      
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        role: 'teacher'
      });

      console.log('Register response:', response.data);

      const responseData = response.data.data || response.data;
      const user = responseData?.user;
      const accessToken = responseData?.accessToken || responseData?.token;
      const refreshToken = responseData?.refreshToken;

      // Xóa dữ liệu cũ trước khi lưu (tránh lưu lẫn lộn giữa các tài khoản)
      localStorage.removeItem('user_info');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('admin_info');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_verified');

      if (user) {
        setAdmin(user);
        localStorage.setItem('admin_info', JSON.stringify(user));
      } else {
        const fallbackUser = { username, email, role: 'teacher' };
        setAdmin(fallbackUser);
        localStorage.setItem('admin_info', JSON.stringify(fallbackUser));
      }

      if (accessToken) localStorage.setItem('admin_access_token', accessToken);
      if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken);

      return { success: true, message: 'Admin registration successful!' };
    } catch (error) {
      console.error('=== ADMIN REGISTER ERROR ===');
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Hiển thị lỗi chi tiết
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if backend is running on http://localhost:5000';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Admin Logout
  const adminLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      setAdmin(null);
      setAdminVerified(false);
      localStorage.removeItem('admin_info');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_verified');
    }
  };

  const verifyAdminPassword = async (password) => {
    try {
      const response = await api.post('/auth/verify-admin-password', { password });
      const result = response.data.data || response.data;
      if (result?.verified) {
        setAdminVerified(true);
        return { verified: true };
      }
      return { verified: false, message: result?.message || 'Incorrect admin password' };
    } catch (error) {
      console.error('Verify admin password error:', error);
      return { verified: false, message: error.response?.data?.message || 'Verification failed' };
    }
  };

  // Kiểm tra trạng thái khi load app
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_info');
    const token = localStorage.getItem('admin_access_token');
    if (storedAdmin && token) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {
        localStorage.removeItem('admin_info');
      }
    }
    setLoading(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, adminVerified, setAdminVerified, loading, adminLogin, adminRegister, adminLogout, verifyAdminPassword }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};

export const useAdminVerified = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminVerified must be used within AdminAuthProvider');
  return { adminVerified: context.adminVerified, setAdminVerified: context.setAdminVerified, verifyAdminPassword: context.verifyAdminPassword };
};

export default AdminAuthContext;