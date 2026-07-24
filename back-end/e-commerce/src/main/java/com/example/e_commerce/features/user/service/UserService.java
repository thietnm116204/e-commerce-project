package com.example.e_commerce.features.user.service;

import com.example.e_commerce.features.user.dto.request.RegisterRequest;
import com.example.e_commerce.features.user.dto.request.UpdateUserByAdminRequest;
import com.example.e_commerce.features.user.dto.request.UpdateUserRequest;
import com.example.e_commerce.features.user.dto.response.UserResponse;
import com.example.e_commerce.features.user.entity.User;

import java.util.UUID;

public interface UserService {
    User register(RegisterRequest request);
    UserResponse getUserDetail();
    UserResponse updateCurrentUser(UpdateUserRequest userRequest);
    UserResponse updateUser(UUID userId, UpdateUserByAdminRequest userRequest);
}
