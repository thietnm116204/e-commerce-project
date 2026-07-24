package com.example.e_commerce.features.roles.service;

import com.example.e_commerce.features.roles.dto.request.RoleRequest;
import com.example.e_commerce.features.roles.dto.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    RoleResponse create(RoleRequest request);

    RoleResponse update(UUID roleId, RoleRequest request);

    RoleResponse getById(UUID roleId);

    List<RoleResponse> getAll();

    void delete(UUID roleId);
}
