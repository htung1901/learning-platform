import { create } from "zustand";
import { authService } from "../services/authService";
import { toast } from "sonner";

export const useAuthStore = create((set) => ({
  // State
  user: localStorage.getItem("userRole")
    ? { role: localStorage.getItem("userRole") }
    : null,
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

  login: async (email, password, role) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(email, password, role);
      const { accessToken, user } = response;
      const normalizedUser = {
        ...(user || {}),
        role: user?.role || role || "student",
      };

      set({
        user: normalizedUser,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("token", accessToken);
      localStorage.setItem("userRole", normalizedUser.role);
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
      const normalizedUser = {
        ...(user || {}),
        role: user?.role || data.role || "student",
      };

      set({
        user: normalizedUser,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem("token", accessToken);
      localStorage.setItem("userRole", normalizedUser.role);
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
      localStorage.removeItem("userRole");
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
    const savedRole = localStorage.getItem("userRole");
    if (token) {
      set({
        token,
        isAuthenticated: true,
        user: savedRole ? { role: savedRole } : null,
      });
      // Optionally fetch user profile here
    }
  },

  switchRole: (newRole) => {
    set((state) => {
      const updatedUser = { ...state.user, role: newRole };
      localStorage.setItem("userRole", newRole);
      toast.success(
        `Đã chuyển sang vai trò: ${newRole === "instructor" ? "Giảng viên" : "Học viên"}`,
      );
      return { user: updatedUser };
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
