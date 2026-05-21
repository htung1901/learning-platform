import axios from "axios";
import { API_BASE_URL } from "./constants";
import { useAuthStore } from "../store/authStore";

let isRedirectingToLogin = false;

export const triggerSessionExpired = () => {
  useAuthStore.getState().forceLogout(false);
  sessionStorage.setItem("auth_notice", "session_expired");

  if (!isRedirectingToLogin) {
    isRedirectingToLogin = true;
    window.location.replace("/login");
  }
};

const isAccessTokenInvalidResponse = (error) => {
  const status = error?.response?.status;
  const message = (error?.response?.data?.message || "").toLowerCase();
  const code = error?.response?.data?.code;

  return (
    status === 401 ||
    code === "ACCESS_TOKEN_INVALID" ||
    (status === 403 && message.includes("access token"))
  );
};

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor: Add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set Content-Type to application/json only if data is not FormData
    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    // If error is 401 and we haven't already tried refreshing
    if (
      isAccessTokenInvalidResponse(error) &&
      !originalRequest._retry &&
      !requestUrl.includes("/api/auth/")
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        const { accessToken } = refreshResponse.data;
        localStorage.setItem("token", accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, force logout and redirect to login
        triggerSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    // If auth endpoint returns 401 (e.g. refresh cookie expired), force logout too
    if (error.response?.status === 401 && requestUrl.includes("/api/auth/")) {
      triggerSessionExpired();
    }

    return Promise.reject(error);
  },
);

export default api;
