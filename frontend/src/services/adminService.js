import axios from "axios";

const API_URL = "http://localhost:5001/api/admin";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add auth interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const adminService = {
  // Lấy thống kê
  getStats: async () => {
    const response = await axiosInstance.get("/stats");
    return response.data;
  },

  // Lấy khóa học chờ duyệt
  getPendingCourses: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get("/courses/pending", {
      params: { page, limit },
    });
    return response.data;
  },

  // Duyệt khóa học
  approveCourse: async (courseId) => {
    const response = await axiosInstance.post(`/courses/${courseId}/approve`);
    return response.data;
  },

  // Từ chối khóa học
  rejectCourse: async (courseId, reason) => {
    const response = await axiosInstance.post(`/courses/${courseId}/reject`, {
      reason,
    });
    return response.data;
  },

  // Lấy danh sách user
  getAllUsers: async (page = 1, limit = 10, role = null) => {
    const response = await axiosInstance.get("/users", {
      params: { page, limit, role },
    });
    return response.data;
  },

  // Cập nhật role user
  updateUserRole: async (userId, role) => {
    const response = await axiosInstance.patch(`/users/${userId}/role`, {
      role,
    });
    return response.data;
  },
};

export default adminService;
