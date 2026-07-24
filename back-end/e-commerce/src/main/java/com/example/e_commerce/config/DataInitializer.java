package com.example.e_commerce.config;

import com.example.e_commerce.features.roles.entity.Permission;
import com.example.e_commerce.features.roles.entity.Role;
import com.example.e_commerce.features.roles.repository.PermissionRepository;
import com.example.e_commerce.features.roles.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String USER_ROLE = "USER";
    private static final Set<String> DEFAULT_PERMISSIONS = Set.of(
            "ROLE_CREATE",
            "ROLE_READ",
            "ROLE_UPDATE",
            "ROLE_DELETE",
            "PERMISSION_CREATE",
            "PERMISSION_READ",
            "PERMISSION_UPDATE",
            "PERMISSION_DELETE",
            "UPDATE_USER",
            "GET_INIT_PRODUCT"
    );

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Set<Permission> permissions = seedPermissions();
        seedAdminRole(permissions);
        seedUserRole();
    }

    private Set<Permission> seedPermissions() {
        Set<Permission> permissions = new LinkedHashSet<>();

        for (String permissionName : DEFAULT_PERMISSIONS) {
            Permission permission = permissionRepository.findByPermissionName(permissionName)
                    .orElseGet(() -> permissionRepository.save(
                            Permission.builder()
                                    .permissionName(permissionName)
                                    .build()
                    ));

            permissions.add(permission);
        }

        return permissions;
    }

    private void seedAdminRole(Set<Permission> permissions) {
        Role adminRole = roleRepository.findByRoleName(ADMIN_ROLE)
                .orElseGet(() -> Role.builder()
                        .roleName(ADMIN_ROLE)
                        .build());

        adminRole.getPermissions().addAll(permissions);
        roleRepository.save(adminRole);
    }

    private void seedUserRole() {
        roleRepository.findByRoleName(USER_ROLE)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName(USER_ROLE)
                                .build()
                ));
    }
}
