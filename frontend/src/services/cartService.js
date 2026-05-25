import api from "../lib/api";

const cartService = {
  getCart: async () => {
    const response = await api.get("/api/cart");
    return response.data;
  },
  addToCart: async (courseId) => {
    const response = await api.post("/api/cart", { courseId });
    return response.data;
  },
  removeFromCart: async (courseId) => {
    const response = await api.delete(`/api/cart/${courseId}`);
    return response.data;
  },
};

export default cartService;
