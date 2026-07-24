import { authApiClient, axiosClient } from "../../../config/api";

/**
 * Gọi API đăng ký tài khoản
 * @param {Object} data - { userEmail, userDateBirth, userPassword, userFullName, userPhone }
 */
export const registerApi = async (data) => {
  const response = await authApiClient.post("/auth/register", data);
  return response.data;
};

/**
 * Gọi API đăng nhập
 * @param {Object} data - { email, password }
 */
export const loginApi = async (data) => {
  const response = await authApiClient.post("/auth/login", data);
  return response.data;
};

/**
 * Lấy thông tin user hiện tại (cần token)
 */
export const getUserInfoApi = async () => {
  // Sử dụng axiosClient đã cấu hình sẵn interceptor để tự động thêm token
  const response = await axiosClient.get("/user/info");
  return response.data;
};
