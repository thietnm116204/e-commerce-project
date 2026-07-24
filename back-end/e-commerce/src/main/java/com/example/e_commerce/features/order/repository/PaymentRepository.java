package com.example.e_commerce.features.order.repository;

import com.example.e_commerce.features.order.entity.order.Order;
import com.example.e_commerce.features.order.entity.payment.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByOrder_OrderId(UUID orderId);
}
