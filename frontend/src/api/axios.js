import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// 1. Tự động gắn token vào header (Giữ nguyên cấu trúc và log của bạn)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    console.log("=== KIỂM TRA ĐẦU VÀO INTERCEPTOR ===");
    console.log("TOKEN TRONG MÁY =", token);

    if (token) {
      // SỬA: Dùng phương thức .set() chuẩn của AxiosHeaders để tránh bị ép về undefined
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // SỬA: Dùng .get() để log ra chính xác những gì request chuẩn bị gửi đi
    console.log("AUTH CHUẨN BỊ GỬI =", config.headers.get('Authorization'));
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;