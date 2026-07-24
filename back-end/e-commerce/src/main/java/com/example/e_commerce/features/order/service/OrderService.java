package com.example.e_commerce.features.order.service;

import com.example.e_commerce.features.order.dto.request.order.BuyNowRequest;
import com.example.e_commerce.features.order.dto.request.order.CheckoutRequest;
import com.example.e_commerce.features.order.dto.response.order.OrderResponse;
import com.example.e_commerce.features.order.dto.response.payment.PaymentResponse;
import com.example.e_commerce.shared.status.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface OrderService {
    PaymentResponse createOrder(UUID userId, CheckoutRequest request, String clientIp);
    Page<OrderResponse> getMyOrdersByStatus(UUID userId, OrderStatus status, Pageable pageable);
    PaymentResponse buyNow(UUID userId, BuyNowRequest request, String clientIp);
    /** Hủy đơn hàng đang ở trạng thái AWAITING_PAYMENT (do user chủ động hủy hoặc hết hạn) */
    void cancelOrder(UUID userId, UUID orderId);
}
