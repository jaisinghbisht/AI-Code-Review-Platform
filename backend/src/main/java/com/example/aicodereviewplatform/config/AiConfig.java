package com.example.aicodereviewplatform.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    @Bean
    public org.springframework.boot.web.client.RestClientCustomizer restClientCustomizer() {
        return restClientBuilder -> {
            org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = 
                    new org.springframework.http.client.SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(60000); // 60 seconds
            requestFactory.setReadTimeout(900000);   // 15 minutes (900,000 ms)
            restClientBuilder.requestFactory(requestFactory);
        };
    }
}