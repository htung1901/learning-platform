import api from "../lib/api";

const studentService = {
  getMyCourses: async () => {
    const response = await api.get("/api/student/courses/my");
    return response.data;
  },
  getAvailableCourses: async (page = 1, limit = 12, q = "") => {
    const response = await api.get("/api/student/courses/available", {
      params: { page, limit, q },
    });
    return response.data;
  },
};

export default studentService;
