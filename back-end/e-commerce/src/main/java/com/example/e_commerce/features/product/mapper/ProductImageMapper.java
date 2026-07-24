package com.example.e_commerce.features.product.mapper;

import com.example.e_commerce.features.product.dto.request.img.ProductImageRequest;
import com.example.e_commerce.features.product.dto.response.ProductImageResponse;
import com.example.e_commerce.features.product.entity.ProductImage;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProductImageMapper {
    @Mapping(target = "productImageId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "variant", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ProductImage toEntity(ProductImageRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "productImageId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "variant", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(@MappingTarget ProductImage productImage, ProductImageRequest request);

    default ProductImageResponse toResponse(ProductImage productImage) {
        if (productImage == null) {
            return null;
        }
        return new ProductImageResponse(
                productImage.getProductImageId(),
                productImage.getProduct() != null ? productImage.getProduct().getProductId() : null,
                productImage.getProduct() != null ? productImage.getProduct().getProductName() : null,
                productImage.getVariant() != null ? productImage.getVariant().getVariantId() : null,
                productImage.getVariant() != null ? productImage.getVariant().getSku() : null,
                productImage.getProductImageUrl(),
                productImage.getIsPrimary(),
                productImage.getSortOrder(),
                productImage.getCreatedAt()
        );
    }
}
