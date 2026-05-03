import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";

export const instructorService = {
  getMyCourses: async () => {
    const res = await api.get(API_ENDPOINTS.INSTRUCTOR_COURSES);
    return res.data.courses || [];
  },

  createCourse: async (payload) => {
    const res = await api.post(API_ENDPOINTS.INSTRUCTOR_COURSES, payload);
    return res.data.course;
  },

  updateCourse: async (courseId, payload) => {
    const res = await api.patch(
      `${API_ENDPOINTS.INSTRUCTOR_COURSES}/${courseId}`,
      payload,
    );
    return res.data.course;
  },

  submitCourseForReview: async (courseId) => {
    const res = await api.post(
      `${API_ENDPOINTS.INSTRUCTOR_COURSES}/${courseId}/submit`,
    );
    return res.data.course;
  },
};
