import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";

export const instructorService = {
  uploadThumbnailImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    // Let Axios automatically set Content-Type with boundary for FormData.
    const res = await api.post("/api/upload-image", formData);

    return res.data.imageUrl;
  },

  uploadLessonAttachment: async (file) => {
    const formData = new FormData();
    formData.append("attachment", file);

    const res = await api.post("/api/upload-attachment", formData);
    // returns { attachment }
    return res.data.attachment;
  },

  getMyCourses: async () => {
    const res = await api.get(API_ENDPOINTS.INSTRUCTOR_COURSES);
    return res.data.courses || [];
  },

  getMyCourseDetail: async (courseId) => {
    const res = await api.get(
      `${API_ENDPOINTS.INSTRUCTOR_COURSES}/${courseId}`,
    );
    return res.data.course;
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

  deleteCourse: async (courseId) => {
    const res = await api.delete(
      `${API_ENDPOINTS.INSTRUCTOR_COURSES}/${courseId}`,
    );
    return res.data;
  },

  createLesson: async (courseId, payload) => {
    const res = await api.post(
      `${API_ENDPOINTS.INSTRUCTOR_COURSES}/${courseId}/lessons`,
      payload,
    );
    return res.data.lesson;
  },

  updateLesson: async (courseId, lessonId, payload) => {
    const res = await api.patch(
      `${API_ENDPOINTS.INSTRUCTOR_COURSES}/${courseId}/lessons/${lessonId}`,
      payload,
    );
    return res.data.lesson;
  },

  deleteLesson: async (courseId, lessonId) => {
    const res = await api.delete(
      `${API_ENDPOINTS.INSTRUCTOR_COURSES}/${courseId}/lessons/${lessonId}`,
    );
    return res.data;
  },

  submitCourseForReview: async (courseId) => {
    const res = await api.post(
      `${API_ENDPOINTS.INSTRUCTOR_COURSES}/${courseId}/submit`,
    );
    return res.data.course;
  },
};
