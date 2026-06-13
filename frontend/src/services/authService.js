import api from '../api/axios';

const authService = {
  register: async ({ username, email, password, role }) => {
    // Truy cập vào thuộc tính .data của axios response
    const response = await api.post('/auth/register', { username, email, password, role });
    const result = response.data; // Đây mới là { user, accessToken, refreshToken }

    if (result.accessToken) {
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);
    }
    return result; 
  },

  login: async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    const result = response.data; // Lấy dữ liệu từ .data

    if (result.accessToken) {
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('refresh_token', result.refreshToken);
    }
    return result;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    // Nên để async/await để đồng bộ với các hàm khác
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

export default authService;