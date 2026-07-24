package com.example.e_commerce.features.order.entity.payment;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.vnpay")
@Getter
@Setter
public class VnpayProperties {

    private String tmnCode;

    private String hashSecret;

    private String payUrl;

    private String returnUrl;

    private String frontendReturnUrl;

    private String ipnUrl;

    private String version;

    private String command;

    private String currCode;

    private String locale;

    private String orderType;

    private Integer expireMinutes;
}
