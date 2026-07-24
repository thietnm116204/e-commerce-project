package com.example.e_commerce.features.brand.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrandRequest {
    @NotBlank(message = "Tên thương hiệu không được để trống")
    @Size(max = 100, message = "Tên thương hiệu không quá 100 ký tự")
    private String brandName;

    @Size(max = 500, message = "URL logo không quá 500 ký tự")
    private String brandLogo;

    @Size(max = 100, message = "Xuất xứ không quá 100 ký tự")
    private String brandOrigin;

}
