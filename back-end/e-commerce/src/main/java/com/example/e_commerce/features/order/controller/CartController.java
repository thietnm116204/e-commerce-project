package com.example.e_commerce.features.order.controller;


import com.example.e_commerce.features.order.dto.request.cart.AddToCartRequest;
import com.example.e_commerce.features.order.dto.request.cart.UpdateCartItemRequest;
import com.example.e_commerce.features.order.dto.response.cart.CartResponse;
import com.example.e_commerce.features.order.service.CartService;
import com.example.e_commerce.security.UserPrincipal;
import com.example.e_commerce.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequestMapping("/api/v1/cart")
@RestController
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody AddToCartRequest request
    ) {
        System.out.println("DEBUG: Reached addToCart with userId " + currentUser.getUserId());
        return ResponseEntity.ok(
                ApiResponse.<CartResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message("Thêm vào giỏ hàng thành công")
                        .data(cartService.addToCart(currentUser.getUserId(), request))
                        .build()
        );
    }
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        System.out.println("DEBUG: Reached getMyCart with userId " + currentUser.getUserId());
        CartResponse cartResponse = cartService.getMyCart(currentUser.getUserId());
        System.out.println("DEBUG: cartResponse = " + cartResponse);
        return ResponseEntity.ok(
                ApiResponse.<CartResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message("Lấy giỏ hàng thành công")
                        .data(cartResponse)
                        .build()
        );
    }

    @GetMapping("/admin/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CartResponse>> getCartByUserId(
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(
                ApiResponse.<CartResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message("Lấy giỏ hàng của user thành công")
                        .data(cartService.getCartByUserId(userId))
                        .build()
        );
    }
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID cartItemId
    ) {
        return ResponseEntity.ok(
                ApiResponse.<CartResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message("Xóa sản phẩm khỏi giỏ hàng thành công")
                        .data(cartService.removeCartItem(currentUser.getUserId(), cartItemId))
                        .build()
        );
    }
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<CartResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message("Cập nhật giỏ hàng thành công")
                        .data(cartService.updateCartItem(currentUser.getUserId(), cartItemId, request))
                        .build()
        );
    }


}
