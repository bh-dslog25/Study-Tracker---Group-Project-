import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService'; 

import { clearUserData } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm Đăng Nhập
  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response && response.user) {
        const { user, accessToken, refreshToken } = response;
        setUser(user);
        localStorage.setItem('user_info', JSON.stringify(user));
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        return { success: true };
      }
      return { success: false, message: "Đăng nhập thất bại" };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Email hoặc mật khẩu không đúng" 
      };
    }
  };

  // Hàm Đăng Ký (Sửa: Tự động lưu user sau khi đăng ký)
  const register = async ({ username, email, password, role }) => {
    try {
      const response = await authService.register({ username, email, password, role });
      
      // Nếu response trả về data user sau khi đăng ký
      if (response && response.user) {
        const { user, accessToken, refreshToken } = response;
        setUser(user);
        localStorage.setItem('user_info', JSON.stringify(user));
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        return { success: true, message: "Đăng ký thành công!" };
      }
      return { success: false, message: "Đăng ký thành công nhưng không lấy được thông tin user" };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Đăng ký thất bại" 
      };
    }
  };

  // Hàm Đăng Xuất
  const logout = async () => {
    // Xóa dữ liệu user TRƯỚC (không chờ backend)
    if (user) {
      clearUserData(user.id || user.email);
    }
    
    // Gọi API logout nhưng không block - backend có thể lỗi vẫn logout được
    try {
      await authService.logout();
    } catch (error) {
      console.error("Lỗi logout API (không ảnh hưởng):", error);
    }
    
    // Luôn xóa auth data và redirect
    setUser(null);
    localStorage.removeItem('user_info');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  // Hàm Cập nhật User
  const updateUser = (newData) => {
    if (user) {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      localStorage.setItem('user_info', JSON.stringify(updatedUser));
    }
  };

  // Kiểm tra trạng thái khi load app
  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    const token = localStorage.getItem('access_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user_info');
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được đặt bên trong AuthProvider');
  return context;
};
