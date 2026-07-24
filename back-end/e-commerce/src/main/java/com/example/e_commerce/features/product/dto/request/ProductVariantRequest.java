package com.example.e_commerce.features.product.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequest {
    @NotNull(message = "Product không được để trống")
    private UUID productId;

    @Size(max = 50, message = "Màu sắc không quá 50 ký tự")
    private String color;

    @Size(max = 10, message = "Size không quá 10 ký tự")
    private String size;

    @NotNull(message = "Stock không được để trống")
    @PositiveOrZero(message = "Stock phải >= 0")
    private Integer stock;

    @PositiveOrZero(message = "Giá phải >= 0")
    private BigDecimal price;

    @Size(max = 100, message = "SKU không quá 100 ký tự")
    private String sku;

    private Boolean isActive;
}
