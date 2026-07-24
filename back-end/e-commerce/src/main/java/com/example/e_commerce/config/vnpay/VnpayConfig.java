package com.example.e_commerce.config.vnpay;

import com.example.e_commerce.features.order.entity.payment.VnpayProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Đăng ký VnpayProperties (đang @ConfigurationProperties nhưng chưa có @Component/@Configuration)
 * để Spring bind giá trị từ application.yml (prefix "app.vnpay") vào bean.
 */
@Configuration
@EnableConfigurationProperties(VnpayProperties.class)
public class VnpayConfig {
}