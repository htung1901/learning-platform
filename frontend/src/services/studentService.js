import api from "../lib/api";

const studentService = {
  getAvailableCourses: async (page = 1, limit = 12, q = "") => {
    const response = await api.get("/api/student/courses/available", {
      params: { page, limit, q },
    });
    return response.data;
  },
};

export default studentService;
