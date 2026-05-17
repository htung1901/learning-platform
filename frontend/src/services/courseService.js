import api from "../lib/api";

const courseService = {
  getPublishedCourses: async ({
    page = 1,
    limit = 12,
    q = "",
    category,
    level,
  } = {}) => {
    const params = { page, limit };
    if (q) params.q = q;
    if (category) params.category = category;
    if (level) params.level = level;

    const response = await api.get("/api/courses", { params });
    return response.data;
  },
  getCourseById: async (id) => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
  },
};

export default courseService;
