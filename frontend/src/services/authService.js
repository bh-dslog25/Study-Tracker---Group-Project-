import api from '../api/axios';

const authService = {
  register: async ({ username, email, password, role }) => {
    // Truy cập vào thuộc tính .data của axios response
    const response = await api.post('/auth/register', { username, email, password, role });
    
    // Đảm bảo trỏ đúng vào object chứa token (.data.data nếu backend dùng successResponse)
    const result = response.data.data || response.data; // Đây mới là { user, accessToken, refreshToken }

    if (result.accessToken) {
      // Xóa dữ liệu cũ trước khi lưu dữ liệu mới (tránh lưu lẫn lộn giữa các tài khoản)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('admin_info');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_verified');

      // Chuẩn hoá key token để khớp interceptor Axios (access_token/refresh_token)
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);
    }
    return result; 
  },

  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Đảm bảo trỏ đúng vào object chứa token (.data.data nếu backend dùng successResponse)
    const result = response.data.data || response.data; // Lấy dữ liệu từ .data

    if (result.accessToken) {
      // Xóa dữ liệu cũ trước khi lưu dữ liệu mới (tránh lưu lẫn lộn giữa các tài khoản)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('admin_info');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_verified');

      // Chuẩn hoá key token để khớp interceptor Axios (access_token/refresh_token)
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);
    }
    return result;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // ĐỒNG BỘ: Xóa đúng tên key dạng camelCase khi người dùng đăng xuất
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    // Nên để async/await để đồng bộ với các hàm khác
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data.data || response.data;
  },

  verifyAdminPassword: async (password) => {
    const response = await api.post('/auth/verify-admin-password', { password });
    return response.data.data || response.data;
  },
};

export default authService;