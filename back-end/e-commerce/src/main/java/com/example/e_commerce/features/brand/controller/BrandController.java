package com.example.e_commerce.features.brand.controller;


import com.example.e_commerce.config.supabase.SupabaseStorageService;
import com.example.e_commerce.features.brand.dto.request.BrandRequest;
import com.example.e_commerce.features.brand.dto.request.BrandSearchRequest;
import com.example.e_commerce.features.brand.dto.response.BrandResponse;
import com.example.e_commerce.features.brand.service.BrandService;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import com.example.e_commerce.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RequestMapping("/api/v1/brand")
@RestController
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;
    private final SupabaseStorageService storageService;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/created", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BrandResponse>> created(
            @RequestPart("request") String requestJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        BrandRequest request = objectMapper.readValue(requestJson, BrandRequest.class);

        String logoUrl = null;
        if (file != null && !file.isEmpty()) {
            logoUrl = storageService.uploadFile(file);
        }

        BrandResponse response = brandService.createBrand(request, logoUrl);
        return ResponseEntity.ok(
                ApiResponse.<BrandResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATED_BRAND)
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAll(){
        return ResponseEntity.ok(
                ApiResponse.<List<BrandResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_BRAND)
                        .data(brandService.getAllBrands())
                        .build()
        );
    }
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandDetail(
            @PathVariable String slug
            ){
        return ResponseEntity.ok(
                ApiResponse.<BrandResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_BRAND)
                        .data(brandService.getBrand(slug))
                        .build()
        );
    }
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable UUID id,
            @RequestPart("request") String requestJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {
        BrandRequest request = objectMapper.readValue(requestJson, BrandRequest.class);
        BrandResponse response = brandService.updateBrand(id, request, file);
        return ResponseEntity.ok(
                ApiResponse.<BrandResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_BRAND)
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> deleteBrand(
            @PathVariable UUID id
    ) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(
                ApiResponse.<BrandResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.DELETE_BRAND)
                        .data(null)
                        .build()
        );
    }
    //search admin
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<BrandResponse>>> searchBrand(
            @RequestBody BrandSearchRequest request
    ) {
        PageResponse<BrandResponse> data = brandService.searchBrands(request);
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<BrandResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_BRAND)
                        .data(data)
                        .build()
        );
    }
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BrandResponse>> toggleStatus(
            @PathVariable UUID id
    ) {
        BrandResponse response = brandService.brandStatus(id);
        return ResponseEntity.ok(
                ApiResponse.<BrandResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_BRAND)
                        .data(response)
                        .build()
        );
    }
    @GetMapping("/origins")
    public ResponseEntity<ApiResponse<List<String>>> getBrandOrigins() {
        return ResponseEntity.ok(
                ApiResponse.<List<String>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_BRAND)
                        .data(brandService.getBrandOrigins())
                        .build()
        );
    }

}
