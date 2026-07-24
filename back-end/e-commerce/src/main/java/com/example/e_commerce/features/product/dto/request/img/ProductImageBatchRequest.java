package com.example.e_commerce.features.product.dto.request.img;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageBatchRequest {
    @NotNull(message = "Product không được để trống")
    private UUID productId;

    private UUID variantId;
}
