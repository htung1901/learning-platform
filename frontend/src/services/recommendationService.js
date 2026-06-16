import api from "../lib/api";

const recommendationService = {
  generateLearningPath: async ({ timeLimitSeconds, category, debug }) => {
    const response = await api.post("/api/recommendations/learning-path", {
      timeLimitSeconds,
      category,
      debug,
    });
    return response.data;
  },
};

export default recommendationService;
