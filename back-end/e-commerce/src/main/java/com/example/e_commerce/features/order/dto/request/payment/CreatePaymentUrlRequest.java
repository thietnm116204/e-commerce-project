package com.example.e_commerce.features.order.dto.request.payment;

import lombok.Data;

import java.util.UUID;

@Data
public class CreatePaymentUrlRequest {
    private UUID orderId;
}
