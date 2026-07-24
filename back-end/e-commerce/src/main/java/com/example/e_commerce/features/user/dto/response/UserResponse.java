package com.example.e_commerce.features.user.dto.response;

import com.example.e_commerce.features.roles.dto.response.RoleResponse;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserResponse {
    private String userEmail;
    private String userFullName;
    private String userPhone;
    private String avatarUrl;
    private Boolean isActive;
    private List<RoleResponse> roleResponse;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
