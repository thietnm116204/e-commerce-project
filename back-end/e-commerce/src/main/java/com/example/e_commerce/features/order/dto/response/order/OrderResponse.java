package com.example.e_commerce.features.order.dto.response.order;

import com.example.e_commerce.shared.status.OrderStatus;
import com.example.e_commerce.shared.status.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {
    private UUID orderId;
    private BigDecimal totalAmount;
    private OrderStatus orderStatus;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private String receiverPhone;
    private String note;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
