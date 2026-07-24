package com.example.e_commerce.features.roles.repository;

import com.example.e_commerce.features.roles.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    boolean existsByPermissionName(String permissionName);

    Optional<Permission> findByPermissionName(String permissionName);
}
