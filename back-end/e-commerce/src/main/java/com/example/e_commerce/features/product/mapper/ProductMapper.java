package com.example.e_commerce.features.product.mapper;

import com.example.e_commerce.features.product.dto.request.product.ProductRequest;
import com.example.e_commerce.features.product.dto.response.ProductResponse;
import com.example.e_commerce.features.product.entity.Category;
import com.example.e_commerce.features.product.entity.Product;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.UUID;

@Mapper(componentModel = "spring", uses = {ProductImageMapper.class})
public interface ProductMapper {
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "productSlug", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Product toEntity(ProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "productSlug", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Product product, ProductRequest request);

    @Mapping(target = "brandId", source = "brand.brandId")
    @Mapping(target = "brandName", source = "brand.brandName")
    @Mapping(target = "productSlug", source = "productSlug")
    @Mapping(target = "categoryIds", expression = "java(product.getCategories() == null ? java.util.Collections.emptyList() : product.getCategories().stream().map(com.example.e_commerce.features.product.entity.Category::getCategoryId).collect(java.util.stream.Collectors.toList()))")
    @Mapping(target = "categoryNames", expression = "java(product.getCategories() == null ? java.util.Collections.emptyList() : product.getCategories().stream().map(com.example.e_commerce.features.product.entity.Category::getCategoryName).collect(java.util.stream.Collectors.toList()))")
    ProductResponse toResponse(Product product);

    default UUID mapCategoryToId(Category category) {
        return category == null ? null : category.getCategoryId();
    }
    default String mapCategoryToName(Category category) {
        return category == null ? null : category.getCategoryName();
    }
}
