package com.example.e_commerce.features.roles.repository;

import com.example.e_commerce.features.roles.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    boolean existsByRoleName(String roleName);

    Optional<Role> findByRoleName(String roleName);
}
