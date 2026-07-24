package com.example.e_commerce.features.product.controller;

import com.example.e_commerce.features.product.dto.request.category.CategoryRequest;
import com.example.e_commerce.features.product.dto.request.category.CategorySearchRequest;
import com.example.e_commerce.features.product.dto.request.category.CategoryStatusRequest;
import com.example.e_commerce.features.product.dto.response.CategoryResponse;
import com.example.e_commerce.features.product.service.CategoryService;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import com.example.e_commerce.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/v1")
@RestController
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping("/category/created")
    public ResponseEntity<ApiResponse<CategoryResponse>> created(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.ok(
                ApiResponse.<CategoryResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.CREATED_CATEGORY)
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/category")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<CategoryResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_CATEGORY)
                        .data(categoryService.getAllCategories())
                        .build()
        );
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_CATEGORY)
                        .data(categoryService.getCategory(id))
                        .build()
        );
    }

    @PutMapping("/category/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @RequestBody @Valid CategoryRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_CATEGORY)
                        .data(categoryService.updateCategory(id, request))
                        .build()
        );
    }

    @PatchMapping("/category/{id}/status")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryStatus(
            @PathVariable UUID id,
            @RequestBody @Valid CategoryStatusRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<CategoryResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_CATEGORY)
                        .data(categoryService.updateCategoryStatus(id, request.getIsActive()))
                        .build()
        );
    }

    @DeleteMapping("/category/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(
                ApiResponse.<CategoryResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.DELETE_CATEGORY)
                        .data(null)
                        .build()
        );
    }

    @GetMapping("/categories/tree")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoryTree() {
        return ResponseEntity.ok(
                ApiResponse.<List<CategoryResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_CATEGORY)
                        .data(categoryService.getCategoryTree())
                        .build()
        );
    }

    @GetMapping("/categories/roots")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        return ResponseEntity.ok(
                ApiResponse.<List<CategoryResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_CATEGORY)
                        .data(categoryService.getRootCategories())
                        .build()
        );
    }

    @PostMapping("/categories/search")
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> searchCategories(
            @RequestBody CategorySearchRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<CategoryResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_CATEGORY)
                        .data(categoryService.searchCategories(request))
                        .build()
        );
    }
}
