package com.example.e_commerce.features.roles.mapper;

import com.example.e_commerce.features.roles.dto.request.PermissionRequest;
import com.example.e_commerce.features.roles.dto.response.PermissionResponse;
import com.example.e_commerce.features.roles.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    @Mapping(target = "permissionId", ignore = true)
    Permission toEntity(PermissionRequest request);

    PermissionResponse toResponse(Permission permission);

    @Mapping(target = "permissionId", ignore = true)
    void updateEntity(@MappingTarget Permission permission, PermissionRequest request);
}
