package com.movie_app.movie_app_api.core.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer",
        description = "Enter JWT Bearer token to authorize requests"
)
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Movie App API - Documentation")
                        .version("1.0.0")
                        .description("Comprehensive REST API for Movie App platform featuring role-based administration, "
                                + "catalog management, user profiles, video streaming, reviews, and subscriptions.")
                        .contact(new Contact()
                                .name("Movie App Engineering")
                                .email("support@movieapp.com"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")));
    }

    /**
     * Group 1: Complete platform API (All Endpoints)
     */
    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("1. All Endpoints")
                .pathsToMatch("/**")
                .build();
    }

    /**
     * Group 2: Administration Portal API (Requires ROLE_ADMIN)
     */
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("2. Admin APIs")
                .pathsToMatch("/api/v1/admin/**")
                .build();
    }

    /**
     * Group 3: Public & User-facing Client API
     */
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("3. User & Client APIs")
                .pathsToMatch("/api/v1/**")
                .pathsToExclude("/api/v1/admin/**")
                .build();
    }
}