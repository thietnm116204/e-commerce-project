import { useCallback, useEffect, useState } from "react";
import "./Toast.css";

import acceptIcon from "../../../assets/icons/accept.png";
import crossIcon from "../../../assets/icons/cross.png";
import applicationIcon from "../../../assets/icons/application.png";

/**
 * Toast Component
 *
 * Props:
 * - type: "success" | "error"
 * - message: string
 * - onClose: function to call when toast should be removed
 * - duration: auto-close time in ms (default 3000)
 */
export default function Toast({ type = "success", message, onClose, duration = 3000 }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for animation to finish before calling onClose
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const isSuccess = type === "success";

  return (
    <div className={`toast toast--${type} ${isClosing ? "toast--closing" : ""}`}>
      <div className="toast-content">
        <div className="toast-icon">
          <img src={isSuccess ? acceptIcon : crossIcon} alt={isSuccess ? "Success" : "Error"} width={24} height={24} />
        </div>
        <div className="toast-message">
          <span className="toast-title">{isSuccess ? "Success: " : "Error: "}</span>
          {message}
        </div>
        <button className="toast-close" onClick={handleClose}>
          <img src={applicationIcon} alt="Close" width={16} height={16} />
        </button>
      </div>
      <div 
        className="toast-progress" 
        style={{ animationDuration: `${duration}ms` }}
      ></div>
    </div>
  );
}
