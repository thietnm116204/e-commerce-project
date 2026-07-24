package com.example.e_commerce.features.user.service.impl;

import com.example.e_commerce.features.roles.entity.Role;
import com.example.e_commerce.features.roles.repository.RoleRepository;
import com.example.e_commerce.features.user.dto.request.RegisterRequest;
import com.example.e_commerce.features.user.dto.request.UpdateUserByAdminRequest;
import com.example.e_commerce.features.user.dto.request.UpdateUserRequest;
import com.example.e_commerce.features.user.dto.response.UserResponse;
import com.example.e_commerce.features.user.entity.User;
import com.example.e_commerce.features.user.mapper.UserMapper;
import com.example.e_commerce.features.user.repository.UserRepository;
import com.example.e_commerce.features.user.service.UserService;
import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private static final String DEFAULT_USER_ROLE = "USER";
    private static final String UPDATE_USER_PERMISSION = "UPDATE_USER";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    //Đăng ký người dùng
    @Override
    @Transactional
    public User register(RegisterRequest request) {
        String email = request.getUserEmail().trim().toLowerCase();

        if (userRepository.existsByUserEmail(email)){
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        User user = userMapper.toEntity(request);
        user.setUserEmail(email);
        user.setUserPassword(
                passwordEncoder.encode(request.getUserPassword())
        );
        user.setIsActive(true);
        Role userRole = roleRepository.findByRoleName(DEFAULT_USER_ROLE)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        user.getRoles().add(userRole);
        return userRepository.save(user);
    }

    //Lấy thông tin người dùng
    @Override
    @Transactional
    public UserResponse getUserDetail() {
        return userMapper.toResponse(getCurrentUser());
    }

    //update user người dùng
    @Override
    @Transactional
    public UserResponse updateCurrentUser(UpdateUserRequest userRequest) {
        User user = getCurrentUser();
        updateUserFields(user, userRequest);
        return userMapper.toResponse(userRepository.save(user));
    }

    //update user admin
    @Override
    @Transactional
    public UserResponse updateUser(UUID userId, UpdateUserByAdminRequest userRequest) {
        validatePermission(UPDATE_USER_PERMISSION);

        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUD));

        updateUserFields(user, userRequest);
        updateUserRole(user, userRequest);
        return userMapper.toResponse(userRepository.save(user));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUserEmail(email)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUD));
    }

    //Cập nhật thông tin user
    private void updateUserFields(User user, UpdateUserRequest userRequest) {
        userMapper.updateEntity(user, userRequest);

        if (StringUtils.hasText(userRequest.getUserPassword())) {
            user.setUserPassword(passwordEncoder.encode(userRequest.getUserPassword()));
        }
    }
    //Chỉnh sữa quyền cho user
    private void updateUserRole(User user, UpdateUserByAdminRequest userRequest) {
        if (userRequest.getRoleId() == null) {
            return;
        }

        Role role = roleRepository.findById(userRequest.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        user.getRoles().clear();
        user.getRoles().add(role);
    }

    //Kiểm tra quyền
    private void validatePermission(String permissionName) {
        User currentUser = getCurrentUser();
        boolean hasPermission = currentUser.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(permission -> permissionName.equals(permission.getPermissionName()));

        if (!hasPermission) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }
}
