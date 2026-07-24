import React from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, footer, children, size = "md", hideHeader = false }) {
    if (!isOpen) return null;

    return (
        <div className="adm-modal-overlay" onClick={onClose}>
            <div
                className={`adm-modal adm-modal--${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                {!hideHeader && (
                    <div className="adm-modal-header">
                        <h3>{title}</h3>
                        <button className="adm-modal-close" onClick={onClose}>×</button>
                    </div>
                )}
                <div className="adm-modal-body">{children}</div>
                {footer && <div className="adm-modal-footer">{footer}</div>}
            </div>
        </div>
    );
}