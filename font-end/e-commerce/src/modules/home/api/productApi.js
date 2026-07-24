import { axiosClient } from "../../../config/api";

export const productApi = {
    // Tìm kiếm sản phẩm cho màn hình home
    searchHomeProducts: async (payload) => {
        const response = await axiosClient.post("/product/search-home", payload);
        return response.data;
    },
    // Lấy thông tin chi tiết sản phẩm theo slug
    getProductBySlug: async (slug) => {
        const response = await axiosClient.get(`/product/slug/${slug}`);
        return response.data;
    }
};
