package com.example.e_commerce.features.order.service;

import com.example.e_commerce.features.order.dto.request.cart.AddToCartRequest;
import com.example.e_commerce.features.order.dto.request.cart.UpdateCartItemRequest;
import com.example.e_commerce.features.order.dto.response.cart.CartResponse;

import java.util.UUID;

public interface CartService {
    CartResponse addToCart(UUID userId, AddToCartRequest request);
    CartResponse getCartByUserId(UUID userId);
    CartResponse getMyCart(UUID userId);
    CartResponse removeCartItem(UUID userId, UUID cartItemId);
    CartResponse updateCartItem(UUID userId, UUID cartItemId, UpdateCartItemRequest request);

}
