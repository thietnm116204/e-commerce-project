import "./Button.css";

/**
 * Button - Shared reusable button component
 *
 * Props:
 * - variant   : "primary" (đỏ) | "outline" (trắng viền) — default: "primary"
 * - children  : nội dung bên trong nút
 * - onClick   : click handler
 * - type      : "button" | "submit" | "reset" — default: "button"
 * - disabled  : boolean
 * - className : extra class
 * - icon      : icon element bên trái text (optional)
 */
export default function Button({
  variant = "primary",
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant}${disabled ? " btn--disabled" : ""}${className ? ` ${className}` : ""}`}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
