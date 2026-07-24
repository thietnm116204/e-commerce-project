package com.example.e_commerce.features.product.dto.response;

import com.example.e_commerce.features.brand.dto.response.BrandResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInitResponse {
    private List<BrandResponse> brands;
    private List<CategoryResponse> categories;
}
