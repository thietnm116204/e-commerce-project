import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../../../shared/components/InputField";
import DatePickerField from "../../../../shared/components/DatePickerField";
import Button from "../../../../shared/components/Button";
import Toast from "../../../../shared/components/Toast";
import { registerThunk, resetAuthState } from "../../store/authSlice";
import "./RegisterComponent.css";
import hideIcon from "../../../../assets/icons/hide.png";
import visibleIcon from "../../../../assets/icons/visible.png";
import arrowIcon from "../../../../assets/icons/arrow.png";

// Quy tắc validate từng field
const makeRules = (form) => ({
  fullName: (v) => {
    if (!v.trim()) return "Họ và tên không được để trống";
    if (v.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
    return "";
  },
  dob: (v) => {
    if (!v) return "Ngày sinh không được để trống";
    return "";
  },
  phone: (v) => {
    if (!v.trim()) return "Số điện thoại không được để trống";
    if (!/^(0|\+84)[0-9]{9,10}$/.test(v.trim()))
      return "Số điện thoại không hợp lệ (VD: 0912345678)";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Email không được để trống";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      return "Email không hợp lệ";
    return "";
  },
  password: (v) => {
    if (!v) return "Mật khẩu không được để trống";
    if (v.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (v.length > 50) return "Mật khẩu không được quá 50 ký tự";
    return "";
  },
  confirmPassword: (v) => {
    if (!v) return "Vui lòng nhập lại mật khẩu";
    if (v !== form.password) return "Mật khẩu nhập lại không khớp";
    return "";
  },
});

// Chuyển yyyy-MM-dd (HTML date input) → dd/MM/yyyy (API yêu cầu)
const formatDateForApi = (dateStr) => {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

export default function RegisterComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, success, error: apiError } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    fullName: "", dob: "", phone: "", email: "",
    password: "", confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "", dob: "", phone: "", email: "",
    password: "", confirmPassword: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Map field name từ API → form field
  const API_FIELD_MAP = {
    userFullName: "fullName",
    userEmail: "email",
    userPhone: "phone",
    userDateBirth: "dob",
    userPassword: "password",
  };

  // Dịch message lỗi validation từ backend sang tiếng Việt
  const translateApiError = (field, msg = "") => {
    const m = msg.toLowerCase();
    if (m.includes("size must be between")) return `${field === "password" ? "Mật khẩu" : "Trường này"} phải từ 8–50 ký tự`;
    if (m.includes("must not be blank") || m.includes("required")) return "Không được để trống";
    if (m.includes("invalid email")) return "Email không hợp lệ";
    if (m.includes("invalid phone")) return "Số điện thoại không hợp lệ";
    return msg; // fallback giữ nguyên message server
  };

  // Chuyển hướng khi đăng ký thành công
  useEffect(() => {
    if (success) {
      dispatch(resetAuthState());
      navigate("/login", { state: { successMessage: "Đăng ký thành công! Vui lòng đăng nhập." } });
    }
  }, [success, navigate, dispatch]);

  // Xử lý lỗi từ API
  useEffect(() => {
    if (!apiError) return;
    if (apiError.type === "validation") {
      const fieldErrors = {};
      Object.entries(apiError.fields).forEach(([apiKey, msg]) => {
        const formKey = API_FIELD_MAP[apiKey];
        if (formKey) fieldErrors[formKey] = translateApiError(formKey, msg);
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      addToast("error", `Vui lòng kiểm tra lại thông tin đăng ký${apiError.status ? ` (${apiError.status})` : ""}.`);
    } else if (apiError.type === "app") {
      addToast("error", `${apiError.message}${apiError.status ? ` (${apiError.status})` : ""}`);
      if (apiError.raw) {
        console.error("Register API error:", apiError.raw);
      }
    }
  }, [apiError]);

  // Reset state khi rời trang
  useEffect(() => {
    return () => { dispatch(resetAuthState()); };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const rules = makeRules(form);
    if (rules[name]) setErrors((prev) => ({ ...prev, [name]: rules[name](value) }));
  };

  const handleSubmit = () => {
    // Validate toàn bộ form
    const rules = makeRules(form);
    const newErrors = {};
    let hasError = false;
    Object.keys(rules).forEach((key) => {
      const msg = rules[key](form[key]);
      newErrors[key] = msg;
      if (msg) hasError = true;
    });
    setErrors(newErrors);
    if (hasError) return;

    // Gọi API
    dispatch(
        registerThunk({
          userFullName: form.fullName.trim(),
          userEmail: form.email.trim(),
          userPhone: form.phone.trim(),
          userDateBirth: formatDateForApi(form.dob),
          userPassword: form.password,
        })
      );
  };

  return (
    <>
    <div className="register-section">
      <h2 className="register-section-title">Thông tin cá nhân</h2>
      <div className="register-row">
        <InputField
          label="Họ và tên" placeholder="Nhập họ và tên"
          name="fullName" value={form.fullName}
          onChange={handleChange} onBlur={handleBlur} error={errors.fullName}
        />
        <DatePickerField
          label="Ngày sinh" name="dob"
          value={form.dob} onChange={handleChange} error={errors.dob}
        />
        <InputField
          label="Số điện thoại" placeholder="Nhập số điện thoại"
          name="phone" type="tel" value={form.phone}
          onChange={handleChange} onBlur={handleBlur} error={errors.phone}
        />
        <InputField
          label="Email" placeholder="Nhập địa chỉ email"
          name="email" type="email" value={form.email}
          onChange={handleChange} onBlur={handleBlur} error={errors.email}
        />
      </div>

      <h2 className="register-section-title" style={{ marginTop: "24px" }}>Tạo mật khẩu</h2>
      <div className="register-row">
        <InputField
          label="Mật khẩu" placeholder="Nhập mật khẩu"
          name="password" type={showPwd ? "text" : "password"}
          value={form.password}
          onChange={handleChange} onBlur={handleBlur} error={errors.password}
          rightIcon={
            <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
              <img src={showPwd ? hideIcon : visibleIcon} alt="toggle" width={20} height={20} />
            </button>
          }
        />
        <InputField
          label="Nhập lại mật khẩu" placeholder="Nhập lại mật khẩu"
          name="confirmPassword" type={showConfirmPwd ? "text" : "password"}
          value={form.confirmPassword}
          onChange={handleChange} onBlur={handleBlur} error={errors.confirmPassword}
          rightIcon={
            <button type="button" className="pwd-toggle" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
              <img src={showConfirmPwd ? hideIcon : visibleIcon} alt="toggle" width={20} height={20} />
            </button>
          }
        />
      </div>

      <div className="register-actions">
        <Button
          variant="outline"
          onClick={() => navigate("/login")}
          icon={<img src={arrowIcon} alt="back" width={18} height={18} />}
        >
          Quay lại đăng nhập
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang đăng ký..." : "Hoàn tất đăng ký"}
        </Button>
      </div>
    </div>

    {/* Toast notifications */}
    <div className="register-toast-container">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          type={t.type}
          message={t.message}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
    </>
  );
}
