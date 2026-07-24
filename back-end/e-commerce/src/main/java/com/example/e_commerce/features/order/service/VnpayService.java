package com.example.e_commerce.features.order.service;

import com.example.e_commerce.features.order.dto.request.payment.CreatePaymentUrlRequest;
import com.example.e_commerce.features.order.dto.request.payment.CreatePaymentUrlResponse;

import java.util.Map;
import java.util.UUID;

public interface VnpayService {
    CreatePaymentUrlResponse createPaymentUrl(UUID userId, CreatePaymentUrlRequest request, String clientIp);
    String handleReturn(Map<String, String> vnpParams);
    Map<String, String> handleIpn(Map<String, String> vnpParams);
}
