package com.example.e_commerce.features.product.mapper;

import com.example.e_commerce.features.product.dto.request.ProductVariantRequest;
import com.example.e_commerce.features.product.dto.response.ProductVariantResponse;
import com.example.e_commerce.features.product.entity.ProductVariant;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {
    @Mapping(target = "variantId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductVariant toEntity(ProductVariantRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "variantId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget ProductVariant productVariant, ProductVariantRequest request);

    default ProductVariantResponse toResponse(ProductVariant productVariant) {
        if (productVariant == null) {
            return null;
        }
        return new ProductVariantResponse(
                productVariant.getVariantId(),
                productVariant.getProduct() != null ? productVariant.getProduct().getProductId() : null,
                productVariant.getProduct() != null ? productVariant.getProduct().getProductName() : null,
                productVariant.getColor(),
                productVariant.getSize(),
                productVariant.getStock(),
                productVariant.getPrice(),
                productVariant.getSku(),
                productVariant.getIsActive(),
                productVariant.getCreatedAt(),
                productVariant.getUpdatedAt()
        );
    }
}
