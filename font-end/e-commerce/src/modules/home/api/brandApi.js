import { axiosClient } from "../../../config/api";

export const brandApi = {
    // Lấy toàn bộ thương hiệu cho màn hình home
    getAllBrands: async () => {
        const response = await axiosClient.get("/brand");
        return response.data;
    }
};
