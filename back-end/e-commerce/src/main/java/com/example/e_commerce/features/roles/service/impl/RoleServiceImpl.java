package com.example.e_commerce.features.roles.service.impl;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.roles.dto.request.RoleRequest;
import com.example.e_commerce.features.roles.dto.response.RoleResponse;
import com.example.e_commerce.features.roles.entity.Permission;
import com.example.e_commerce.features.roles.entity.Role;
import com.example.e_commerce.features.roles.mapper.RoleMapper;
import com.example.e_commerce.features.roles.repository.PermissionRepository;
import com.example.e_commerce.features.roles.repository.RoleRepository;
import com.example.e_commerce.features.roles.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponse create(RoleRequest request) {
        String roleName = normalizeName(request.getRoleName());

        if (roleRepository.existsByRoleName(roleName)) {
            throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
        }

        Role role = roleMapper.toEntity(request);
        role.setRoleName(roleName);
        role.setPermissions(getPermissions(request.getPermissionIds()));

        return roleMapper.toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public RoleResponse update(UUID roleId, RoleRequest request) {
        Role role = findRole(roleId);
        String roleName = normalizeName(request.getRoleName());

        roleRepository.findByRoleName(roleName)
                .filter(existing -> !existing.getRoleId().equals(roleId))
                .ifPresent(existing -> {
                    throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
                });

        roleMapper.updateEntity(role, request);
        role.setRoleName(roleName);
        role.setPermissions(getPermissions(request.getPermissionIds()));
        return roleMapper.toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getById(UUID roleId) {
        return roleMapper.toResponse(findRole(roleId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(UUID roleId) {
        Role role = findRole(roleId);
        roleRepository.delete(role);
    }

    private Role findRole(UUID roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }

    private Set<Permission> getPermissions(Set<UUID> permissionIds) {
        if (permissionIds == null || permissionIds.isEmpty()) {
            return new HashSet<>();
        }

        Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(permissionIds));
        if (permissions.size() != permissionIds.size()) {
            throw new AppException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        return permissions;
    }

    private String normalizeName(String name) {
        return name.trim().toUpperCase();
    }
}
