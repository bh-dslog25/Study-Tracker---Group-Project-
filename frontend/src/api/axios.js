import axios from 'axios';

const api = axios.create({
  // Thêm giá trị dự phòng để tránh lỗi khi chưa kịp config .env
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm hỗ trợ xóa token để dùng lại nhiều lần
const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // Chuyển hướng về login
  window.location.href = '/login';
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ refresh token nếu lỗi là 401 và chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Dùng axios gốc để không kích hoạt interceptor của 'api' -> tránh lặp vô hạn
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = res.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefresh);

        // Gán lại token mới vào header của request cũ và thử lại
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng hết hạn, force logout
        logout();
        return Promise.reject(refreshError);
      }
    }

    
    return Promise.reject(error.response?.data || error);
  }
);

export default api;