package com.example.e_commerce.features.roles.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
public class RoleRequest {
    @NotBlank(message = "Chưa nhập tên role")
    @Size(max = 50, message = "Tên role không được vượt quá 50 ký tự")
    private String roleName;

    private Set<UUID> permissionIds = new HashSet<>();
}
