package com.example.e_commerce.features.user.controller;

import com.example.e_commerce.features.user.dto.request.UpdateUserByAdminRequest;
import com.example.e_commerce.features.user.dto.request.UpdateUserRequest;
import com.example.e_commerce.features.user.dto.response.UserResponse;
import com.example.e_commerce.features.user.service.UserService;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<UserResponse>> getUserDetail() {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.USER_INFO_SUCCESS)
                        .data(userService.getUserDetail())
                        .build()
        );
    }

    @PutMapping("/info")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_USER_SUCCESS)
                        .data(userService.updateCurrentUser(request))
                        .build()
        );
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserByAdminRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_USER_SUCCESS)
                        .data(userService.updateUser(userId, request))
                        .build()
        );
    }

}
