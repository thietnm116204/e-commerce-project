package com.example.e_commerce.features.roles.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PermissionRequest {
    @NotBlank(message = "Chưa nhập tên permission")
    @Size(max = 100, message = "Tên permission không được vượt quá 100 ký tự")
    private String permissionName;
}
