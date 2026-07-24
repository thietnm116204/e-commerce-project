package com.example.e_commerce.features.order.service;

import com.example.e_commerce.features.order.entity.order.Order;
import com.example.e_commerce.features.order.repository.OrderRepository;
import com.example.e_commerce.features.order.repository.PaymentRepository;
import com.example.e_commerce.shared.status.OrderStatus;
import com.example.e_commerce.shared.status.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler tự động hủy đơn hàng VNPay quá hạn.
 *
 * <p>VNPay cho phép user thanh toán trong 15 phút. Nếu sau 15 phút đơn vẫn ở
 * trạng thái AWAITING_PAYMENT (chưa nhận được IPN thành công), scheduler này
 * sẽ chuyển đơn sang CANCELLED để tránh đơn "treo" vô thời hạn.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderExpiryScheduler {

    /** Thời gian hết hạn — đồng bộ với vnp_ExpireDate trong VnpayServiceImpl (15 phút) */
    private static final int EXPIRE_MINUTES = 15;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Chạy mỗi 5 phút, tìm đơn AWAITING_PAYMENT đã tồn tại > 15 phút và hủy chúng.
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000) // mỗi 5 phút
    @Transactional
    public void cancelExpiredOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(EXPIRE_MINUTES);

        List<Order> expiredOrders = orderRepository
                .findByOrderStatusAndCreatedAtBefore(OrderStatus.AWAITING_PAYMENT, cutoff);

        if (expiredOrders.isEmpty()) {
            return;
        }

        log.info("[OrderExpiryScheduler] Tìm thấy {} đơn hàng VNPay hết hạn, tiến hành hủy...",
                expiredOrders.size());

        for (Order order : expiredOrders) {
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            paymentRepository.findByOrder_OrderId(order.getOrderId()).ifPresent(payment -> {
                if (payment.getPaymentStatus() == PaymentStatus.PENDING) {
                    payment.setPaymentStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                }
            });

            log.info("[OrderExpiryScheduler] Đã hủy đơn hàng hết hạn: {}", order.getOrderId());
        }
    }
}
