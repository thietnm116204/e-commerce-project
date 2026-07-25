package com.example.e_commerce.features.order.service;

import com.example.e_commerce.features.order.dto.request.cart.AddToCartRequest;
import com.example.e_commerce.features.order.entity.order.Order;
import com.example.e_commerce.features.order.entity.order.OrderItem;
import com.example.e_commerce.features.order.repository.OrderRepository;
import com.example.e_commerce.features.order.repository.PaymentRepository;
import com.example.e_commerce.features.product.entity.Product;
import com.example.e_commerce.features.product.repository.ProductRepository;
import com.example.e_commerce.shared.status.OrderStatus;
import com.example.e_commerce.shared.status.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCancelHelper {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Transactional
    public void cancelOrder(Order order) {
        if (order.getOrderStatus() != OrderStatus.AWAITING_PAYMENT) {
            log.warn("Chỉ hủy đơn ở trạng thái AWAITING_PAYMENT. Đơn {} đang ở {}", order.getOrderId(), order.getOrderStatus());
            return;
        }

        log.info("Tiến hành hủy đơn {}, phục hồi tồn kho và giỏ hàng", order.getOrderId());

        // Cập nhật trạng thái đơn hàng
        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Cập nhật trạng thái thanh toán
        paymentRepository.findByOrder_OrderId(order.getOrderId()).ifPresent(payment -> {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        });

        // Phục hồi số lượng tồn kho và ném lại vào giỏ hàng
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();

            // 1. Phục hồi tồn kho
            product.setProductQuantity(product.getProductQuantity() + item.getQuantity());
            productRepository.save(product);

            // 2. Thêm lại vào giỏ hàng Redis
            AddToCartRequest cartReq = new AddToCartRequest();
            cartReq.setProductId(product.getProductId());
            cartReq.setQuantity(item.getQuantity());
            try {
                cartService.addToCart(order.getUser().getUserId(), cartReq);
            } catch (Exception e) {
                log.error("Không thể phục hồi sản phẩm {} vào giỏ hàng của user {}: {}", product.getProductId(), order.getUser().getUserId(), e.getMessage());
            }
        }
    }
}
