import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import { mockAuthService } from "./mockAuthService";

const USE_AUTH_MOCK = import.meta.env.VITE_USE_AUTH_MOCK !== "false";

const apiAuthService = {
  login: async (email, password, role) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
      role,
    });
    return response.data;
  },

  // Signup
  signup: async (data) => {
    const response = await api.post(API_ENDPOINTS.SIGNUP, {
      username: data.username,
      email: data.email,
      displayName: data.displayName,
      password: data.password,
      role: data.role,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN);
    return response.data;
  },
};

export const authService = USE_AUTH_MOCK ? mockAuthService : apiAuthService;
