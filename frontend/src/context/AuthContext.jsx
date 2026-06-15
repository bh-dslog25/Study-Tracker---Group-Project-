import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService'; 
import api from '../api/axios';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. ĐỊNH NGHĨA CÁC HÀM TRƯỚC ---
  
  // Hàm Đăng Nhập
  const login = async (email, password) => {
  try {
    // response ở đây chính là toàn bộ cục JSON Backend trả về
    const response = await authService.login({ email, password });
    
    // Kiểm tra biến success từ Backend
    if (response && response.success) {
      // Bóc tách đúng tầng data chứa 3 món đồ Backend gửi về
      const { user, accessToken, refreshToken } = response.data;
      
      // 1. Cập nhật state hiển thị Avatar trên Navbar
      setUser(user);
      
      // 2. Lưu Toàn bộ vào localStorage
      localStorage.setItem('user_info', JSON.stringify(user));
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      return { success: true };
    }
    
    return { success: false, message: response.message || "Đăng nhập thất bại" };
  } catch (error) {
    // Bắt lỗi chuẩn nếu dùng Axios (error.response.data.message)
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Lỗi kết nối Server" 
    };
  }
};

  // Hàm Đăng Ký
  
// Thêm dấu ngoặc nhọn ở tham số để nhận Object từ LoginModal gửi sang
const register = async ({ username, email, password, role }) => {
  
  // Đoạn code validate frontend của bạn (nếu có) nhớ đổi thành username
  if (!username || !email || !password) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc" };
  }

  try {
    // Truyền thẳng Object này vào API của bạn
    const response = await api.post('/auth/register', { 
      username, 
      email, 
      password, 
      role 
    });
    
    return { success: true, data: response };
  } catch (error) {
    return { success: false, message: error.message || "Đăng ký thất bại" };
  }
};

  // Hàm Đăng Xuất
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Lỗi logout phía server:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('user_info');
    }
  };

  // --- 2. CHẠY HOOKS SAU KHI ĐÃ CÓ HÀM ---
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

  // --- 3. TRUYỀN VALUE VÀO PROVIDER ---
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được đặt bên trong AuthProvider');
  }
  return context;
};