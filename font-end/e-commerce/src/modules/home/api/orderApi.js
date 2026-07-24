import { axiosClient } from "../../../config/api";

export const orderApi = {
  getMyOrders: async (page = 0, size = 10, status = null) => {
    let url = `/orders/my-orders?page=${page}&size=${size}`;
    if (status && status !== 'ALL' && status !== 'CART') {
      url = `/orders/my-orders/status?status=${status}&page=${page}&size=${size}`;
    }
    const response = await axiosClient.get(url);
    return response.data;
  },
  createOrder: async (orderData) => {
    const response = await axiosClient.post("/orders/created", orderData);
    return response.data;
  },
  checkoutCart: async (checkoutData) => {
    const response = await axiosClient.post("/orders/checkout", checkoutData);
    return response.data;
  },
  buyNow: async (buyNowData) => {
    const response = await axiosClient.post("/orders/buy-now", buyNowData);
    return response.data;
  },
  /** Hủy đơn hàng đang ở trạng thái AWAITING_PAYMENT */
  cancelOrder: async (orderId) => {
    const response = await axiosClient.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
  /** Tạo lại URL thanh toán VNPay cho đơn đang ở AWAITING_PAYMENT */
  getVnpayUrl: async (orderId) => {
    const response = await axiosClient.post("/payments/vnpay/create-payment-url", { orderId });
    return response.data;
  },
};

