import { axiosClient } from "../../../config/api";

export const categoryApi = {
    // Lấy toàn bộ danh mục dưới dạng cây cho màn hình home
    getCategoryTree: async () => {
        const response = await axiosClient.get("/categories/tree");
        return response.data;
    },
    
    // Lấy các danh mục gốc cho navbar
    getRootCategories: async () => {
        const response = await axiosClient.get("/categories/root");
        return response.data;
    }
};
