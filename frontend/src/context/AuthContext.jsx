import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm Đăng Nhập
  const login = async (email, password) => {
  try {
    const response = await authService.login({ email, password });
    
    // 1. Log ra để kiểm tra nếu kiểm tra điều kiện vẫn bị thất bại
    console.log("API Response:", response);

    // 2. Kiểm tra dữ liệu linh hoạt hơn. 
    // Thường Axios trả về dữ liệu nằm trong response.data
    const responseData = response?.data || response; 

    // Thay đổi điều kiện check tùy thuộc vào việc API của bạn trả về user hay accessToken làm dấu hiệu thành công
    if (responseData && (responseData.user || responseData.accessToken)) {
      const { user, accessToken, refreshToken } = responseData;
      
      // Lưu vào state và localStorage
      if (user) {
        setUser(user);
        localStorage.setItem('user_info', JSON.stringify(user));
      }
      
      if (accessToken) localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      
      return { success: true };
    }

   
    return { 
      success: false, 
      message: responseData?.message || "Đăng nhập thất bại: Dữ liệu không hợp lệ" 
    };

  } catch (error) {
    console.error("Login Error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Email hoặc mật khẩu không đúng" 
    };
  }
};
  // Hàm Đăng Ký (Sửa: Tự động lưu user sau khi đăng ký)
 const register = async ({ username, email, password, role }) => {
  try {
    const response = await authService.register({ username, email, password, role });
    
    // Kiểm tra nếu response tồn tại (thường Axios trả về status 200-299 là thành công)
    if (response) {
      const responseData = response.data || response;

      // Lấy dữ liệu ra (dùng optional chaining ?. để không bị crash nếu thiếu trường)
      const user = responseData?.user;
      const accessToken = responseData?.accessToken || responseData?.token;
      const refreshToken = responseData?.refreshToken;
      
      // Nếu có user thì lưu user
      if (user) {
        setUser(user);
        localStorage.setItem('user_info', JSON.stringify(user));
      } else {
        // Nếu API không trả về object user, ta tự tạo một object tạm từ thông tin đã nhập để giao diện hiển thị
        const fallbackUser = { username, email, role };
        setUser(fallbackUser);
        localStorage.setItem('user_info', JSON.stringify(fallbackUser));
      }

      // Lưu token nếu có
      if (accessToken) localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      
      return { success: true, message: "Đăng ký thành công!" };
    }
    
    return { success: false, message: "Đăng ký thất bại" };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || "Đăng ký thất bại" 
    };
  }
};

  // Hàm Đăng Xuất
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Lỗi logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('user_info');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được đặt bên trong AuthProvider');
  return context;
};