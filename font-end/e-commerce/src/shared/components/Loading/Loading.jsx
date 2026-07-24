import React from 'react';
import './Loading.css';

export default function Loading({ text = "Đang xử lý...", overlay = true }) {
    const containerClass = overlay ? "modern-loading-overlay" : "modern-loading-inline";

    return (
        <div className={containerClass}>
            <div className="modern-spinner"></div>
            {text && <div className="modern-loading-text">{text}</div>}
        </div>
    );
}
