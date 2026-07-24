package com.example.e_commerce.features.brand.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandSearchRequest {
    private String brandName;
    private String brandOrigin;
    private Boolean isActive;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;
}
