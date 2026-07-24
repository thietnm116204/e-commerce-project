import { axiosClient } from "../../../config/api";

export const categoryApi = {
    searchCategories: async (params) => {
        const response = await axiosClient.post("/categories/search", params);
        return response.data;
    },
    getRootCategories: async () => {
        const response = await axiosClient.get("/categories/roots");
        return response.data;
    },
    getCategoryTree: async () => {
        const response = await axiosClient.get("/categories/tree");
        return response.data;
    },
    createCategory: async (data) => {
        const response = await axiosClient.post("/category/created", data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await axiosClient.put(`/category/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await axiosClient.delete(`/category/${id}`);
        return response.data;
    },
    updateCategoryStatus: async (id, isActive) => {
        const response = await axiosClient.patch(`/category/${id}/status`, { isActive });
        return response.data;
    },
};
