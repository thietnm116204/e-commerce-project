package com.example.e_commerce.features.product.controller;

import com.example.e_commerce.features.product.dto.request.product.ProductRequest;
import com.example.e_commerce.features.product.dto.request.product.ProductSearchRequest;
import com.example.e_commerce.features.product.dto.response.ProductInitResponse;
import com.example.e_commerce.features.product.dto.response.ProductResponse;
import com.example.e_commerce.features.product.service.ProductService;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import com.example.e_commerce.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RequestMapping("/api/v1/product")
@RestController
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final ObjectMapper objectMapper;


    @GetMapping("/init")
    public ResponseEntity<ApiResponse<ProductInitResponse>> getProductInitData() {
        return ResponseEntity.ok(
                ApiResponse.<ProductInitResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT_INIT)
                        .data(productService.getProductInitData())
                        .build()
        );
    }

    @PostMapping("/created")
    public ResponseEntity<ApiResponse<ProductResponse>> created(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATED_PRODUCT)
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<ProductResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT)
                        .data(productService.getAllProducts())
                        .build()
        );
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT)
                        .data(productService.getProduct(slug))
                        .build()
        );
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT)
                        .data(productService.getProductById(id))
                        .build()
        );
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @RequestParam("data") String dataJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> images
    ) throws IOException {
        ProductRequest request = objectMapper.readValue(dataJson, ProductRequest.class);

        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_PRODUCT)
                        .data(productService.updateProduct(id, request, images))
                        .build()
        );
    }
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> searchProducts(
            @RequestBody ProductSearchRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ProductResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT)
                        .data(productService.searchProducts(request))
                        .build()
        );
    }
    @PostMapping("/search-home")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> searchProductUsers(
            @RequestBody ProductSearchRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ProductResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PRODUCT)
                        .data(productService.searchProducts(request))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(
                ApiResponse.<ProductResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.DELETE_PRODUCT)
                        .data(null)
                        .build()
        );
    }
    /**
     * Tạo nhiều sản phẩm cùng lúc, mỗi sản phẩm kèm nhiều ảnh.
     * Form-data gửi lên gồm:
     * - "request": JSON array các ProductRequest, ví dụ:
     *   [{"productName":"Áo A","brandId":"...","productPrice":100000,...},
     *    {"productName":"Áo B","brandId":"...","productPrice":200000,...}]
     * - "files_0": nhiều file ảnh cho product index 0
     * - "files_1": nhiều file ảnh cho product index 1
     * - ... (index khớp với vị trí trong mảng "request")
     */
    @PostMapping(value = "/created-batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<ProductResponse>>> createBatch(
            @RequestParam("request") String requestJson,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        List<ProductRequest> requests = objectMapper.readValue(
                requestJson, new TypeReference<List<ProductRequest>>() {}
        );

        Map<Integer, List<MultipartFile>> filesByIndex = new HashMap<>();
        for (int i = 0; i < requests.size(); i++) {
            List<MultipartFile> files = multipartRequest.getFiles("files_" + i);
            if (files != null && !files.isEmpty()) {
                filesByIndex.put(i, files);
            }
        }

        List<ProductResponse> response = productService.createProductsBath(requests, filesByIndex);

        return ResponseEntity.ok(
                ApiResponse.<List<ProductResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATED_PRODUCT)
                        .data(response)
                        .build()
        );
    }
}
