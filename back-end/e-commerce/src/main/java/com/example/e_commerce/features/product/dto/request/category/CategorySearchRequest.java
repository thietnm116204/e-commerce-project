package com.example.e_commerce.features.product.dto.request.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySearchRequest {
    private String categoryName;
    private UUID parentId;
    private Boolean isActive;
    
    @Builder.Default
    private int page = 0;
    
    @Builder.Default
    private int size = 10;
}
