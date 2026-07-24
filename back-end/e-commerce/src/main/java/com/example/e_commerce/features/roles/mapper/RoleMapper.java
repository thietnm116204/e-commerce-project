package com.example.e_commerce.features.roles.mapper;

import com.example.e_commerce.features.roles.dto.request.RoleRequest;
import com.example.e_commerce.features.roles.dto.response.RoleResponse;
import com.example.e_commerce.features.roles.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = PermissionMapper.class)
public interface RoleMapper {
    @Mapping(target = "roleId", ignore = true)
    @Mapping(target = "permissions", ignore = true)
    Role toEntity(RoleRequest request);

    RoleResponse toResponse(Role role);

    @Mapping(target = "roleId", ignore = true)
    @Mapping(target = "permissions", ignore = true)
    void updateEntity(@MappingTarget Role role, RoleRequest request);
}
