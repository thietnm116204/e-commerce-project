import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal/Modal';
import Button from '../../../../shared/components/Button/Button';
import cashIcon from '../../../../assets/icons/cash.png';
import onlineShoppingIcon from '../../../../assets/icons/online-shopping.png';
import dinhviIcon from '../../../../assets/icons/dinhvi.png';
import phoneIcon from '../../../../assets/icons/notification.png';
import penIcon from '../../../../assets/icons/pen.png';
import './OrderModal.css';

export default function OrderModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [formData, setFormData] = useState({
        shippingAddress: '',
        receiverPhone: '',
        note: '',
        paymentMethod: 'CASH'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Thông tin giao hàng"
            size="md"
        >
            <form onSubmit={handleSubmit} className="order-modal-form">
                <div className="form-group">
                    <label className="form-label">
                        <img src={dinhviIcon} alt="" className="label-icon" />
                        Địa chỉ giao hàng <span className="text-danger">*</span>
                    </label>
                    <input 
                        type="text" 
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ nhận hàng..."
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">
                        <img src={phoneIcon} alt="" className="label-icon" />
                        Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input 
                        type="tel" 
                        name="receiverPhone"
                        value={formData.receiverPhone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại..."
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">
                        <img src={penIcon} alt="" className="label-icon" />
                        Ghi chú
                    </label>
                    <textarea 
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Ghi chú thêm cho đơn hàng..."
                        className="form-control"
                        rows="3"
                    ></textarea>
                </div>

                {/* ── Phương thức thanh toán ── */}
                <div className="form-group">
                    <label className="form-label">
                        <img src={cashIcon} alt="" className="label-icon" />
                        Phương thức thanh toán <span className="text-danger">*</span>
                    </label>
                    <div className="payment-method-options">
                        <label className={`payment-option ${formData.paymentMethod === 'CASH' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="CASH"
                                checked={formData.paymentMethod === 'CASH'}
                                onChange={handleChange}
                            />
                            <div className="payment-option__content">
                                <img src={cashIcon} alt="COD" className="payment-option__icon" />
                                <div>
                                    <p className="payment-option__title">Thanh toán khi nhận hàng</p>
                                    <p className="payment-option__desc">Trả tiền mặt cho shipper (COD)</p>
                                </div>
                            </div>
                        </label>

                        <label className={`payment-option ${formData.paymentMethod === 'VNPAY' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="VNPAY"
                                checked={formData.paymentMethod === 'VNPAY'}
                                onChange={handleChange}
                            />
                            <div className="payment-option__content">
                                <img src={onlineShoppingIcon} alt="VNPay" className="payment-option__icon" />
                                <div>
                                    <p className="payment-option__title">Thanh toán VNPay</p>
                                    <p className="payment-option__desc">Chuyển khoản / QR / Thẻ ngân hàng</p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {formData.paymentMethod === 'VNPAY' && (
                        <div className="payment-method-hint">
                            <img src={onlineShoppingIcon} alt="" style={{ width: 14, height: 14, objectFit: 'contain', opacity: 0.7 }} />
                            Bạn sẽ được chuyển sang cổng thanh toán VNPay sau khi xác nhận.
                        </div>
                    )}
                </div>

                <div className="order-modal-actions">
                    <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
