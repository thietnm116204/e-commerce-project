package com.example.e_commerce.features.product.dto.request.product;

import com.example.e_commerce.shared.status.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchRequest {
    private String productName;
    private UUID brandId;
    private UUID categoryId;
    private Boolean isActive;
    private ProductStatus productStatus;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;
}
