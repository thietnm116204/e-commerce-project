import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { registerApi, loginApi, getUserInfoApi } from "../api/authApi";
import { authApiClient, clearAuthTokens } from "../../../config/api";

const clearAuthState = (state) => {
  state.loading = false;
  state.success = false;
  state.error = null;
  state.user = null;
  state.token = null;
};

// ── Async Thunk ──────────────────────────────────────────────
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await registerApi(payload);
      return data;
    } catch (error) {
      const responseData = error?.response?.data;
      if (responseData && typeof responseData === "object" && !responseData.error && !responseData.message) {
        return rejectWithValue({
          type: "validation",
          fields: responseData,
          status: error?.response?.status,
        });
      }
      const message =
        responseData?.error ||
        responseData?.message ||
        (typeof responseData === "string" ? responseData : null) ||
        error?.message ||
        "Đăng ký thất bại.";
      return rejectWithValue({
        type: "app",
        message,
        status: error?.response?.status,
        raw: responseData,
      });
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      // 1. Gọi API đăng nhập để lấy token
      const loginData = await loginApi(payload);
      const authData = loginData?.data?.data ?? loginData?.data ?? loginData;
      const { accessToken } = authData || {};

      if (!accessToken) {
        return rejectWithValue({
          type: "app",
          message: "Phản hồi đăng nhập không hợp lệ từ máy chủ.",
        });
      }

      // 2. Lưu token vào localStorage
      localStorage.setItem("accessToken", accessToken);

      // 3. Dùng token đó lấy thông tin User & Role
      const userInfoResponse = await getUserInfoApi();
      const user = userInfoResponse.data;

      // 4. Trả về cả token lẫn user info cho Redux Store
      return { token: accessToken, user };
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || "Email hoặc mật khẩu không chính xác.";
      return rejectWithValue({ type: "app", message });
    }
  }
);

export const bootstrapAuthThunk = createAsyncThunk(
  "auth/bootstrap",
  async (_, { rejectWithValue }) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return null;
    }

    try {
      const userInfoResponse = await getUserInfoApi();
      return userInfoResponse.data;
    } catch (error) {
      clearAuthTokens();
      return rejectWithValue({
        type: "app",
        message: error?.response?.data?.message || "Phiên đăng nhập đã hết hạn.",
      });
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authApiClient.post("/auth/logout");
    return { revoked: true };
  } catch (error) {
    return { revoked: false, error: error?.response?.data ?? null };
  } finally {
    clearAuthTokens();
  }
});

// ── Slice ────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    success: false,
    error: null,
    user: null,    // Lưu thông tin người dùng (bao gồm role)
    token: localStorage.getItem("accessToken") || null,
    initialized: false,
  },
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bootstrap
      .addCase(bootstrapAuthThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(bootstrapAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload;
        state.token = localStorage.getItem("accessToken") || null;
      })
      .addCase(bootstrapAuthThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        clearAuthState(state);
        state.initialized = true;
      })
      .addCase(logout.rejected, (state) => {
        clearAuthState(state);
        state.initialized = true;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
