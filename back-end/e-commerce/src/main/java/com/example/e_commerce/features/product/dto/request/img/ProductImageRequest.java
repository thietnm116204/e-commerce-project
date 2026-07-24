package com.example.e_commerce.features.product.dto.request.img;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageRequest {
    @NotNull(message = "Product không được để trống")
    private UUID productId;

    private UUID variantId;

    @NotBlank(message = "URL ảnh không được để trống")
    @Size(max = 500, message = "URL ảnh không quá 500 ký tự")
    private String productImageUrl;

    private Boolean isPrimary;

    private Integer sortOrder;
}
