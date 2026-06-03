import api from "../lib/api";

const recommendationService = {
  generateLearningPath: async ({ timeLimitSeconds, category }) => {
    const response = await api.post("/api/recommendations/learning-path", {
      timeLimitSeconds,
      category,
    });
    return response.data;
  },
};

export default recommendationService;
