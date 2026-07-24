package com.example.e_commerce.features.order.controller;

import com.example.e_commerce.features.order.dto.request.payment.CreatePaymentUrlRequest;
import com.example.e_commerce.features.order.dto.request.payment.CreatePaymentUrlResponse;
import com.example.e_commerce.features.order.service.VnpayService;
import com.example.e_commerce.security.UserPrincipal;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import com.example.e_commerce.shared.utils.VnpayUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments/vnpay")
@RequiredArgsConstructor
public class VnpayController {

    private final VnpayService vnpayService;

    @PostMapping("/create-payment-url")
    public ResponseEntity<ApiResponse<CreatePaymentUrlResponse>> createPaymentUrl(
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpServletRequest,
            @Valid @RequestBody CreatePaymentUrlRequest request
    ) {
        String clientIp = VnpayUtils.getClientIp(httpServletRequest);

        return ResponseEntity.ok(
                ApiResponse.<CreatePaymentUrlResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATE_PAYMENT_URL)
                        .data(vnpayService.createPaymentUrl(currentUser.getUserId(), request, clientIp))
                        .build()
        );
    }

    /**
     * VNPay redirect trình duyệt của user về đây sau khi thanh toán.
     * Endpoint này KHÔNG có JWT (user đến thẳng từ VNPay) -> phải permitAll() trong SecurityConfig,
     * và không bọc ApiResponse vì đây là redirect, không phải JSON response.
     */
    @GetMapping("/return")
    public void vnpayReturn(@RequestParam Map<String, String> allParams,
                            HttpServletResponse response) throws IOException {
        String redirectUrl = vnpayService.handleReturn(allParams);
        response.sendRedirect(redirectUrl);
    }

    /**
     * VNPay server gọi thẳng đến endpoint này (server-to-server) để xác nhận giao dịch.
     * Không có JWT -> phải permitAll(). Không bọc ApiResponse vì VNPay yêu cầu đúng format
     * {"RspCode": "...", "Message": "..."} để họ parse, không phải format ApiResponse của hệ thống.
     */
    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> allParams) {
        return ResponseEntity.ok(vnpayService.handleIpn(allParams));
    }
}