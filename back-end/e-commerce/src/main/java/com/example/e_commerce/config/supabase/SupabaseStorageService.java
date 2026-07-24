package com.example.e_commerce.config.supabase;

import com.example.e_commerce.exception.AppException;
import com.example.e_commerce.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    private final SupabaseProperties supabaseProperties;
    private final RestTemplate restTemplate;

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        String extension = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;

        String uploadUrl = supabaseProperties.getUrl()
                + "/storage/v1/object/"
                + supabaseProperties.getBucket()
                + "/" + fileName;

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseProperties.getApiKey());
            headers.set("apikey", supabaseProperties.getApiKey());
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl, HttpMethod.POST, entity, String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new AppException(ErrorCode.UPLOAD_FAILED);
            }

            return supabaseProperties.getUrl()
                    + "/storage/v1/object/public/"
                    + supabaseProperties.getBucket()
                    + "/" + fileName;

        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        String prefix = supabaseProperties.getUrl()
                + "/storage/v1/object/public/"
                + supabaseProperties.getBucket() + "/";

        if (!fileUrl.startsWith(prefix)) {
            return;
        }

        String fileName = fileUrl.substring(prefix.length());

        String deleteUrl = supabaseProperties.getUrl()
                + "/storage/v1/object/"
                + supabaseProperties.getBucket()
                + "/" + fileName;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseProperties.getApiKey());
        headers.set("apikey", supabaseProperties.getApiKey());

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, String.class);
        } catch (Exception e) {
            // Không throw lỗi ra ngoài, vì xóa ảnh cũ thất bại không nên chặn việc update brand
        }
    }
}