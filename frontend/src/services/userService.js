import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";

export const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.GET_PROFILE);
    return response.data.user;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, data);
    return response.data.user;
  },
};
