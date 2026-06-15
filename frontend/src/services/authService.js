import api from '../api/axios';

const authService = {
<<<<<<< HEAD
  // Nhận vào một Object { username, email, password, role }
  register: async ({ username, email, password, role }) => {
    const data = await api.post('/auth/register', { username, email, password, role });
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data; // Trả về { user, accessToken, refreshToken }
  },

  // Nhận vào một Object { email, password }
  login: async ({ email, password }) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data; // Trả về { user, accessToken, refreshToken }
=======
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
>>>>>>> f43b1a47113c54e54615d03118726a96d2649513
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

<<<<<<< HEAD
  changePassword: ({ currentPassword, newPassword }) => {
    return api.post('/auth/change-password', { currentPassword, newPassword });
=======
  changePassword: async ({ currentPassword, newPassword }) => {
    // Nên để async/await để đồng bộ với các hàm khác
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
>>>>>>> f43b1a47113c54e54615d03118726a96d2649513
  },
};

export default authService;