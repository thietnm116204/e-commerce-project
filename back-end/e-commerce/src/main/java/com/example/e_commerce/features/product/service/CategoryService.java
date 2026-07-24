package com.example.e_commerce.features.product.service;

import com.example.e_commerce.features.product.dto.request.category.CategoryRequest;
import com.example.e_commerce.features.product.dto.request.category.CategorySearchRequest;
import com.example.e_commerce.features.product.dto.response.CategoryResponse;
import com.example.e_commerce.shared.PageResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(UUID categoryId, CategoryRequest request);
    CategoryResponse updateCategoryStatus(UUID categoryId, Boolean isActive);
    void deleteCategory(UUID categoryId);
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategory(UUID categoryId);
    
    List<CategoryResponse> getCategoryTree();
    List<CategoryResponse> getRootCategories();
    List<CategoryResponse> getLeafCategories();
    PageResponse<CategoryResponse> searchCategories(CategorySearchRequest request);
}
