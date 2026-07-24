package com.example.e_commerce.features.product.service.impl;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.product.dto.request.category.CategoryRequest;
import com.example.e_commerce.features.product.dto.request.category.CategorySearchRequest;
import com.example.e_commerce.features.product.dto.response.CategoryResponse;
import com.example.e_commerce.features.product.entity.Category;
import com.example.e_commerce.features.product.mapper.CategoryMapper;
import com.example.e_commerce.features.product.repository.CategoryRepository;
import com.example.e_commerce.features.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.e_commerce.shared.PageResponse;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
//        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
//            throw new AppException(ErrorCode.CATEGORY_ALREADY_EXISTS);
//        }
        Category category = categoryMapper.toEntity(request);
        category.setIsActive(true);
        if (request.getParentId() != null) {
            category.setParent(categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUD)));
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUD));

        if (request.getParentId() != null && categoryId.equals(request.getParentId())) {
            throw new AppException(ErrorCode.CATEGORY_PARENT_INVALID);
        }

        categoryMapper.updateEntity(category, request);
        if (request.getParentId() != null) {
            category.setParent(categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUD)));
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategoryStatus(UUID categoryId, Boolean isActive) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUD));
        category.setIsActive(isActive);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUD));
        categoryRepository.deleteById(category.getCategoryId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByIsActiveTrue()
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUD));
        return categoryMapper.toResponse(category);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNull().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        List<Category> roots = categoryRepository.findByParentIsNull();
        return roots.stream()
                .map(this::mapToTreeResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getLeafCategories() {
        return categoryRepository.findLeafCategories().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToTreeResponse(Category category) {
        CategoryResponse response = categoryMapper.toResponse(category);
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            response.setChildren(category.getChildren().stream()
                    .map(this::mapToTreeResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> searchCategories(CategorySearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Category> categoryPage = categoryRepository.searchCategories(
                request.getCategoryName(),
                request.getParentId(),
                request.getIsActive(),
                pageable
        );
        List<CategoryResponse> content = categoryPage.getContent().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
        return PageResponse.<CategoryResponse>builder()
                .pageNo(categoryPage.getNumber())
                .pageSize(categoryPage.getSize())
                .totalElements(categoryPage.getTotalElements())
                .totalPages(categoryPage.getTotalPages())
                .last(categoryPage.isLast())
                .content(content)
                .build();
    }
}
