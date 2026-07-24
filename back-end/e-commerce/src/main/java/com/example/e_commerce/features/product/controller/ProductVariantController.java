package com.example.e_commerce.features.product.controller;

import com.example.e_commerce.features.product.dto.request.ProductVariantRequest;
import com.example.e_commerce.features.product.dto.response.ProductVariantResponse;
import com.example.e_commerce.features.product.service.ProductVariantService;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/v1/product-variant")
@RestController
@RequiredArgsConstructor
public class ProductVariantController {
    private final ProductVariantService productVariantService;

    @PostMapping("/created")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> created(@Valid @RequestBody ProductVariantRequest request) {
        ProductVariantResponse response = productVariantService.createProductVariant(request);
        return ResponseEntity.ok(
                ApiResponse.<ProductVariantResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATED_PRODUCT_VARIANT)
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<ProductVariantResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT_VARIANT)
                        .data(productVariantService.getAllProductVariants())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.<ProductVariantResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT_VARIANT)
                        .data(productVariantService.getProductVariant(id))
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ProductVariantRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<ProductVariantResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_PRODUCT_VARIANT)
                        .data(productVariantService.updateProductVariant(id, request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> delete(@PathVariable UUID id) {
        productVariantService.deleteProductVariant(id);
        return ResponseEntity.ok(
                ApiResponse.<ProductVariantResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.DELETE_PRODUCT_VARIANT)
                        .data(null)
                        .build()
        );
    }
}
