package com.example.e_commerce.features.order.service.impl;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.order.dto.request.payment.CreatePaymentUrlRequest;
import com.example.e_commerce.features.order.dto.request.payment.CreatePaymentUrlResponse;
import com.example.e_commerce.features.order.entity.order.Order;
import com.example.e_commerce.features.order.entity.payment.Payment;
import com.example.e_commerce.features.order.entity.payment.VnpayProperties;
import com.example.e_commerce.features.order.repository.OrderRepository;
import com.example.e_commerce.features.order.repository.PaymentRepository;
import com.example.e_commerce.features.order.service.VnpayService;
import com.example.e_commerce.shared.status.OrderStatus;
import com.example.e_commerce.shared.status.PaymentMethod;
import com.example.e_commerce.shared.status.PaymentStatus;
import com.example.e_commerce.shared.utils.VnpayUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnpayServiceImpl implements VnpayService {

    private static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VNPAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final VnpayProperties vnpayProperties;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public CreatePaymentUrlResponse createPaymentUrl(UUID userId, CreatePaymentUrlRequest request, String clientIp) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUD));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ORDER_ACCESS_DENIED);
        }

        if (order.getOrderStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new RuntimeException("Đơn hàng không ở trạng thái chờ thanh toán (AWAITING_PAYMENT)");
        }

        if (order.getPaymentMethod() != PaymentMethod.VNPAY) {
            throw new RuntimeException("Đơn hàng này không sử dụng phương thức thanh toán VNPay");
        }

        Payment payment = paymentRepository.findByOrder_OrderId(order.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUD));

        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Đơn hàng đã được thanh toán");
        }

        LocalDateTime now = LocalDateTime.now(VNPAY_ZONE);
        String txnRef = VnpayUtils.toTxnRef(order.getOrderId());

        TreeMap<String, String> params = new TreeMap<>();
        log.info("=== VNPAY DEBUG INFO ===");
        log.info("TmnCode đang sử dụng: {}", vnpayProperties.getTmnCode());
        log.info("HashSecret đang sử dụng: {}", vnpayProperties.getHashSecret());
        log.info("========================");
        
        params.put("vnp_Version", defaultValue(vnpayProperties.getVersion(), "2.1.0"));
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", requireConfig(vnpayProperties.getTmnCode(), "vnpay.tmn-code"));
        params.put("vnp_Amount", toVnpAmount(order.getTotalAmount()));
        params.put("vnp_CurrCode", defaultValue(vnpayProperties.getCurrCode(), "VND"));
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "ThanhToanDonHang" + txnRef);
        params.put("vnp_OrderType", defaultValue(vnpayProperties.getOrderType(), "other"));
        params.put("vnp_Locale", defaultValue(vnpayProperties.getLocale(), "vn"));
        params.put("vnp_ReturnUrl", requireConfig(vnpayProperties.getReturnUrl(), "vnpay.return-url"));
        params.put("vnp_IpAddr", defaultClientIp(clientIp));
        params.put("vnp_CreateDate", now.format(VNP_DATE_FORMAT));
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(VNP_DATE_FORMAT));

        String hashData = VnpayUtils.buildQueryString(params);
        String secureHash = VnpayUtils.hmacSHA512(requireConfig(vnpayProperties.getHashSecret(), "vnpay.hash-secret"), hashData);
        String query = hashData + "&vnp_SecureHash=" + secureHash;

        String paymentUrl = requireConfig(vnpayProperties.getPayUrl(), "vnpay.pay-url") + "?" + query;

        return CreatePaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .build();
    }

    @Override
    @Transactional
    public String handleReturn(Map<String, String> vnpParams) {
        VerificationResult result = verifyAndProcess(vnpParams);

        String status = result.success ? "success" : "failed";
        String message = URLEncoder.encode(result.message, StandardCharsets.UTF_8);

        String frontendUrl = vnpayProperties.getFrontendReturnUrl();
        if (frontendUrl == null || frontendUrl.isBlank()) {
            frontendUrl = "http://localhost:5173/payment/vnpay-return";
        }
        StringBuilder redirect = new StringBuilder(frontendUrl);
        redirect.append(frontendUrl.contains("?") ? "&" : "?");
        redirect.append("status=").append(status);
        if (result.orderId != null) {
            redirect.append("&orderId=").append(result.orderId);
        }
        redirect.append("&message=").append(message);

        return redirect.toString();
    }

    @Override
    @Transactional
    public Map<String, String> handleIpn(Map<String, String> vnpParams) {
        VerificationResult result = verifyAndProcess(vnpParams);

        Map<String, String> response = new HashMap<>();
        response.put("RspCode", result.rspCode);
        response.put("Message", result.message);
        return response;
    }

    private VerificationResult verifyAndProcess(Map<String, String> vnpParams) {
        String inputHash = vnpParams.get("vnp_SecureHash");
        if (inputHash == null || inputHash.isBlank()) {
            log.warn("VNPay callback: thiếu vnp_SecureHash");
            return new VerificationResult("97", "Thiếu chữ ký (Missing signature)", null, false);
        }

        TreeMap<String, String> filteredParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value == null || value.isBlank() || "vnp_SecureHash".equals(key) || "vnp_SecureHashType".equals(key)) {
                continue;
            }
            filteredParams.put(key, value);
        }

        String hashData = VnpayUtils.buildQueryString(filteredParams);
        String calculatedHash = VnpayUtils.hmacSHA512(requireConfig(vnpayProperties.getHashSecret(), "vnpay.hash-secret"), hashData);

        if (!calculatedHash.equalsIgnoreCase(inputHash)) {
            log.warn("VNPay callback: chữ ký không hợp lệ. calculated={}, received={}", calculatedHash, inputHash);
            return new VerificationResult("97", "Sai chữ ký (Invalid signature)", null, false);
        }

        String txnRef = filteredParams.get("vnp_TxnRef");
        UUID orderId;
        try {
            orderId = VnpayUtils.fromTxnRef(txnRef);
        } catch (Exception e) {
            return new VerificationResult("01", "Không tìm thấy đơn hàng (Invalid TxnRef)", null, false);
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return new VerificationResult("01", "Không tìm thấy đơn hàng", orderId, false);
        }

        Payment payment = paymentRepository.findByOrder_OrderId(orderId).orElse(null);
        if (payment == null) {
            return new VerificationResult("01", "Không tìm thấy giao dịch thanh toán", orderId, false);
        }

        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            return new VerificationResult("02", "Đơn hàng đã được xác nhận trước đó", orderId, true);
        }

        long expectedAmount = payment.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();
        String vnpAmountStr = filteredParams.get("vnp_Amount");
        long receivedAmount = vnpAmountStr != null ? Long.parseLong(vnpAmountStr) : -1L;

        if (receivedAmount != expectedAmount) {
            log.warn("VNPay callback: sai số tiền. expected={}, received={}", expectedAmount, receivedAmount);
            return new VerificationResult("04", "Sai số tiền giao dịch", orderId, false);
        }

        String responseCode = filteredParams.get("vnp_ResponseCode");
        String transactionStatus = filteredParams.get("vnp_TransactionStatus");
        boolean isSuccess = "00".equals(responseCode) && "00".equals(transactionStatus);

        if (isSuccess) {
            payment.setPaymentStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionCode(filteredParams.get("vnp_TransactionNo"));
            paymentRepository.save(payment);

            // IPN thành công → chuyển sang PENDING (ngang hàng với luồng CASH)
            order.setOrderStatus(OrderStatus.PENDING);
            orderRepository.save(order);

            return new VerificationResult("00", "Xác nhận thanh toán thành công", orderId, true);
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            // IPN thất bại / bị hủy → CANCELLED
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            return new VerificationResult("00", "Giao dịch thất bại hoặc bị huỷ (đã ghi nhận)", orderId, false);
        }
    }

    private record VerificationResult(String rspCode, String message, UUID orderId, boolean success) {
    }

    private String requireConfig(String value, String propertyName) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException("Thiếu cấu hình " + propertyName);
        }
        return value;
    }

    private String defaultValue(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value;
    }

    private String defaultClientIp(String clientIp) {
        if (clientIp == null || clientIp.isBlank() || "0:0:0:0:0:0:0:1".equals(clientIp) || "::1".equals(clientIp)) {
            return "127.0.0.1";
        }
        return clientIp;
    }

    private String toVnpAmount(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).stripTrailingZeros().toPlainString();
    }
}
