package com.example.e_commerce.features.product.dto.request.product;

import com.example.e_commerce.shared.status.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm không quá 255 ký tự")
    private String productName;

    @NotNull(message = "Brand không được để trống")
    private UUID brandId;

    private String productDescription;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Positive(message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal productPrice;

    private BigDecimal productSale;

    private Boolean isActive;

    private ProductStatus productStatus;

    private Integer productQuantity;

    private List<UUID> categoryIds;
}
