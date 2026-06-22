import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// 1. Tự động gắn token vào header (Chỉ gắn nếu chưa có Authorization)
  api.interceptors.request.use(
  (config) => {
    // Nếu đã có Authorization header (do adminAuthHeaders tự set) thì không ghi đè
    const existingAuth = config.headers['authorization'];
    if (existingAuth) {
      console.log("=== AUTHORIZATION ĐÃ ĐƯỢC SET (Admin) ===");
      return config;
    }

    // Ưu tiên token của học viên (user), chỉ dùng admin nếu không có user token
    const adminToken = localStorage.getItem('admin_access_token');
    const userToken = localStorage.getItem('access_token');
    const token = userToken || adminToken;
    
    console.log("=== AUTO ATTACH TOKEN ===");
    console.log("TOKEN TRONG MÁY =", token);

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log("AUTH CHUẨN BỊ GỬI =", config.headers['Authorization']);
    
    return config;
  },
    (error) => Promise.reject(error)
  );

// 2. Tự động xóa token khi nhận 401, để component tự xử lý redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_info');
      localStorage.removeItem('admin_verified');
    }
    return Promise.reject(error);
  }
);

// 3. Tự động đăng xuất khi token hết hạn (401) - chỉ gọi 1 lần
let isLoggingOut = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
