import api from "./api";

const paymentService = {
  // Create Razorpay order
  createOrder: async (courseId) => {
    const response = await api.post("/payments/create-order", {
      courseId,
    });
    return response.data;
  },

  // Verify Razorpay payment
  verifyPayment: async (paymentData) => {
    const response = await api.post(
      "/payments/verify-payment",
      paymentData
    );
    return response.data;
  },

  // Retry enrollment if payment succeeded but enrollment failed
  retryEnrollment: async (paymentData) => {
    const response = await api.post(
      "/payments/retry-enrollment",
      paymentData
    );
    return response.data;
  },
};

export default paymentService;