package com.example.e_commerce.features.brand.mapper;

import com.example.e_commerce.features.brand.dto.request.BrandRequest;
import com.example.e_commerce.features.brand.dto.response.BrandResponse;
import com.example.e_commerce.features.brand.entity.Brand;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface BrandMapper {
    @Mapping(target = "brandId", ignore = true)
    @Mapping(target = "brandSlug", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "products", ignore = true)
    Brand toEntity(BrandRequest request);

    BrandResponse toResponse(Brand brand);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "brandId", ignore = true)
    @Mapping(target = "brandSlug", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "products", ignore = true)
    void updateEntity(@MappingTarget Brand brand, BrandRequest request);
}
