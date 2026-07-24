package com.example.e_commerce.features.product.service;

import com.example.e_commerce.features.product.dto.request.ProductVariantRequest;
import com.example.e_commerce.features.product.dto.response.ProductVariantResponse;

import java.util.List;
import java.util.UUID;

public interface ProductVariantService {
    ProductVariantResponse createProductVariant(ProductVariantRequest request);
    ProductVariantResponse updateProductVariant(UUID variantId, ProductVariantRequest request);
    void deleteProductVariant(UUID variantId);
    List<ProductVariantResponse> getAllProductVariants();
    ProductVariantResponse getProductVariant(UUID variantId);
}
