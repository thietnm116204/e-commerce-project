package com.example.e_commerce.features.product.dto.request.category;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private Boolean isActive;
}
