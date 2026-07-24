package com.example.e_commerce.features.roles.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class PermissionResponse {
    private UUID permissionId;
    private String permissionName;
}
