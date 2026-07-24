import { useState } from "react";
import "./InputField.css";

/**
 * InputField - Shared reusable input component
 *
 * Props:
 * - type       : input type (default: "text")
 * - placeholder: placeholder text
 * - value      : controlled value
 * - onChange   : change handler
 * - label      : optional label above the input
 * - name       : input name attribute
 * - id         : input id attribute
 * - disabled   : boolean
 * - error       : error message string
 * - icon        : optional icon element displayed on the left
 * - rightIcon   : optional icon element displayed on the right
 * - className  : extra class names for the wrapper
 */
export default function InputField({
  type = "text",
  placeholder = "",
  value,
  onChange,
  label,
  name,
  id,
  disabled = false,
  error,
  icon,
  rightIcon,
  inputRef,
  className = "",
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`input-field-wrapper ${className}`}>
      {label && (
        <label htmlFor={id || name} className="input-field-label">
          {label}
        </label>
      )}

      <div
        className={`input-field-container ${focused ? "focused" : ""} ${error ? "has-error" : ""
          } ${disabled ? "disabled" : ""}`}
      >
        {icon && <span className="input-field-icon left-icon">{icon}</span>}

        <input
          ref={inputRef}
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field-element"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {rightIcon && (
          <span className="input-field-icon right-icon">{rightIcon}</span>
        )}
      </div>

      {error && <span className="input-field-error">{error}</span>}
    </div>
  );
}
