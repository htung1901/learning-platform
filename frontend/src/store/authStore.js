import { create } from "zustand";
import { authService } from "../services/authService";
import { toast } from "sonner";

export const useAuthStore = create((set) => ({
  // State - restore from localStorage on init
  user: (() => {
    try {
      const cached = localStorage.getItem("authUser");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("token"),

  // Actions
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, isAuthenticated: !!token });
  },
  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    set({ refreshToken });
  },

  login: async (username, password, role) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(username, password, role);
      const { accessToken, user } = response;

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("token", accessToken);
      localStorage.setItem("authUser", JSON.stringify(user));
      toast.success("Đăng nhập thành công!");
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(errorMsg);
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authService.signup(data);
      const { accessToken, user } = response;

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("token", accessToken);
      localStorage.setItem("authUser", JSON.stringify(user));
      toast.success("Đăng ký thành công!");
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(errorMsg);
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("userProfile");
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      toast.success("Đã đăng xuất");
    }
  },

  refreshAccessToken: async () => {
    try {
      const response = await authService.refreshToken();
      const { accessToken } = response;
      set({ token: accessToken });
      localStorage.setItem("token", accessToken);
      return accessToken;
    } catch {
      // If refresh fails, logout user
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return null;
    }
  },

  // Initialize auth state on app load
  initializeAuth: async () => {
    const token = localStorage.getItem("token");
    const savedUser = (() => {
      try {
        const cached = localStorage.getItem("authUser");
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    })();
    if (token) {
      set({
        token,
        isAuthenticated: true,
        user: savedUser,
      });
      // Optionally fetch user profile here
    }
  },

  switchRole: (newRole) => {
    set((state) => {
      const updatedUser = { ...state.user, role: newRole };
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      toast.success(
        `Đã chuyển sang vai trò: ${newRole === "instructor" ? "Giảng viên" : "Học viên"}`,
      );
      return { user: updatedUser };
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
