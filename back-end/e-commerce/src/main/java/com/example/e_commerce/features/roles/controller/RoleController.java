package com.example.e_commerce.features.roles.controller;

import com.example.e_commerce.features.roles.dto.request.RoleRequest;
import com.example.e_commerce.features.roles.dto.response.RoleResponse;
import com.example.e_commerce.features.roles.service.RoleService;
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
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<RoleResponse>builder()
                        .code(HttpStatus.CREATED.value())
                        .message(MessageConstants.CREATE_ROLE_SUCCESS)
                        .data(roleService.create(request))
                        .build()
        );
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleResponse>> update(
            @PathVariable UUID roleId,
            @Valid @RequestBody RoleRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<RoleResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.UPDATE_ROLE_SUCCESS)
                        .data(roleService.update(roleId, request))
                        .build()
        );
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleResponse>> getById(@PathVariable UUID roleId) {
        return ResponseEntity.ok(
                ApiResponse.<RoleResponse>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_ROLE_SUCCESS)
                        .data(roleService.getById(roleId))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<RoleResponse>>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.GET_ROLE_SUCCESS)
                        .data(roleService.getAll())
                        .build()
        );
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID roleId) {
        roleService.delete(roleId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(HttpStatus.OK.value())
                        .message(MessageConstants.DELETE_ROLE_SUCCESS)
                        .build()
        );
    }
}
