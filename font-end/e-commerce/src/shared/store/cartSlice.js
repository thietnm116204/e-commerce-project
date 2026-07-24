import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartApi } from "../../modules/home/api/cartApi";

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const res = await cartApi.getCart();
    // Support either { items: [...] } or direct array [...] or { data: [...] }
    let items = [];
    if (res?.data) {
      if (Array.isArray(res.data)) items = res.data;
      else if (Array.isArray(res.data.items)) items = res.data.items;
      else if (Array.isArray(res.data.content)) items = res.data.content;
    }
    return items;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Lỗi lấy giỏ hàng");
  }
});

export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      // payload expects { productId, quantity }
      await cartApi.addToCart(payload);
      // Re-fetch cart so UI updates
      dispatch(fetchCart());
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi thêm giỏ hàng");
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCartAsync",
  async (itemId, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.removeFromCart(itemId);
      dispatch(fetchCart());
      return itemId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi xóa giỏ hàng");
    }
  }
);

export const updateQuantityAsync = createAsyncThunk(
  "cart/updateQuantityAsync",
  async ({ itemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      // If backend has an update quantity endpoint
      await cartApi.updateCartItem(itemId, { quantity });
      dispatch(fetchCart());
      return { itemId, quantity };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi cập nhật số lượng");
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.clearCart();
      dispatch(fetchCart());
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi xóa toàn bộ giỏ hàng");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: { 
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Do not clear items on error to prevent flashing empty cart if user is not logged in temporarily
      })
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectCartItems = (state) => state.cart.items || [];
export const selectCartCount = (state) =>
  (state.cart.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
export const selectCartTotal = (state) =>
  (state.cart.items || []).reduce((sum, i) => sum + ((i.unitPrice || i.productPrice || 0) * (i.quantity || 1)), 0);

export default cartSlice.reducer;
