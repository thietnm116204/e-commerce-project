package com.example.e_commerce.features.brand.repository;

import com.example.e_commerce.features.brand.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    //tim them slug
    Optional<Brand> findByBrandSlug(String brandSlug);

    Optional<Brand> findByBrandName(String brandName);

    // lấy tất cả brand đang active
    List<Brand> findAllByIsActiveTrue();

    // kiểm tra slug đã tồn tại chưa (tránh trùng)
    boolean existsByBrandSlug(String brandSlug);

    // kiểm tra tên đã tồn tại chưa
    boolean existsByBrandName(String brandName);
    @Query("SELECT b FROM Brand b WHERE " +
            "(:brandName IS NULL OR LOWER(b.brandName) LIKE LOWER(CONCAT('%', :brandName, '%'))) AND " +
            "(:brandOrigin IS NULL OR LOWER(b.brandOrigin) LIKE LOWER(CONCAT('%', :brandOrigin, '%'))) AND " +
            "(:isActive IS NULL OR b.isActive = :isActive)")
    Page<Brand> searchBrands(@Param("brandName") String brandName,
                             @Param("brandOrigin") String brandOrigin,
                             @Param("isActive") Boolean isActive,
                             Pageable pageable);
    @Query("SELECT DISTINCT b.brandOrigin FROM Brand b WHERE b.brandOrigin IS NOT NULL ORDER BY b.brandOrigin")
    List<String> findDistinctOrigins();

}
