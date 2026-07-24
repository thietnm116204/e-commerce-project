package com.example.e_commerce.features.product.repository;

import com.example.e_commerce.features.product.entity.Category;
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
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findByCategoryName(String categoryName);

    List<Category> findAllByIsActiveTrue();
    
    Page<Category> findAll(Pageable pageable);
    
    @Query("SELECT c FROM Category c WHERE " +
           "(:categoryName IS NULL OR LOWER(c.categoryName) LIKE LOWER(CONCAT('%', CAST(:categoryName AS string), '%'))) AND " +
           "(CAST(:parentId AS uuid) IS NULL OR c.parent.categoryId = :parentId) AND " +
           "(CAST(:isActive AS boolean) IS NULL OR c.isActive = :isActive)")
    Page<Category> searchCategories(@Param("categoryName") String categoryName, 
                                    @Param("parentId") UUID parentId, 
                                    @Param("isActive") Boolean isActive, 
                                    Pageable pageable);
    
    List<Category> findByParentIsNull();

    boolean existsByCategoryName(String categoryName);

    // Lấy danh mục lá (không có con) đang active
    @Query("SELECT c FROM Category c WHERE c.isActive = true AND " +
           "NOT EXISTS (SELECT child FROM Category child WHERE child.parent = c)")
    List<Category> findLeafCategories();
}
