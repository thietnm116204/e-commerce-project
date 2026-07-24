import { axiosClient } from '../../../config/api';

export const cartApi = {
  // Lấy giỏ hàng
  getCart: async () => {
    const response = await axiosClient.get('/cart');
    return response.data;
  },

  // Thêm vào giỏ hàng
  addToCart: async (payload) => {
    // payload: { productId, quantity }
    const response = await axiosClient.post('/cart/items', payload);
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (itemId) => {
    const response = await axiosClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // (Optional) Cập nhật số lượng sản phẩm nếu backend hỗ trợ
  updateCartItem: async (itemId, payload) => {
    const response = await axiosClient.put(`/cart/items/${itemId}`, payload);
    return response.data;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const response = await axiosClient.delete('/cart');
    return response.data;
  }
};

