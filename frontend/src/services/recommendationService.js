import api from "../lib/api";

const recommendationService = {
  generateLearningPath: async ({ timeLimitSeconds }) => {
    const response = await api.post("/api/recommendations/learning-path", {
      timeLimitSeconds,
    });
    return response.data;
  },
};

export default recommendationService;
