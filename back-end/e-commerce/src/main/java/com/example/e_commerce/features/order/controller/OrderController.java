package com.example.e_commerce.features.order.controller;

import com.example.e_commerce.features.order.dto.request.order.BuyNowRequest;
import com.example.e_commerce.features.order.dto.request.order.CheckoutRequest;
import com.example.e_commerce.features.order.dto.response.order.OrderResponse;
import com.example.e_commerce.features.order.dto.response.payment.PaymentResponse;
import com.example.e_commerce.features.order.service.OrderService;
import com.example.e_commerce.security.UserPrincipal;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import com.example.e_commerce.shared.status.OrderStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

@RequestMapping("/api/v1")
@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;


    @PostMapping("/orders/checkout")
    public ResponseEntity<ApiResponse<PaymentResponse>> checkout(
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpServletRequest,
            @Valid @RequestBody CheckoutRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PaymentResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATED_ORDER)
                        .data(orderService.createOrder(currentUser.getUserId(), request, httpServletRequest.getRemoteAddr()))
                        .build()
        );
    }
    @GetMapping("/orders/my-orders/status")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrdersByStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam OrderStatus status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                ApiResponse.<Page<OrderResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_ORDER)
                        .data(orderService.getMyOrdersByStatus(currentUser.getUserId(), status, pageable))
                        .build()
        );
    }
    @PostMapping("/orders/buy-now")
    public ResponseEntity<ApiResponse<PaymentResponse>> buyNow(
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpServletRequest,
            @Valid @RequestBody BuyNowRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PaymentResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATED_ORDER)
                        .data(orderService.buyNow(currentUser.getUserId(), request, httpServletRequest.getRemoteAddr()))
                        .build()
        );
    }

    /**
     * Hủy đơn hàng đang ở trạng thái AWAITING_PAYMENT (user chủ động hủy thanh toán VNPay).
     */
    @PatchMapping("/orders/{orderId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID orderId
    ) {
        orderService.cancelOrder(currentUser.getUserId(), orderId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(HttpStatus.OK.value())
                        .message("Đã hủy đơn hàng thành công")
                        .build()
        );
    }

}
