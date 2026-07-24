package com.example.e_commerce.features.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse implements Serializable {
    private UUID productImageId;
    private UUID productId;
    private String productName;
    private UUID variantId;
    private String variantSku;
    private String productImageUrl;
    private Boolean isPrimary;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
