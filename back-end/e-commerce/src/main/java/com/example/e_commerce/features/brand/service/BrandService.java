package com.example.e_commerce.features.brand.service;


import com.example.e_commerce.features.brand.dto.request.BrandRequest;
import com.example.e_commerce.features.brand.dto.request.BrandSearchRequest;
import com.example.e_commerce.features.brand.dto.response.BrandResponse;
import com.example.e_commerce.shared.PageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface BrandService {
    BrandResponse createBrand(BrandRequest request, String logoUrl);
    BrandResponse updateBrand(UUID brandId, BrandRequest request, MultipartFile file);
    void deleteBrand(UUID brandId);
    List<BrandResponse> getAllBrands();
    BrandResponse getBrand(String slug);
    PageResponse<BrandResponse> searchBrands(BrandSearchRequest request);
    BrandResponse brandStatus(UUID id);
    List<String> getBrandOrigins();

}
