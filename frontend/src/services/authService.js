import api from '../api/axios';

const authService = {
  register: async (name, email, password, role) => {
    const data = await api.post('/auth/register', { name, email, password, role });
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data; // { user, accessToken, refreshToken }
  },

  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data; // { user, accessToken, refreshToken }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  changePassword: (currentPassword, newPassword) => {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export default authService;