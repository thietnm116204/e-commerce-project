import { axiosClient } from "../../../config/api";

export const brandApi = {
    getAllBrands: async () => {
        const response = await axiosClient.get("/brand");
        return response.data;
    },
    searchBrands: async (params) => {
        const response = await axiosClient.post("/brand/search", params);
        return response.data;
    },
    getOrigins: async () => {
        const response = await axiosClient.get("/brand/origins");
        return response.data;
    },
    createBrand: async (requestData, file) => {
        const formData = new FormData();
        formData.append("request", new Blob([JSON.stringify(requestData)], { type: "application/json" }));
        if (file) {
            formData.append("file", file);
        }
        const response = await axiosClient.post("/brand/created", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    updateBrand: async (id, requestData, file) => {
        const formData = new FormData();
        formData.append("request", new Blob([JSON.stringify(requestData)], { type: "application/json" }));
        if (file) {
            formData.append("file", file);
        }
        const response = await axiosClient.put(`/brand/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    deleteBrand: async (id) => {
        const response = await axiosClient.delete(`/brand/${id}`);
        return response.data;
    },
    updateBrandStatus: async (id) => {
        const response = await axiosClient.patch(`/brand/${id}/status`);
        return response.data;
    },
};
