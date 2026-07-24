package com.example.e_commerce.features.order.service.impl;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.order.dto.request.cart.AddToCartRequest;
import com.example.e_commerce.features.order.dto.request.cart.UpdateCartItemRequest;
import com.example.e_commerce.features.order.dto.response.cart.CartItemResponse;
import com.example.e_commerce.features.order.dto.response.cart.CartResponse;
import com.example.e_commerce.features.order.service.CartService;
import com.example.e_commerce.features.product.entity.Product;
import com.example.e_commerce.features.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final ProductRepository productRepository;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String CART_KEY_PREFIX = "cart:";
    private static final Duration CART_TTL = Duration.ofDays(7);

    @Override
    public CartResponse addToCart(UUID userId, AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new RuntimeException("Sản phẩm '" + product.getProductName() + "' hiện không khả dụng");
        }

        String cartKey = getCartKey(userId);
        
        // Sử dụng HINCRBY để cộng dồn an toàn
        redisTemplate.opsForHash().increment(cartKey, request.getProductId().toString(), request.getQuantity());
        redisTemplate.expire(cartKey, CART_TTL);

        // Kiểm tra tồn kho sau khi cộng
        Object rawQuantity = redisTemplate.opsForHash().get(cartKey, request.getProductId().toString());
        if (rawQuantity != null) {
            int currentQuantity = Integer.parseInt(rawQuantity.toString());
            if (product.getProductQuantity() < currentQuantity) {
                // Revert nếu vượt số lượng tồn
                redisTemplate.opsForHash().increment(cartKey, request.getProductId().toString(), -request.getQuantity());
                throw new RuntimeException("Sản phẩm '" + product.getProductName() + "' không đủ số lượng tồn kho");
            }
        }

        return getMyCart(userId);
    }

    @Override
    public CartResponse getCartByUserId(UUID userId) {
        return getMyCart(userId);
    }

    @Override
    public CartResponse getMyCart(UUID userId) {
        String cartKey = getCartKey(userId);
        Map<Object, Object> cartEntries = redisTemplate.opsForHash().entries(cartKey);

        if (cartEntries.isEmpty()) {
            return CartResponse.builder()
                    .cartId(userId)
                    .items(new ArrayList<>())
                    .totalAmount(BigDecimal.ZERO)
                    .totalItems(0)
                    .build();
        }

        List<UUID> productIds = cartEntries.keySet().stream()
                .map(k -> UUID.fromString(k.toString()))
                .collect(Collectors.toList());

        List<Product> products = productRepository.findAllById(productIds);
        Map<UUID, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getProductId, p -> p));

        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        for (Map.Entry<Object, Object> entry : cartEntries.entrySet()) {
            UUID productId = UUID.fromString(entry.getKey().toString());
            int quantity = Integer.parseInt(entry.getValue().toString());

            Product product = productMap.get(productId);
            // Xóa khỏi giỏ nếu DB không còn
            if (product == null) {
                redisTemplate.opsForHash().delete(cartKey, productId.toString());
                continue;
            }

            BigDecimal unitPrice = product.getProductPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            String imageUrl = null;
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                imageUrl = product.getImages().get(0).getProductImageUrl();
            }

            CartItemResponse itemRes = CartItemResponse.builder()
                    .cartItemId(productId) // Trên Redis, cartItemId chính là productId
                    .productId(productId)
                    .productName(product.getProductName())
                    .productImageUrl(imageUrl)
                    .unitPrice(unitPrice)
                    .quantity(quantity)
                    .subtotal(subtotal)
                    .isActive(product.getIsActive())
                    .availableStock(product.getProductQuantity())
                    .build();

            items.add(itemRes);
            totalAmount = totalAmount.add(subtotal);
            totalItems += quantity;
        }

        return CartResponse.builder()
                .cartId(userId)
                .items(items)
                .totalAmount(totalAmount)
                .totalItems(totalItems)
                .build();
    }

    @Override
    public CartResponse removeCartItem(UUID userId, UUID cartItemId) {
        String cartKey = getCartKey(userId);
        redisTemplate.opsForHash().delete(cartKey, cartItemId.toString());
        return getMyCart(userId);
    }

    @Override
    public CartResponse updateCartItem(UUID userId, UUID cartItemId, UpdateCartItemRequest request) {
        Product product = productRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

        if (product.getProductQuantity() < request.getQuantity()) {
            throw new RuntimeException("Sản phẩm '" + product.getProductName() + "' không đủ số lượng tồn kho");
        }

        String cartKey = getCartKey(userId);
        redisTemplate.opsForHash().put(cartKey, cartItemId.toString(), String.valueOf(request.getQuantity()));
        redisTemplate.expire(cartKey, CART_TTL);

        return getMyCart(userId);
    }

    private String getCartKey(UUID userId) {
        return CART_KEY_PREFIX + userId.toString();
    }
}
