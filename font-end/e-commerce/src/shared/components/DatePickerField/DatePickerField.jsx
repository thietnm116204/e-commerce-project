import { useRef } from "react";
import InputField from "../InputField";
import "./DatePickerField.css";

import calendarIcon from "../../../assets/icons/calendar.png";

/**
 * DatePickerField - Shared reusable date picker component
 *
 * Props:
 * - label     : label text above the input (e.g. "Ngày sinh", "Ngày đặt hàng")
 * - name      : input name & id attribute
 * - value     : controlled value (YYYY-MM-DD string)
 * - onChange  : (e) => void — called when date changes
 * - className : extra class for wrapper
 */
export default function DatePickerField({
  label,
  name,
  value = "",
  onChange,
  error,
  className = "",
}) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange({ target: { name, value: "" } });
  };

  return (
    <InputField
      label={label}
      type="date"
      name={name}
      value={value}
      inputRef={inputRef}
      onChange={onChange}
      error={error}
      className={`date-picker-field${value === "" ? " date-empty" : ""}${className ? ` ${className}` : ""}`}
      rightIcon={
        <span className="date-picker-icons">
          {value && (
            <button
              type="button"
              className="date-picker-clear"
              onClick={handleClear}
              aria-label="Xóa ngày"
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="date-picker-cal"
            onClick={() => inputRef.current?.showPicker()}
            aria-label="Mở lịch"
          >
            <img src={calendarIcon} alt="" width={18} height={18} />
          </button>
        </span>
      }
    />
  );
}
