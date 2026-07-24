package com.example.e_commerce.features.order.repository;


import com.example.e_commerce.features.order.entity.cart.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    Optional<CartItem> findByCart_CartIdAndProduct_ProductId(UUID cartId, UUID productId);
    List<CartItem> findAllByCartItemIdIn(List<UUID> cartItemIds);
}