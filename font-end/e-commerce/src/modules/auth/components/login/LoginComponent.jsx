import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk, resetAuthState } from "../../store/authSlice";
import InputField from "../../../../shared/components/InputField";
import Button from "../../../../shared/components/Button";
import Toast from "../../../../shared/components/Toast";
import "./LoginComponent.css";
import hideIcon from "../../../../assets/icons/hide.png";
import visibleIcon from "../../../../assets/icons/visible.png";
import mailIcon from "../../../../assets/icons/mail.png";
import lockedIcon from "../../../../assets/icons/locked-computer.png";

export default function LoginComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, success, error, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const hasShownToast = useRef(false);

  useEffect(() => {
    if (location.state?.successMessage && !hasShownToast.current) {
      addToast("success", location.state.successMessage);
      hasShownToast.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Xử lý kết quả đăng nhập (thành công / thất bại)
  useEffect(() => {
    if (error) {
      addToast("error", error.message || "Đăng nhập thất bại.");
      dispatch(resetAuthState());
    }
    if (success && user) {
      dispatch(resetAuthState());
      // Kiểm tra role: nếu có ADMIN thì vào /admin, ngược lại vào /
      const roles = user.roleResponse || [];
      const isAdmin = roles.some((r) => r.roleName.toUpperCase().includes("ADMIN"));
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [success, error, user, navigate, dispatch]);

  // Reset state khi rời trang
  useEffect(() => {
    return () => { dispatch(resetAuthState()); };
  }, [dispatch]);


  const validate = () => {
    const e = { email: "", password: "" };
    if (!form.email.trim()) e.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Mật khẩu không được để trống";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const result = validate();
    if (result[name]) setErrors((p) => ({ ...p, [name]: result[name] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validate();
    setErrors(result);
    if (!result.email && !result.password) {
      // Backend yêu cầu userEmail và userPassword
      dispatch(loginThunk({ userEmail: form.email, userPassword: form.password }));
    }
  };

  return (
    <div className="login-page-bg">
    <div className="login-layout">
      {/* Bên trái — panel đỏ */}
      <div className="login-panel">
        {/* Decorative blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Dấu + và vòng trang trí */}
        <span className="deco deco-plus deco-plus-1">+</span>
        <span className="deco deco-plus deco-plus-2">+</span>
        <span className="deco deco-circle deco-circle-1" />
        <span className="deco deco-circle deco-circle-2" />
        <div className="deco-dots" />

        <div className="panel-content">
          <h1 className="panel-title">Chào mừng trở lại!</h1>
          <p className="panel-sub">
            Đăng nhập để tiếp tục mua sắm với tài khoản của bạn.
          </p>
        </div>
      </div>

      {/* Bên phải — form */}
      <div className="login-form-side">
        <div className="login-form-inner">
          <h2 className="login-form-title">Đăng nhập</h2>

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <InputField
              id="login-email"
              label="Email"
              name="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              icon={<img src={mailIcon} alt="mail" width={18} height={18} style={{ opacity: 0.5 }} />}
            />

            <InputField
              id="login-password"
              label="Mật khẩu"
              name="password"
              type={showPwd ? "text" : "password"}
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              icon={<img src={lockedIcon} alt="locked" width={18} height={18} style={{ opacity: 0.5 }} />}
              rightIcon={
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  <img
                    src={showPwd ? hideIcon : visibleIcon}
                    alt="toggle"
                    width={20}
                    height={20}
                  />
                </button>
              }
            />

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" /> Ghi nhớ tôi
              </label>
              <a href="#" className="forgot-link">Quên mật khẩu?</a>
            </div>

            <Button type="submit" variant="primary" className="login-btn-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="login-register-link">
            Chưa có tài khoản?{" "}
            <a onClick={() => navigate("/register")}>Tạo tài khoản</a>
          </p>
        </div>
      </div>

      {/* Toast notifications */}
      <div className="login-toast-container">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            type={t.type}
            message={t.message}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
