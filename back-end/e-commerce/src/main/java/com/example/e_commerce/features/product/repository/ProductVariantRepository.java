package com.example.e_commerce.features.product.repository;

import com.example.e_commerce.features.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    List<ProductVariant> findAllByIsActiveTrue();

    Optional<ProductVariant> findBySku(String sku);

    boolean existsBySku(String sku);
}
