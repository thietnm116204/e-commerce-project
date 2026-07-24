import { axiosClient } from "../../../config/api";

export const productApi = {
    // Tìm kiếm sản phẩm
    searchProducts: (payload) => {
        return axiosClient.post("/product/search", payload);
    },
    
    // Tìm kiếm sản phẩm cho màn hình home
    searchHomeProducts: (payload) => {
        return axiosClient.post("/product/search-home", payload);
    },
    
    // Lấy thông tin khởi tạo (Danh mục, Thương hiệu)
    getInitData: () => {
        return axiosClient.get("/product/init");
    },
    
    // Lấy chi tiết sản phẩm theo ID
    getProductById: (id) => {
        return axiosClient.get(`/product/${id}`);
    },

    // Xóa sản phẩm
    deleteProduct: (id) => {
        return axiosClient.delete(`/product/${id}`);
    },
    
    // Cập nhật sản phẩm (multipart/form-data)
    updateProduct: (id, formData) => {
        return axiosClient.put(`/product/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }
};
