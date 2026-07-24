package com.example.e_commerce.config.supabase;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "supabase")
@Data
public class SupabaseProperties {
    private String url;
    private String apiKey;
    private String bucket;
}
