import React from 'react';
import Modal from "./Modal";
import Button from "../Button/Button";
import "./ConfirmModal.css";
import binIcon from "../../../assets/icons/bin.png";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Bạn có chắc chắn?",
    message = "Hành động này không thể hoàn tác.",
    icon,
    confirmText = "Xóa",
    cancelText = "Hủy",
    confirmVariant = "danger",
    loading = false,
}) {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" hideHeader>
            <div className="confirm-modal">
                <div className="confirm-modal__header-content">
                    <div className={`confirm-modal__icon confirm-modal__icon--${confirmVariant}`}>
                        {icon ?? <img src={binIcon} alt="delete" style={{ width: '20px', height: '20px' }} />}
                    </div>
                    <div className="confirm-modal__text-content">
                        <h3 className="confirm-modal__title">{title}</h3>
                        {message && <p className="confirm-modal__message">{message}</p>}
                    </div>
                </div>
                <div className="confirm-modal__actions">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={confirmVariant === "danger" ? "primary" : "blue"}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

function DefaultTrashIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
            <path d="M10 11v6M14 11v6" />
        </svg>
    );
}