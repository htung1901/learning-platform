import api from "../lib/api";

const studentService = {
  getMyCourses: async () => {
    const response = await api.get("/api/student/courses/my");
    return response.data;
  },
  getLesson: async (courseId, lessonId) => {
    const response = await api.get(
      `/api/student/courses/${courseId}/lessons/${lessonId}`,
    );
    return response.data;
  },
  updateLessonProgress: async (courseId, lessonId, payload) => {
    const response = await api.post(
      `/api/student/courses/${courseId}/lessons/${lessonId}/progress`,
      payload,
    );
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
