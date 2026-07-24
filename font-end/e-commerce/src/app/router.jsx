import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import HomePage from '../modules/home/pages/home/HomePage'
import RegisterPage from '../modules/auth/pages/register/RegisterPage'
import LoginPage from '../modules/auth/pages/login/LoginPage'
import AdminLayout from '../modules/admin/layouts/AdminLayout'
import DashboardPage from '../modules/admin/pages/dashboard/DashboardPage'
import CategoryInfoPage from '../modules/admin/pages/product_category/CategoryInfoPage'
import BrandInfoPage from '../modules/admin/pages/product_category/BrandInfoPage'
import ProductCreatePage from '../modules/admin/pages/product_management/ProductCreatePage'
import ProductInfoPage from '../modules/admin/pages/product_management/ProductInfoPage'
import ProductUpdatePage from '../modules/admin/pages/product_management/ProductUpdatePage'
import ProductPage from '../modules/home/pages/product/ProductPage'
import ProductDetailPage from '../modules/home/pages/product-detail/ProductDetailPage'
import CartPage from '../modules/home/pages/cart/CartPage'
import OrderPage from '../modules/home/pages/order/OrderPage'
import VnpayReturnPage from '../modules/home/pages/payment/VnpayReturnPage'
import { bootstrapAuthThunk } from '../modules/auth/store/authSlice'

/** Bảo vệ route — yêu cầu đăng nhập */
function RequireAuth({ children }) {
  const { token, initialized } = useSelector((state) => state.auth);
  if (!initialized) return null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/** Bảo vệ route — yêu cầu quyền Admin */
function RequireAdmin({ children }) {
  const { user, token, initialized } = useSelector((state) => state.auth);
  if (!initialized) return null;
  if (!token) return <Navigate to="/login" replace />;

  const roles = user?.roleResponse || [];
  const isAdmin = roles.some((role) => role?.roleName?.toUpperCase() === 'ADMIN');
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

export default function AppRouter() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bootstrapAuthThunk());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderPage />} />
        {/* Route public cho VNPay redirect — không cần JWT */}
        <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Admin routes — layout dùng chung, pages render qua Outlet ── */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          {/* /admin → Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* /admin/category/... */}
          <Route path="category/info" element={<CategoryInfoPage />} />
          <Route path="category/brand" element={<BrandInfoPage />} />

          {/* /admin/product_management/... */}
          <Route path="product_management/create" element={<ProductCreatePage />} />
          <Route path="product_management/info" element={<ProductInfoPage />} />
          <Route path="product_management/update/:productId" element={<ProductUpdatePage />} />

          {/* Fallback trong admin → về dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Fallback toàn cục */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
