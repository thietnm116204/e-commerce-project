package com.example.e_commerce.features.product.service.impl;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.product.dto.request.ProductVariantRequest;
import com.example.e_commerce.features.product.dto.response.ProductVariantResponse;
import com.example.e_commerce.features.product.entity.Product;
import com.example.e_commerce.features.product.entity.ProductVariant;
import com.example.e_commerce.features.product.mapper.ProductVariantMapper;
import com.example.e_commerce.features.product.repository.ProductRepository;
import com.example.e_commerce.features.product.repository.ProductVariantRepository;
import com.example.e_commerce.features.product.service.ProductVariantService;
import com.example.e_commerce.shared.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ProductVariantMapper productVariantMapper;
    private final SlugUtils slugUtils;

    @Override
    @Transactional
    public ProductVariantResponse createProductVariant(ProductVariantRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

        ProductVariant variant = productVariantMapper.toEntity(request);
        variant.setProduct(product);
        variant.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (variant.getSku() == null || variant.getSku().isBlank()) {
            variant.setSku(generateSku(product.getProductName(), request));
        }
        if (productVariantRepository.existsBySku(variant.getSku())) {
            throw new AppException(ErrorCode.PRODUCT_VARIANT_ALREADY_EXISTS);
        }

        return productVariantMapper.toResponse(productVariantRepository.save(variant));
    }

    @Override
    @Transactional
    public ProductVariantResponse updateProductVariant(UUID variantId, ProductVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUD));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUD));

        productVariantMapper.updateEntity(variant, request);
        variant.setProduct(product);
        if (request.getIsActive() != null) {
            variant.setIsActive(request.getIsActive());
        }
        if (variant.getSku() == null || variant.getSku().isBlank()) {
            variant.setSku(generateSku(product.getProductName(), request));
        }
        if (!variant.getSku().equals(productVariantRepository.findById(variantId).map(ProductVariant::getSku).orElse(null))
                && productVariantRepository.existsBySku(variant.getSku())) {
            throw new AppException(ErrorCode.PRODUCT_VARIANT_ALREADY_EXISTS);
        }

        return productVariantMapper.toResponse(productVariantRepository.save(variant));
    }

    @Override
    @Transactional
    public void deleteProductVariant(UUID variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUD));
        productVariantRepository.deleteById(variant.getVariantId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getAllProductVariants() {
        return productVariantRepository.findAll()
                .stream()
                .map(productVariantMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantResponse getProductVariant(UUID variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUD));
        return productVariantMapper.toResponse(variant);
    }

    private String generateSku(String productName, ProductVariantRequest request) {
        String base = slugUtils.generateSlug(productName);
        String color = request.getColor() != null ? slugUtils.generateSlug(request.getColor()) : "default";
        String size = request.getSize() != null ? slugUtils.generateSlug(request.getSize()) : "na";
        return (base + "-" + color + "-" + size).toUpperCase();
    }
}
