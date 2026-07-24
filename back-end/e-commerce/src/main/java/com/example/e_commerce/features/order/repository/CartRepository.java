package com.example.e_commerce.features.order.repository;

import com.example.e_commerce.features.order.entity.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems ci LEFT JOIN FETCH ci.product WHERE c.user.userId = :userId ORDER BY ci.createdAt DESC")
    Optional<Cart> findByUserIdWithItems(@Param("userId") UUID userId);

    Optional<Cart> findByUser_UserId(UUID userId);
}