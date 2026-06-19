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
    const existingAuth = config.headers['Authorization'];
    if (existingAuth) {
      console.log("=== AUTHORIZATION ĐÃ ĐƯỢC SET (Admin) ===");
      return config;
    }

    // Thử lấy admin token trước, sau đó user token
    const adminToken = localStorage.getItem('admin_access_token');
    const userToken = localStorage.getItem('access_token');
    const token = adminToken || userToken;
    
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

export default api;