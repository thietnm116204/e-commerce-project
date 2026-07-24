package com.example.e_commerce.features.brand.service.impl;

import com.example.e_commerce.config.supabase.SupabaseStorageService;
import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import com.example.e_commerce.features.brand.dto.request.BrandRequest;
import com.example.e_commerce.features.brand.dto.request.BrandSearchRequest;
import com.example.e_commerce.features.brand.dto.response.BrandResponse;
import com.example.e_commerce.features.brand.entity.Brand;
import com.example.e_commerce.features.brand.mapper.BrandMapper;
import com.example.e_commerce.features.brand.repository.BrandRepository;
import com.example.e_commerce.features.brand.service.BrandService;
import com.example.e_commerce.shared.PageResponse;
import com.example.e_commerce.shared.utils.SlugUtils;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    private final BrandMapper brandMapper;

    private final SlugUtils slugUtils;

    private final SupabaseStorageService storageService;


    @Override
    public BrandResponse createBrand(BrandRequest request, String logoUrl) {
        if(brandRepository.existsByBrandName(request.getBrandName())) {
            throw new AppException(ErrorCode.BRAND_ALREADY_EXISTS);
        }
        Brand brand = brandMapper.toEntity(request);
        brand.setBrandSlug(slugUtils.generateSlug(request.getBrandName()));
        brand.setIsActive(true);
        brand.setBrandLogo(logoUrl);

        return brandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    public BrandResponse updateBrand(UUID brandId, BrandRequest request, MultipartFile file) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(()-> new AppException(ErrorCode.BRAND_NOT_FOUD));

        brandMapper.updateEntity(brand, request);
        brand.setBrandSlug(slugUtils.generateSlug(request.getBrandName()));
        if (file != null && !file.isEmpty()) {
            String oldLogo = brand.getBrandLogo();
            String newLogoUrl = storageService.uploadFile(file);
            brand.setBrandLogo(newLogoUrl);

            if (oldLogo != null && !oldLogo.isBlank()) {
                storageService.deleteFile(oldLogo);
            }
        }

        return brandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    public void deleteBrand(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.BRAND_NOT_FOUD));
        if (brand.getBrandLogo() != null && !brand.getBrandLogo().isBlank()) {
            storageService.deleteFile(brand.getBrandLogo());
        }
        brandRepository.deleteById(id);
    }

    @Override
    public List<BrandResponse> getAllBrands(){
        return brandRepository.findAllByIsActiveTrue()
                .stream()
                .map(brandMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BrandResponse getBrand(String slug){
        Brand brand = brandRepository.findByBrandSlug(slug)
                .orElseThrow(()->new AppException(ErrorCode.BRAND_NOT_FOUD));
        return brandMapper.toResponse(brand);
    }
    @Override
    @Transactional(readOnly = true)
    public PageResponse<BrandResponse> searchBrands(BrandSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Brand> brandPage = brandRepository.searchBrands(
                request.getBrandName(),
                request.getBrandOrigin(),
                request.getIsActive(),
                pageable
        );
        List<BrandResponse> content = brandPage.getContent().stream()
                .map(brandMapper::toResponse)
                .collect(Collectors.toList());
        return PageResponse.<BrandResponse>builder()
                .pageNo(brandPage.getNumber())
                .pageSize(brandPage.getSize())
                .totalElements(brandPage.getTotalElements())
                .totalPages(brandPage.getTotalPages())
                .last(brandPage.isLast())
                .content(content)
                .build();
    }

    @Override
    public BrandResponse brandStatus(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.BRAND_NOT_FOUD));
        brand.setIsActive(!brand.getIsActive());
        return brandMapper.toResponse(brandRepository.save(brand));
    }
    @Override
    public List<String> getBrandOrigins() {
        return brandRepository.findDistinctOrigins();
    }

}
