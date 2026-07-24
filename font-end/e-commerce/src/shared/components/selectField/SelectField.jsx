import { useState, useRef, useEffect } from "react";
import downArrow from "../../../assets/icons/down-arrow.png";
import upArrow from "../../../assets/icons/arrow-up.png";
import "./SelectField.css";

export default function SelectField({
    id,
    name,
    label,
    value,
    onChange,
    options = [],
    placeholder = "— Vui lòng chọn —",
    required = false,
    hint,
    error,
    disabled = false,
    clearable = true,
    className = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (onChange) {
            // Giả lập event giống thẻ select native
            onChange({ target: { name, value: optionValue } });
        }
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (onChange) {
            onChange({ target: { name, value: "" } });
        }
    };

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={`select-field ${className}`} ref={wrapperRef}>
            {label && (
                <label htmlFor={id} className="select-field__label">
                    {label}
                    {required && <span className="select-field__required">*</span>}
                </label>
            )}

            <div
                className={`select-field__control ${isOpen ? "select-field__control--open" : ""} ${error ? "select-field__control--error" : ""} ${disabled ? "select-field__control--disabled" : ""}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className={`select-field__value ${!selectedOption ? "select-field__value--placeholder" : ""}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </div>
                <div className="select-field__actions">
                    {clearable && value && !disabled && (
                        <button
                            type="button"
                            className="select-field__clear"
                            onClick={handleClear}
                            aria-label="Xóa lựa chọn"
                        >
                            ×
                        </button>
                    )}
                    <div className="select-field__icon">
                        <img 
                            src={isOpen ? upArrow : downArrow} 
                            alt="toggle" 
                            className="select-field__chevron" 
                        />
                    </div>
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="select-field__menu">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`select-field__option ${value === opt.value ? "select-field__option--selected" : ""}`}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}

            {error && <div className="select-field__error-text">{error}</div>}
            {hint && !error && <div className="select-field__hint">{hint}</div>}
        </div>
    );
}
