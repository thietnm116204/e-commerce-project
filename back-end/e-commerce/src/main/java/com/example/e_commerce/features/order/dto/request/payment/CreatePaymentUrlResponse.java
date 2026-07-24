package com.example.e_commerce.features.order.dto.request.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreatePaymentUrlResponse {
    private String paymentUrl;

}
