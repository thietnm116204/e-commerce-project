package com.example.e_commerce.features.product.service;

import com.example.e_commerce.features.product.dto.request.product.ProductRequest;
import com.example.e_commerce.features.product.dto.request.product.ProductSearchHomeRequest;
import com.example.e_commerce.features.product.dto.request.product.ProductSearchRequest;
import com.example.e_commerce.features.product.dto.response.ProductInitResponse;
import com.example.e_commerce.features.product.dto.response.ProductResponse;
import com.example.e_commerce.shared.PageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(UUID productId, ProductRequest request, List<MultipartFile> newImages);
    void deleteProduct(UUID productId);
    List<ProductResponse> getAllProducts();
    ProductResponse getProduct(String slug);
    ProductResponse getProductById(UUID id);

    List<ProductResponse> createProductsBath(
            List<ProductRequest> requests,
            Map<Integer, List<MultipartFile>> filesByIndex
    );


    ProductInitResponse getProductInitData();

    PageResponse<ProductResponse> searchProducts(ProductSearchRequest request);
    //user
    PageResponse<ProductResponse> searchProductUsers(ProductSearchHomeRequest request);

}
