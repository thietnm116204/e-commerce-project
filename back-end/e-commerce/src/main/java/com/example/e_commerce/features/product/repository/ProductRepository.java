package com.example.e_commerce.features.product.repository;

import com.example.e_commerce.features.product.entity.Product;
import com.example.e_commerce.features.product.entity.ProductImage;
import com.example.e_commerce.shared.status.ProductStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findAllByIsActiveTrue();

    Optional<Product> findByProductSlug(String productSlug);

    boolean existsByProductSlug(String productSlug);

    boolean existsByProductName(String productName);


    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN p.brand b " +
           "LEFT JOIN p.categories c " +
           "WHERE (:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', CAST(:productName AS string), '%'))) " +
           "AND (CAST(:brandId AS uuid) IS NULL OR b.brandId = :brandId) " +
           "AND (CAST(:categoryId AS uuid) IS NULL OR c.categoryId = :categoryId) " +
           "AND (CAST(:isActive AS boolean) IS NULL OR p.isActive = :isActive) " +
           "AND (:productStatus IS NULL OR p.productStatus = :productStatus) " +
           "AND (:minPrice IS NULL OR p.productPrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.productPrice <= :maxPrice)")
    Page<Product> searchProducts(
            @Param("productName") String productName,
            @Param("brandId") UUID brandId,
            @Param("categoryId") UUID categoryId,
            @Param("isActive") Boolean isActive,
            @Param("productStatus") ProductStatus productStatus,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );


    @Query("""
    SELECT DISTINCT p FROM Product p
    LEFT JOIN p.categories c
    WHERE (:productName IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%')))
      AND (:brandId IS NULL OR p.brand.brandId = :brandId)
      AND (:categoryIds IS NULL OR c.categoryId IN :categoryIds)
      AND (:isActive IS NULL OR p.isActive = :isActive)
      AND (:productStatus IS NULL OR p.productStatus = :productStatus)
      AND (:minPrice IS NULL OR p.productPrice >= :minPrice)
      AND (:maxPrice IS NULL OR p.productPrice <= :maxPrice)
    """)
    Page<Product> searchProductHomes(
            @Param("productName") String productName,
            @Param("brandId") UUID brandId,
            @Param("categoryIds") List<UUID> categoryIds,
            @Param("isActive") Boolean isActive,
            @Param("productStatus") ProductStatus productStatus,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.productId = :productId")
    Optional<Product> findByIdForUpdate(@Param("productId") UUID productId);
}

