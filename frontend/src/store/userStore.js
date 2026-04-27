import { create } from "zustand";
import { userService } from "../services/userService";
import { toast } from "sonner";

export const useUserStore = create((set) => ({
  // State
  profile: null,
  isLoading: false,

  // Actions
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await userService.getProfile();
      set({ profile, isLoading: false });
      return profile;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      set({ isLoading: false });
      return null;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const updatedProfile = await userService.updateProfile(data);
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

  clearProfile: () => set({ profile: null }),
}));
