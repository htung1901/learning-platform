import api from "../lib/api";

const paymentService = {
  fakePay: async ({ courseId, paymentMethod = "card", amount = 0 }) => {
    const response = await api.post("/api/payments/fake", {
      courseId,
      paymentMethod,
      amount,
    });
    return response.data;
  },
};

export default paymentService;
