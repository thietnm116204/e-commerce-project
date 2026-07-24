package com.example.e_commerce.features.product.service.impl;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.product.dto.request.img.ProductImageRequest;
import com.example.e_commerce.features.product.dto.response.ProductImageResponse;
import com.example.e_commerce.features.product.entity.Product;
import com.example.e_commerce.features.product.entity.ProductImage;
import com.example.e_commerce.features.product.entity.ProductVariant;
import com.example.e_commerce.features.product.mapper.ProductImageMapper;
import com.example.e_commerce.features.product.repository.ProductImageRepository;
import com.example.e_commerce.features.product.repository.ProductRepository;
import com.example.e_commerce.features.product.repository.ProductVariantRepository;
import com.example.e_commerce.features.product.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageMapper productImageMapper;

    @Override
    @Transactional
    public ProductImageResponse createProductImage(ProductImageRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

        ProductImage image = productImageMapper.toEntity(request);
        image.setProduct(product);
        image.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);
        image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        if (request.getVariantId() != null) {
            ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUD));
            image.setVariant(variant);
        }

        return productImageMapper.toResponse(productImageRepository.save(image));
    }

    @Override
    @Transactional
    public ProductImageResponse updateProductImage(UUID productImageId, ProductImageRequest request) {
        ProductImage image = productImageRepository.findById(productImageId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_IMAGE_NOT_FOUD));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

        productImageMapper.updateEntity(image, request);
        image.setProduct(product);
        image.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : image.getIsPrimary());
        image.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : image.getSortOrder());

        if (request.getVariantId() != null) {
            ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUD));
            image.setVariant(variant);
        } else {
            image.setVariant(null);
        }

        return productImageMapper.toResponse(productImageRepository.save(image));
    }

    @Override
    @Transactional
    public void deleteProductImage(UUID productImageId) {
        ProductImage image = productImageRepository.findById(productImageId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_IMAGE_NOT_FOUD));
        productImageRepository.deleteById(image.getProductImageId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getAllProductImages() {
        return productImageRepository.findAll()
                .stream()
                .map(productImageMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductImageResponse getProductImage(UUID productImageId) {
        ProductImage image = productImageRepository.findById(productImageId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_IMAGE_NOT_FOUD));
        return productImageMapper.toResponse(image);
    }
}
