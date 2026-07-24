package com.example.e_commerce.features.roles.service;

import com.example.e_commerce.features.roles.dto.request.PermissionRequest;
import com.example.e_commerce.features.roles.dto.response.PermissionResponse;

import java.util.List;
import java.util.UUID;

public interface PermissionService {
    PermissionResponse create(PermissionRequest request);

    PermissionResponse update(UUID permissionId, PermissionRequest request);

    PermissionResponse getById(UUID permissionId);

    List<PermissionResponse> getAll();

    void delete(UUID permissionId);
}
