package com.example.e_commerce.features.order.dto.request.order;
import com.example.e_commerce.shared.status.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CheckoutRequest {
    @NotEmpty(message = "Vui lòng chọn ít nhất 1 sản phẩm để mua")
    private List<UUID> cartItemIds;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String receiverPhone;

    private String note;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

}
