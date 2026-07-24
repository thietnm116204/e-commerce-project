import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const authApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cấu hình một axios client riêng cho các request cần xác thực
export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshTokenPromise = null;

export const clearAuthTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const setAuthTokens = ({ accessToken }) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }
};

export const refreshAccessToken = async () => {
  const res = await authApiClient.post("/auth/refresh-token");

  const refreshData = res?.data?.data ?? res?.data ?? null;
  const accessToken = refreshData?.accessToken;

  if (!accessToken) {
    return null;
  }

  setAuthTokens({ accessToken });
  return { accessToken };
};

const getRefreshAccessTokenPromise = () => {
  if (!refreshTokenPromise) {
    refreshTokenPromise = refreshAccessToken().finally(() => {
      refreshTokenPromise = null;
    });
  }

  return refreshTokenPromise;
};

// Interceptor: Trước khi gửi request, tự động đính kèm token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý response, đặc biệt là khi token hết hạn (401)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error?.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Nếu lỗi 401 (Unauthorized) và request chưa được thử lại
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await getRefreshAccessTokenPromise();
        if (refreshed?.accessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        clearAuthTokens();
        window.location.replace("/login");
        return Promise.reject(refreshError);
      }

      clearAuthTokens();
      window.location.replace("/login");
    }
    
    return Promise.reject(error);
  }
);
