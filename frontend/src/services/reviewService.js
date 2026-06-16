import api from "../lib/api";

const reviewService = {
  getCourseReviews: async (courseId, page = 1, limit = 20) => {
    const response = await api.get(`/api/reviews/course/${courseId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  createReview: async ({ courseId, rating, comment }) => {
    const response = await api.post("/api/reviews", {
      courseId,
      rating,
      comment,
    });
    return response.data;
  },
};

export default reviewService;
