package com.example.e_commerce.features.product.controller;

import com.example.e_commerce.features.product.dto.request.img.ProductImageRequest;
import com.example.e_commerce.features.product.dto.response.ProductImageResponse;
import com.example.e_commerce.features.product.service.ProductImageService;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/v1/product-image")
@RestController
@RequiredArgsConstructor
public class ProductImageController {
    private final ProductImageService productImageService;

    @PostMapping("/created")
    public ResponseEntity<ApiResponse<ProductImageResponse>> created(@Valid @RequestBody ProductImageRequest request) {
        ProductImageResponse response = productImageService.createProductImage(request);
        return ResponseEntity.ok(
                ApiResponse.<ProductImageResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATED_PRODUCT_IMAGE)
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductImageResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<ProductImageResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT_IMAGE)
                        .data(productImageService.getAllProductImages())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductImageResponse>> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.<ProductImageResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT_IMAGE)
                        .data(productImageService.getProductImage(id))
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductImageResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ProductImageRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<ProductImageResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_PRODUCT_IMAGE)
                        .data(productImageService.updateProductImage(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductImageResponse>> delete(@PathVariable UUID id) {
        productImageService.deleteProductImage(id);
        return ResponseEntity.ok(
                ApiResponse.<ProductImageResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.DELETE_PRODUCT_IMAGE)
                        .data(null)
                        .build()
        );
    }
}
