package com.example.e_commerce.features.product.service.impl;

import com.example.e_commerce.config.supabase.SupabaseStorageService;
import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.brand.dto.response.BrandResponse;
import com.example.e_commerce.features.brand.mapper.BrandMapper;
import com.example.e_commerce.features.product.dto.request.product.ProductRequest;
import com.example.e_commerce.features.product.dto.request.product.ProductSearchHomeRequest;
import com.example.e_commerce.features.product.dto.request.product.ProductSearchRequest;
import com.example.e_commerce.features.product.dto.response.CategoryResponse;
import com.example.e_commerce.features.product.dto.response.ProductImageResponse;
import com.example.e_commerce.features.product.dto.response.ProductInitResponse;
import com.example.e_commerce.features.product.dto.response.ProductResponse;
import com.example.e_commerce.features.brand.entity.Brand;
import com.example.e_commerce.features.product.entity.Category;
import com.example.e_commerce.features.product.entity.Product;
import com.example.e_commerce.features.product.entity.ProductImage;
import com.example.e_commerce.features.product.mapper.CategoryMapper;
import com.example.e_commerce.features.product.mapper.ProductImageMapper;
import com.example.e_commerce.features.product.mapper.ProductMapper;
import com.example.e_commerce.features.brand.repository.BrandRepository;
import com.example.e_commerce.features.product.repository.CategoryRepository;
import com.example.e_commerce.features.product.repository.ProductImageRepository;
import com.example.e_commerce.features.product.repository.ProductRepository;
import com.example.e_commerce.features.product.service.ProductService;
import com.example.e_commerce.features.user.entity.User;
import com.example.e_commerce.features.user.repository.UserRepository;
import com.example.e_commerce.shared.PageResponse;
import com.example.e_commerce.shared.status.ProductStatus;
import com.example.e_commerce.shared.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final String GET_INIT_PRODUCT_PERMISSION = "GET_INIT_PRODUCT";

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductImageMapper productImageMapper;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    private final BrandMapper brandMapper;
    private final SlugUtils slugUtils;
    private final SupabaseStorageService storageService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    @CacheEvict(value = {"products_all", "product", "product_id"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUD));

        String productSlug = slugUtils.generateSlug(request.getProductName());
        if (productRepository.existsByProductSlug(productSlug)) {
            throw new AppException(ErrorCode.PRODUCT_ALREADY_EXISTS);
        }

        Product product = productMapper.toEntity(request);
        product.setBrand(brand);
        product.setProductSlug(productSlug);
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        product.setProductStatus(request.getProductStatus() != null ? request.getProductStatus() : ProductStatus.ACTIVE);
        product.setCategories(loadCategories(request.getCategoryIds()));

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products_all", "product", "product_id"}, allEntries = true)
    public ProductResponse updateProduct(UUID productId, ProductRequest request,List<MultipartFile> newImages) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUD));

        String productSlug = slugUtils.generateSlug(request.getProductName());
        if (!productSlug.equals(product.getProductSlug()) && productRepository.existsByProductSlug(productSlug)) {
            throw new AppException(ErrorCode.PRODUCT_ALREADY_EXISTS);
        }

        productMapper.updateEntity(product, request);
        product.setBrand(brand);
        product.setProductSlug(productSlug);
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        if (request.getProductStatus() != null) {
            product.setProductStatus(request.getProductStatus());
        }
        if (request.getCategoryIds() != null) {
            product.setCategories(loadCategories(request.getCategoryIds()));
        }
        product = productRepository.save(product);

        if (newImages != null && !newImages.isEmpty()) {
            replaceProductImages(product, newImages);
        }

        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products_all", "product", "product_id"}, allEntries = true)
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));
        List<ProductImage> images = productImageRepository.findByProduct_ProductId(productId);
        // 1. Xóa file vật lý trên Supabase trước
        for (ProductImage image : images) {
            storageService.deleteFile(image.getProductImageUrl());
        }
        // 2. Xóa record ảnh trong DB
        if (!images.isEmpty()) {
            productImageRepository.deleteAll(images);
        }
        // 3. Xóa product
        productRepository.deleteById(product.getProductId());    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products_all")
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllByIsActiveTrue()
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "product", key = "#slug")
    public ProductResponse getProduct(String slug) {
        Product product = productRepository.findByProductSlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));
        return productMapper.toResponse(product);
    }

    @Override
    @Cacheable(value = "product_id", key = "#id")
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.PRODUCT_NOT_FOUD));
        return productMapper.toResponse(product);
    }

    @Override
    @CacheEvict(value = {"products_all", "product", "product_id"}, allEntries = true)
    public List<ProductResponse> createProductsBath(List<ProductRequest> requests, Map<Integer, List<MultipartFile>> filesByIndex) {
        if (requests == null || requests.isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUD);
        }
        List<ProductResponse> responses = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            ProductRequest request = requests.get(i);
            if (productRepository.existsByProductName(request.getProductName())) {
                throw new AppException(ErrorCode.PRODUCT_ALREADY_EXISTS);
            }
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUD));

            List<Category> categories = Collections.emptyList();
            if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
                categories = categoryRepository.findAllById(request.getCategoryIds());
                if (categories.size() != request.getCategoryIds().size()) {
                    throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
                }
            }
            Product product = productMapper.toEntity(request);
            product.setProductSlug(slugUtils.generateSlug(request.getProductName()));
            product.setBrand(brand);
            product.setCategories(categories);
            if (product.getIsActive() == null) {
                product.setIsActive(true);
            }
            product = productRepository.save(product);

            // Upload ảnh cho product này (nếu có)
            List<MultipartFile> files = filesByIndex.get(i);
            List<ProductImageResponse> imageResponses = new ArrayList<>();

            if (files != null && !files.isEmpty()) {
                List<ProductImage> images = new ArrayList<>();
                int order = 0;
                for (MultipartFile file : files) {
                    if (file == null || file.isEmpty()) continue;

                    String url = storageService.uploadFile(file);

                    ProductImage image = new ProductImage();
                    image.setProduct(product);
                    image.setProductImageUrl(url);
                    image.setSortOrder(order);
                    image.setIsPrimary(order == 0); // ảnh đầu tiên = primary
                    order++;

                    images.add(image);
                }
                images = productImageRepository.saveAll(images);
                imageResponses = images.stream()
                        .map(productImageMapper::toResponse)
                        .collect(Collectors.toList());
            }
            ProductResponse response = productMapper.toResponse(product);
            response.setImages(imageResponses);
            responses.add(response);

        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductInitResponse getProductInitData() {
        validatePermission(GET_INIT_PRODUCT_PERMISSION);

        List<BrandResponse> brands = brandRepository.findAllByIsActiveTrue()
                .stream()
                .map(brandMapper::toResponse)
                .collect(Collectors.toList());

        List<CategoryResponse> categories = categoryRepository.findLeafCategories()
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());

        return ProductInitResponse.builder()
                .brands(brands)
                .categories(categories)
                .build();
    }

    private void validatePermission(String permissionName) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUserEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUD));
        boolean hasPermission = currentUser.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(p -> permissionName.equals(p.getPermissionName()));
        if (!hasPermission) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private List<Category> loadCategories(List<UUID> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<UUID> uniqueCategoryIds = new ArrayList<>(new LinkedHashSet<>(categoryIds));

        Map<UUID, Category> categoryMap = categoryRepository.findAllById(uniqueCategoryIds)
                .stream()
                .collect(Collectors.toMap(Category::getCategoryId, Function.identity()));

        if (categoryMap.size() != uniqueCategoryIds.size()) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUD);
        }

        List<Category> categories = new ArrayList<>();
        for (UUID categoryId : uniqueCategoryIds) {
            categories.add(categoryMap.get(categoryId));
        }
        return categories;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(ProductSearchRequest request) {
        Page<Product> productPage = productRepository.searchProducts(
                request.getProductName(),
                request.getBrandId(),
                request.getCategoryId(),
                request.getIsActive(),
                request.getProductStatus(),
                request.getMinPrice(),
                request.getMaxPrice(),
                PageRequest.of(request.getPage(), request.getSize(), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
        );
        return PageResponse.<ProductResponse>builder()
                .pageNo(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .content(productPage.getContent().stream()
                        .map(productMapper::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProductUsers(ProductSearchHomeRequest request) {
        Page<Product> productPage = productRepository.searchProductHomes(
                request.getProductName(),
                request.getBrandId(),
                normalizeCategoryIds(request.getCategoryIds()),
                request.getIsActive(),
                request.getProductStatus(),
                request.getMinPrice(),
                request.getMaxPrice(),
                PageRequest.of(request.getPage(), request.getSize(), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
        );
        return toPageResponse(productPage);
    }
    private void replaceProductImages(Product product, List<MultipartFile> newImages) {
        List<ProductImage> oldImages = productImageRepository.findByProduct_ProductId(product.getProductId());

        // 1. Xóa file vật lý trên Supabase trước
        for (ProductImage oldImage : oldImages) {
            storageService.deleteFile(oldImage.getProductImageUrl());
        }

        // 2. Xóa record cũ trong DB
        if (!oldImages.isEmpty()) {
            productImageRepository.deleteAll(oldImages);
        }

        // 3. Upload ảnh mới + lưu record mới
        List<ProductImage> images = new ArrayList<>();
        int order = 0;
        for (MultipartFile file : newImages) {
            if (file == null || file.isEmpty()) continue;

            String url = storageService.uploadFile(file);

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setProductImageUrl(url);
            image.setSortOrder(order);
            image.setIsPrimary(order == 0);
            order++;

            images.add(image);
        }
        productImageRepository.saveAll(images);
    }

    private List<UUID> normalizeCategoryIds(List<UUID> categoryIds) {
        return (categoryIds == null || categoryIds.isEmpty()) ? null : categoryIds;
    }
    private PageResponse<ProductResponse> toPageResponse(Page<Product> productPage) {
        return PageResponse.<ProductResponse>builder()
                .pageNo(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .content(productPage.getContent().stream()
                        .map(productMapper::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }


}
