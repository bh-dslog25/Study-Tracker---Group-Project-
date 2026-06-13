import api from '../api/axios';

const taskService = {
  // Lấy danh sách nhiệm vụ (Hỗ trợ lọc theo trạng thái, mức độ ưu tiên và phân trang)
  getAll: async ({ status, priority, page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    if (priority) params.priority = priority;

    return api.get('/tasks', { params }); // Trả về { count, rows }
  },

  // Tạo nhiệm vụ mới
  create: async (taskData) => {
    return api.post('/tasks', taskData);
  },

  // Cập nhật thông tin nhiệm vụ (hoặc đổi trạng thái)
  update: async (id, taskData) => {
    return api.put(`/tasks/${id}`, taskData);
  },

  // Xóa nhiệm vụ
  remove: async (id) => {
    return api.delete(`/tasks/${id}`);
  }
};

export default taskService;