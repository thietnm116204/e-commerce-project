package com.example.e_commerce.features.user.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Size(min = 8, max = 50)
    private String userPassword;

    @Size(max = 100)
    private String userFullName;

    @Pattern(
            regexp = "^(0|\\+84)[0-9]{9,10}$",
            message = "Invalid phone number"
    )
    private String userPhone;

    private String avatarUrl;
}
