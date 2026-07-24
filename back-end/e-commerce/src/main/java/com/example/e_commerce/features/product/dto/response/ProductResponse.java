package com.example.e_commerce.features.product.dto.response;

import com.example.e_commerce.shared.status.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse implements Serializable {
    private UUID productId;
    private String productName;
    private String productSlug;
    private UUID brandId;
    private String brandName;
    private String productDescription;
    private BigDecimal productPrice;
    private BigDecimal productSale;
    private Boolean isActive;
    private ProductStatus productStatus;
    private List<UUID> categoryIds;
    private List<String> categoryNames;
    private List<ProductImageResponse> images;
    private Integer productQuantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
