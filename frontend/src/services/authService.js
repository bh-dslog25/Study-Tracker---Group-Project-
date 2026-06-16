import api from '../api/axios';

const authService = {
  register: async ({ username, email, password, role }) => {
    // Truy cập vào thuộc tính .data của axios response
    const response = await api.post('/auth/register', { username, email, password, role });
    
    // Đảm bảo trỏ đúng vào object chứa token (.data.data nếu backend dùng successResponse)
    const result = response.data.data || response.data; // Đây mới là { user, accessToken, refreshToken }

    if (result.accessToken) {
      // ĐỒNG BỘ: Đổi tên key thành dạng camelCase để khớp với file Goals.js
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    return result; 
  },

  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Đảm bảo trỏ đúng vào object chứa token (.data.data nếu backend dùng successResponse)
    const result = response.data.data || response.data; // Lấy dữ liệu từ .data

    if (result.accessToken) {
      // ĐỒNG BỘ: Đổi tên key thành dạng camelCase để khớp với file Goals.js
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    return result;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // ĐỒNG BỘ: Xóa đúng tên key dạng camelCase khi người dùng đăng xuất
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    // Nên để async/await để đồng bộ với các hàm khác
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data.data || response.data;
  },
};

export default authService;