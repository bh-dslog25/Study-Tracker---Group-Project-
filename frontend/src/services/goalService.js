import api from '../api/axios';

const goalService = {
  // Lấy danh sách mục tiêu (Có hỗ trợ bộ lọc và phân trang theo Backend của bạn)
  getAll: async ({ status, type, page = 1, limit = 20 } = {}) => {
    // Truyền các tham số dưới dạng query params (?status=...&type=...)
    const params = { page, limit };
    if (status) params.status = status;
    if (type) params.type = type;

    return api.get('/goals', { params }); 
    // Backend trả về dạng: { count, rows: [...] } do dùng findAndCountAll
  },

  // Tạo mới một mục tiêu
  create: async (goalData) => {
    // goalData gồm: title, endDate, type, description... tùy vào schema DB của bạn
    return api.post('/goals', goalData);
  },

  // Cập nhật mục tiêu theo ID
  update: async (id, goalData) => {
    return api.put(`/goals/${id}`, goalData);
  },

  // Xóa mục tiêu theo ID
  remove: async (id) => {
    return api.delete(`/goals/${id}`);
  }
};

export default goalService;