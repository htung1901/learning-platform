import api from "../lib/api";
import { API_ENDPOINTS } from "../lib/constants";

export const userService = {
  getProfile: async () => {
    const res = await api.get(API_ENDPOINTS.GET_PROFILE);
    return res.data.user;
  },

  updateProfile: async (payload) => {
    const res = await api.patch(API_ENDPOINTS.UPDATE_PROFILE, payload);
    return res.data.user;
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    const res = await api.post(API_ENDPOINTS.UPDATE_PROFILE + "/password", {
      oldPassword,
      newPassword,
    });
    return res.data;
  },

  changeEmail: async ({ newEmail, password }) => {
    const res = await api.post(API_ENDPOINTS.UPDATE_PROFILE + "/email", {
      newEmail,
      password,
    });
    return res.data.user;
  },

  changeUsername: async ({ newUsername, password }) => {
    const res = await api.post(API_ENDPOINTS.UPDATE_PROFILE + "/username", {
      newUsername,
      password,
    });
    return res.data.user;
  },

  getPublicProfile: async (username) => {
    const res = await api.get(`/api/users/${encodeURIComponent(username)}`);
    return res.data.user;
  },
};
