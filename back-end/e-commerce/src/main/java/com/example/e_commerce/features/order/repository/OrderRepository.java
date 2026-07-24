package com.example.e_commerce.features.order.repository;

import com.example.e_commerce.features.order.entity.order.Order;
import com.example.e_commerce.shared.status.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUser_UserId(UUID userId, Pageable pageable);
    Page<Order> findByUser_UserIdAndOrderStatus(UUID userId, OrderStatus orderStatus, Pageable pageable);

    /** Dùng cho Scheduler: tìm đơn AWAITING_PAYMENT quá thời gian cho phép */
    List<Order> findByOrderStatusAndCreatedAtBefore(OrderStatus orderStatus, LocalDateTime cutoff);
}
