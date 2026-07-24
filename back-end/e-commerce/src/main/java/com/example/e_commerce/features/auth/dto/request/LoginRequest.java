package com.example.e_commerce.features.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @Email(message = "Email không đúng định dạng")
    @NotBlank(message = "Chưa nhập email")
    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    private String userEmail;

    @NotBlank(message = "Chưa nhập password")
    @Size(min = 8, max = 50, message = "Password phải từ 8 đến 50 ký tự")
    private String userPassword;
}
