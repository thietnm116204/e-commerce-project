package com.example.e_commerce.features.roles.controller;

import com.example.e_commerce.features.roles.dto.request.PermissionRequest;
import com.example.e_commerce.features.roles.dto.response.PermissionResponse;
import com.example.e_commerce.features.roles.service.PermissionService;
import com.example.e_commerce.shared.ApiResponse;
import com.example.e_commerce.shared.MessageConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PermissionResponse>> create(
            @Valid @RequestBody PermissionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<PermissionResponse>builder()
                        .code(HttpStatus.CREATED.value())
                        .message(MessageConstants.CREATE_PERMISSION_SUCCESS)
                        .data(permissionService.create(request))
                        .build()
        );
    }

    @PutMapping("/{permissionId}")
    public ResponseEntity<ApiResponse<PermissionResponse>> update(
            @PathVariable UUID permissionId,
            @Valid @RequestBody PermissionRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PermissionResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_PERMISSION_SUCCESS)
                        .data(permissionService.update(permissionId, request))
                        .build()
        );
    }

    @GetMapping("/{permissionId}")
    public ResponseEntity<ApiResponse<PermissionResponse>> getById(@PathVariable UUID permissionId) {
        return ResponseEntity.ok(
                ApiResponse.<PermissionResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PERMISSION_SUCCESS)
                        .data(permissionService.getById(permissionId))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<PermissionResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_PERMISSION_SUCCESS)
                        .data(permissionService.getAll())
                        .build()
        );
    }

    @DeleteMapping("/{permissionId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID permissionId) {
        permissionService.delete(permissionId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.DELETE_PERMISSION_SUCCESS)
                        .build()
        );
    }
}
