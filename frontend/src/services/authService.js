import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";
import { mockAuthService } from "./mockAuthService";

const USE_AUTH_MOCK = import.meta.env.VITE_USE_AUTH_MOCK === "true";

const apiAuthService = {
  login: async (username, password, role) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, {
      username,
      password,
    });

    // Backend returns { message, accessToken, user }
    return {
      accessToken: response.data.accessToken,
      user: {
        ...response.data.user, // Spread backend user data (displayName, email, etc.)
        role: response.data.user?.role || role || "student",
      },
    };
  },

  // Signup then auto login to keep existing frontend UX
  signup: async (data) => {
    const [firstName = "User", ...rest] = (data.displayName || "")
      .trim()
      .split(/\s+/);
    const lastName = rest.join(" ") || firstName;

    await api.post(API_ENDPOINTS.SIGNUP, {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName,
      lastName,
      role: data.role,
    });

    // Auto-login after signup
    return apiAuthService.login(data.username, data.password, data.role);
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
