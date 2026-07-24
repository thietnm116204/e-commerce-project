package com.example.e_commerce.features.user.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
public class UpdateUserByAdminRequest extends UpdateUserRequest {
    private UUID roleId;
}
