package com.example.e_commerce.features.order.service.impl;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.order.dto.request.order.BuyNowRequest;
import com.example.e_commerce.features.order.dto.request.order.CheckoutRequest;
import com.example.e_commerce.features.order.dto.request.payment.CreatePaymentUrlRequest;
import com.example.e_commerce.features.order.dto.request.payment.CreatePaymentUrlResponse;
import com.example.e_commerce.features.order.dto.response.order.OrderResponse;
import com.example.e_commerce.features.order.dto.response.payment.PaymentResponse;
import com.example.e_commerce.features.order.entity.cart.CartItem;
import com.example.e_commerce.features.order.entity.order.Order;
import com.example.e_commerce.features.order.entity.order.OrderItem;
import com.example.e_commerce.features.order.entity.payment.Payment;
import com.example.e_commerce.features.order.mapper.OrderMapper;
import com.example.e_commerce.features.order.repository.CartItemRepository;
import com.example.e_commerce.features.order.repository.OrderRepository;
import com.example.e_commerce.features.order.repository.PaymentRepository;
import com.example.e_commerce.features.order.service.OrderService;
import com.example.e_commerce.features.order.service.VnpayService;
import com.example.e_commerce.features.product.entity.Product;
import com.example.e_commerce.features.product.entity.ProductImage;
import com.example.e_commerce.features.product.repository.ProductRepository;
import com.example.e_commerce.features.user.entity.User;
import com.example.e_commerce.features.user.repository.UserRepository;
import com.example.e_commerce.shared.status.OrderStatus;
import com.example.e_commerce.shared.status.PaymentMethod;
import com.example.e_commerce.shared.status.PaymentStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderMapper orderMapper;
    private final VnpayService vnpayService;

    @Override
    @Transactional
    public PaymentResponse createOrder(UUID userId, CheckoutRequest request, String clientIp) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUD));

        List<CartItem> selectedItems = cartItemRepository.findAllByCartItemIdIn(request.getCartItemIds());

        if (selectedItems.isEmpty()) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        boolean belongsToUser = selectedItems.stream()
                .allMatch(ci -> ci.getCart().getUser().getUserId().equals(userId));
        if (!belongsToUser) {
            throw new AppException(ErrorCode.CART_ACCESS_DENIED);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : selectedItems) {
            Product product = productRepository.findByIdForUpdate(cartItem.getProduct().getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

            if (!Boolean.TRUE.equals(product.getIsActive())) {
                throw new RuntimeException(
                        "Sản phẩm '" + product.getProductName() + "' hiện không khả dụng");
            }

            if (product.getProductQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Sản phẩm '" + product.getProductName() + "' không đủ số lượng tồn kho");
            }

            product.setProductQuantity(product.getProductQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            boolean hasSale = product.getProductSale() != null
                    && product.getProductSale().compareTo(BigDecimal.ZERO) > 0;
            BigDecimal actualPrice = hasSale ? product.getProductSale() : product.getProductPrice();
            BigDecimal subtotal = actualPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productNameSnapshot(product.getProductName())
                    .productImageUrl(resolvePrimaryImage(product))
                    .unitPrice(actualPrice)
                    .quantity(cartItem.getQuantity())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
        }

        // Phân nhánh: CASH → PENDING ngay; VNPay → AWAITING_PAYMENT
        boolean isVnpay = request.getPaymentMethod() == PaymentMethod.VNPAY;
        OrderStatus initialStatus = isVnpay ? OrderStatus.AWAITING_PAYMENT : OrderStatus.PENDING;

        Order order = Order.builder()
                .user(currentUser)
                .totalAmount(totalAmount)
                .orderStatus(initialStatus)
                .paymentMethod(request.getPaymentMethod())
                .shippingAddress(request.getShippingAddress())
                .receiverPhone(request.getReceiverPhone())
                .note(request.getNote())
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        order.setOrderItems(orderItems);

        Order saved = orderRepository.save(order);

        cartItemRepository.deleteAll(selectedItems);

        Payment payment = Payment.builder()
                .order(saved)
                .paymentMethod(saved.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .amount(saved.getTotalAmount())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Với VNPay: tạo ngay payment URL để trả về FE
        String vnpayUrl = null;
        if (isVnpay) {
            CreatePaymentUrlRequest urlReq = new CreatePaymentUrlRequest();
            urlReq.setOrderId(saved.getOrderId());
            CreatePaymentUrlResponse urlRes = vnpayService.createPaymentUrl(userId, urlReq, clientIp);
            vnpayUrl = urlRes.getPaymentUrl();
        }

        return PaymentResponse.builder()
                .paymentId(savedPayment.getPaymentId())
                .orderId(saved.getOrderId())
                .paymentMethod(savedPayment.getPaymentMethod())
                .paymentStatus(savedPayment.getPaymentStatus())
                .amount(savedPayment.getAmount())
                .paidAt(savedPayment.getPaidAt())
                .vnpayUrl(vnpayUrl)
                .build();
    }

    @Override
    public Page<OrderResponse> getMyOrdersByStatus(UUID userId, OrderStatus status, Pageable pageable) {
        return orderRepository.findByUser_UserIdAndOrderStatus(userId, status, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Transactional
    public PaymentResponse buyNow(UUID userId, BuyNowRequest request, String clientIp) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUD));

        Product product = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

        OrderItem orderItem = buildOrderItem(product, request.getQuantity());

        // Phân nhánh: CASH → PENDING ngay; VNPay → AWAITING_PAYMENT
        boolean isVnpay = request.getPaymentMethod() == PaymentMethod.VNPAY;
        OrderStatus initialStatus = isVnpay ? OrderStatus.AWAITING_PAYMENT : OrderStatus.PENDING;

        Order order = Order.builder()
                .user(currentUser)
                .totalAmount(orderItem.getSubtotal())
                .orderStatus(initialStatus)
                .paymentMethod(request.getPaymentMethod())
                .shippingAddress(request.getShippingAddress())
                .receiverPhone(request.getReceiverPhone())
                .note(request.getNote())
                .build();

        orderItem.setOrder(order);
        order.setOrderItems(List.of(orderItem));

        Order saved = orderRepository.save(order);

        Payment payment = Payment.builder()
                .order(saved)
                .paymentMethod(saved.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .amount(saved.getTotalAmount())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Với VNPay: tạo ngay payment URL để trả về FE
        String vnpayUrl = null;
        if (isVnpay) {
            CreatePaymentUrlRequest urlReq = new CreatePaymentUrlRequest();
            urlReq.setOrderId(saved.getOrderId());
            CreatePaymentUrlResponse urlRes = vnpayService.createPaymentUrl(userId, urlReq, clientIp);
            vnpayUrl = urlRes.getPaymentUrl();
        }

        return PaymentResponse.builder()
                .paymentId(savedPayment.getPaymentId())
                .orderId(saved.getOrderId())
                .paymentMethod(savedPayment.getPaymentMethod())
                .paymentStatus(savedPayment.getPaymentStatus())
                .amount(savedPayment.getAmount())
                .paidAt(savedPayment.getPaidAt())
                .vnpayUrl(vnpayUrl)
                .build();
    }

    @Override
    @Transactional
    public void cancelOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUD));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ORDER_ACCESS_DENIED);
        }

        if (order.getOrderStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang ở trạng thái chờ thanh toán");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        paymentRepository.findByOrder_OrderId(orderId).ifPresent(payment -> {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        });
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private String resolvePrimaryImage(Product product) {
        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }
        return product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getProductImageUrl)
                .orElse(product.getImages().get(0).getProductImageUrl());
    }

    private OrderItem buildOrderItem(Product product, Integer quantity) {

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new RuntimeException(
                    "Sản phẩm '" + product.getProductName() + "' hiện không khả dụng");
        }

        if (product.getProductQuantity() < quantity) {
            throw new RuntimeException(
                    "Sản phẩm '" + product.getProductName() + "' không đủ số lượng tồn kho");
        }

        product.setProductQuantity(product.getProductQuantity() - quantity);
        productRepository.save(product);

        boolean hasSale = product.getProductSale() != null
                && product.getProductSale().compareTo(BigDecimal.ZERO) > 0;
        BigDecimal actualPrice = hasSale ? product.getProductSale() : product.getProductPrice();
        BigDecimal subtotal = actualPrice.multiply(BigDecimal.valueOf(quantity));

        return OrderItem.builder()
                .product(product)
                .productNameSnapshot(product.getProductName())
                .productImageUrl(resolvePrimaryImage(product))
                .unitPrice(actualPrice)
                .quantity(quantity)
                .subtotal(subtotal)
                .build();
    }
}
