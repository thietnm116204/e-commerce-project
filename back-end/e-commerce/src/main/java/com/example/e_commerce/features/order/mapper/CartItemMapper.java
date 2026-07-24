package com.example.e_commerce.features.order.mapper;

import com.example.e_commerce.features.order.dto.response.cart.CartItemResponse;
import com.example.e_commerce.features.order.entity.cart.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface CartItemMapper {

    @Mapping(target = "productId", source = "product.productId")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "isActive", source = "product.isActive")
    @Mapping(target = "availableStock", source = "product.productQuantity")
    @Mapping(target = "productImageUrl", expression = "java(resolvePrimaryImage(cartItem))")
    @Mapping(target = "unitPrice", expression = "java(resolvePrice(cartItem))")
    @Mapping(target = "subtotal", expression = "java(resolvePrice(cartItem).multiply(java.math.BigDecimal.valueOf(cartItem.getQuantity())))")
    CartItemResponse toResponse(CartItem cartItem);

    default BigDecimal resolvePrice(CartItem cartItem) {
        var product = cartItem.getProduct();
        boolean hasSale = product.getProductSale() != null
                && product.getProductSale().compareTo(BigDecimal.ZERO) > 0;
        return hasSale ? product.getProductSale() : product.getProductPrice();
    }

    default String resolvePrimaryImage(CartItem cartItem) {
        var images = cartItem.getProduct().getImages();
        if (images == null || images.isEmpty()) return null;
        return images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(img -> img.getProductImageUrl())
                .orElse(images.get(0).getProductImageUrl());
    }
}