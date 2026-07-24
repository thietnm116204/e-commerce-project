package com.example.e_commerce.features.roles.service.impl;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.roles.dto.request.PermissionRequest;
import com.example.e_commerce.features.roles.dto.response.PermissionResponse;
import com.example.e_commerce.features.roles.entity.Permission;
import com.example.e_commerce.features.roles.mapper.PermissionMapper;
import com.example.e_commerce.features.roles.repository.PermissionRepository;
import com.example.e_commerce.features.roles.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {
    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    @Override
    @Transactional
    public PermissionResponse create(PermissionRequest request) {
        String permissionName = normalizeName(request.getPermissionName());

        if (permissionRepository.existsByPermissionName(permissionName)) {
            throw new AppException(ErrorCode.PERMISSION_ALREADY_EXISTS);
        }

        Permission permission = permissionMapper.toEntity(request);
        permission.setPermissionName(permissionName);

        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    @Transactional
    public PermissionResponse update(UUID permissionId, PermissionRequest request) {
        Permission permission = findPermission(permissionId);
        String permissionName = normalizeName(request.getPermissionName());

        permissionRepository.findByPermissionName(permissionName)
                .filter(existing -> !existing.getPermissionId().equals(permissionId))
                .ifPresent(existing -> {
                    throw new AppException(ErrorCode.PERMISSION_ALREADY_EXISTS);
                });

        permissionMapper.updateEntity(permission, request);
        permission.setPermissionName(permissionName);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    @Transactional(readOnly = true)
    public PermissionResponse getById(UUID permissionId) {
        return permissionMapper.toResponse(findPermission(permissionId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll()
                .stream()
                .map(permissionMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(UUID permissionId) {
        Permission permission = findPermission(permissionId);
        permissionRepository.delete(permission);
    }

    private Permission findPermission(UUID permissionId) {
        return permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
    }

    private String normalizeName(String name) {
        return name.trim().toUpperCase();
    }
}
