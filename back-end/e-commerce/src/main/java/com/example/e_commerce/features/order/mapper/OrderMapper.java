package com.example.e_commerce.features.order.mapper;

import com.example.e_commerce.features.order.dto.response.order.OrderItemResponse;
import com.example.e_commerce.features.order.dto.response.order.OrderResponse;
import com.example.e_commerce.features.order.entity.order.Order;
import com.example.e_commerce.features.order.entity.order.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    @Mapping(target = "items", source = "orderItems")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productId", source = "product.productId")
    @Mapping(target = "productName", source = "productNameSnapshot")
    @Mapping(target = "productImageUrl", source = "productImageUrl")
    OrderItemResponse toItemResponse(OrderItem orderItem);
}