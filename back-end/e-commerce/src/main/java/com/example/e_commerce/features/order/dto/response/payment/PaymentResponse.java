package com.example.e_commerce.features.order.dto.response.payment;

import com.example.e_commerce.shared.status.PaymentMethod;
import com.example.e_commerce.shared.status.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID paymentId;
    private UUID orderId;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal amount;
    private LocalDateTime paidAt;
    /** Chỉ có giá trị khi paymentMethod = VNPAY — FE dùng để redirect sang cổng thanh toán */
    private String vnpayUrl;
}
