package com.example.e_commerce.shared.status;

public enum OrderStatus {
    AWAITING_PAYMENT, // VNPay: đơn đã tạo, chờ xác nhận IPN từ VNPay
    PENDING,          // Đơn chờ xử lý/giao hàng (CASH ngay, VNPay sau IPN thành công)
    CONFIRMED,
    SHIPPING,
    DELIVERED,
    CANCELLED
}