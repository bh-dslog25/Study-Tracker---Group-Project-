import api from "/src/api/axios.js";

const goalService = {
  // ===== GOAL CRUD =====

  // Lấy danh sách mục tiêu (có includes tasks)
  async getAll(params = {}) {
    try {
      const resData = await api.get("/goals", { params });
      return resData;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách mục tiêu:", error);
      throw error;
    }
  },

  // Lấy chi tiết mục tiêu theo id
  async getById(id) {
    try {
      return await api.get(`/goals/${id}`);
    } catch (error) {
      console.error(`Lỗi khi lấy mục tiêu ID ${id}:`, error);
      throw error;
    }
  },

  // Tạo mục tiêu mới
  async create(goalData) {
    try {
      return await api.post("/goals", goalData);
    } catch (error) {
      console.error("Lỗi khi tạo mục tiêu:", error);
      throw error;
    }
  },

  // Cập nhật mục tiêu
  async update(id, goalData) {
    try {
      return await api.put(`/goals/${id}`, goalData);
    } catch (error) {
      console.error(`Lỗi khi cập nhật mục tiêu ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa mục tiêu
  async remove(id) {
    try {
      return await api.delete(`/goals/${id}`);
    } catch (error) {
      console.error(`Lỗi khi xóa mục tiêu ID ${id}:`, error);
      throw error;
    }
  },

  // ===== TASK MANAGEMENT INSIDE GOAL =====

  // Thêm task vào goal
  async addTask(goalId, taskData) {
    try {
      return await api.post(`/goals/${goalId}/tasks`, taskData);
    } catch (error) {
      console.error("Lỗi khi thêm task vào goal:", error);
      throw error;
    }
  },

  // Toggle completion task trong goal
  async toggleTask(goalId, taskId) {
    try {
      return await api.put(`/goals/${goalId}/tasks/${taskId}/toggle`);
    } catch (error) {
      console.error("Lỗi khi toggle task:", error);
      throw error;
    }
  },

  // Xóa task khỏi goal
  async removeTask(goalId, taskId) {
    try {
      return await api.delete(`/goals/${goalId}/tasks/${taskId}`);
    } catch (error) {
      console.error("Lỗi khi xóa task khỏi goal:", error);
      throw error;
    }
  },
};

export default goalService;