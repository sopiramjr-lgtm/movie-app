package com.movie_app.movie_app_api.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "khqr")
public class KhqrProperties {
    private String baseUrl;
    private String token;
    private String account;
    private String merchantName;
    private String merchantCity;
    private String phone;
    private String storeLabel;
    private Double usdToKhrRate;
}
