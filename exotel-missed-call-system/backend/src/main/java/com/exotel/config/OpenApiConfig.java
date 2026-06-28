package com.exotel.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Exotel Missed Call Management System API")
                        .version("1.0.0")
                        .description("REST API documentation for managing, searching, filtering missed calls, and sync status with Exotel service.")
                        .contact(new Contact()
                                .name("API Support")
                                .email("support@exotel.com")));
    }
}
