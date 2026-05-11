import api from "../lib/api";

export const adminService = {
  // Lấy thống kê
  getStats: async () => {
    const response = await api.get("/api/admin/stats");
    return response.data;
  },

  // Lấy khóa học chờ duyệt
  getPendingCourses: async (page = 1, limit = 10) => {
    const response = await api.get("/api/admin/courses/pending", {
      params: { page, limit },
    });
    return response.data;
  },

  // Duyệt khóa học
  approveCourse: async (courseId) => {
    const response = await api.post(`/api/admin/courses/${courseId}/approve`);
    return response.data;
  },

  // Từ chối khóa học
  rejectCourse: async (courseId, reason) => {
    const response = await api.post(`/api/admin/courses/${courseId}/reject`, {
      reason,
    });
    return response.data;
  },

  // Lấy danh sách user
  getAllUsers: async (page = 1, limit = 10, role = null) => {
    const response = await api.get("/api/admin/users", {
      params: { page, limit, role },
    });
    return response.data;
  },

  // Cập nhật role user
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/api/admin/users/${userId}/role`, {
      role,
    });
    return response.data;
  },
};

export default adminService;
