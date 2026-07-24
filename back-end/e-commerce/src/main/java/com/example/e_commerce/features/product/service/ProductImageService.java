package com.example.e_commerce.features.product.service;

import com.example.e_commerce.features.product.dto.request.img.ProductImageRequest;
import com.example.e_commerce.features.product.dto.response.ProductImageResponse;

import java.util.List;
import java.util.UUID;

public interface ProductImageService {
    ProductImageResponse createProductImage(ProductImageRequest request);
    ProductImageResponse updateProductImage(UUID productImageId, ProductImageRequest request);
    void deleteProductImage(UUID productImageId);
    List<ProductImageResponse> getAllProductImages();
    ProductImageResponse getProductImage(UUID productImageId);
}
