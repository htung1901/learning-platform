import { create } from "zustand";
import { userService } from "../services/userService";
import { toast } from "sonner";

export const useUserStore = create((set) => ({
  // Restore profile from localStorage on init
  profile: (() => {
    try {
      const cached = localStorage.getItem("userProfile");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  })(),
  isLoading: false,

  setProfile: (profile) => {
    set({ profile });
    if (profile) {
      localStorage.setItem("userProfile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("userProfile");
    }
  },
  setLoading: (isLoading) => set({ isLoading }),

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await userService.getProfile();
      // Persist profile to localStorage
      localStorage.setItem("userProfile", JSON.stringify(profile));
      set({ profile, isLoading: false });
      return profile;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      set({ isLoading: false });
      const status = error?.response?.status;
      // If 404 (profile not found) don't show a harsh error, let UI fallback to auth user
      if (status === 404) {
        return null;
      }

      // If unauthorized, clear auth and prompt login
      if (status === 401 || status === 403) {
        // let caller handle redirect; show message
        toast.error(error.response?.data?.message || "Vui lòng đăng nhập lại");
        localStorage.removeItem("userProfile");
        return null;
      }

      toast.error(error.response?.data?.message || "Lấy profile thất bại");
      return null;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const updatedProfile = await userService.updateProfile(data);
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      set({ profile: updatedProfile, isLoading: false });
      toast.success("Cập nhật hồ sơ thành công!");
      return updatedProfile;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Cập nhật hồ sơ thất bại";
      toast.error(errorMsg);
      set({ isLoading: false });
      return null;
    }
  },

  changePassword: async (payload) => {
    set({ isLoading: true });
    try {
      await userService.changePassword(payload);
      set({ isLoading: false });
      toast.success("Đổi mật khẩu thành công");
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
      return false;
    }
  },

  changeEmail: async (payload) => {
    set({ isLoading: true });
    try {
      const updatedProfile = await userService.changeEmail(payload);
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      set({ profile: updatedProfile, isLoading: false });
      toast.success("Đổi email thành công");
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Đổi email thất bại");
      return false;
    }
  },

  changeUsername: async (payload) => {
    set({ isLoading: true });
    try {
      const updatedProfile = await userService.changeUsername(payload);
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      set({ profile: updatedProfile, isLoading: false });
      toast.success("Đổi tên người dùng thành công");
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(
        error.response?.data?.message || "Đổi tên người dùng thất bại",
      );
      return false;
    }
  },

  clearProfile: () => {
    localStorage.removeItem("userProfile");
    set({ profile: null });
  },
}));
