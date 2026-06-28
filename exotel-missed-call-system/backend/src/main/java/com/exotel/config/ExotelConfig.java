package com.exotel.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;

@Data
@Configuration
@ConfigurationProperties(prefix = "exotel")
public class ExotelConfig {

    private String accountSid;
    private String apiKey;
    private String apiToken;
    private String baseUrl;

    @Bean
    public RestTemplate exotelRestTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000); // 5 seconds connection timeout
        requestFactory.setReadTimeout(10000);    // 10 seconds read timeout

        RestTemplate restTemplate = new RestTemplate(requestFactory);
        // Exotel API uses basic HTTP auth: apiKey:apiToken
        restTemplate.getInterceptors().add(new BasicAuthenticationInterceptor(apiKey, apiToken));
        return restTemplate;
    }
}
