package com.example.e_commerce.features.roles.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Set;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class RoleResponse {
    private UUID roleId;
    private String roleName;
    private Set<PermissionResponse> permissions;
}
