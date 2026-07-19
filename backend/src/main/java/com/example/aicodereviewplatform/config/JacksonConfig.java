package com.example.aicodereviewplatform.config;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Hibernate6Module hibernate6Module() {
        // This module teaches Jackson how to handle Hibernate-specific types and proxies,
        // preventing errors during serialization of lazy-loaded collections.
        return new Hibernate6Module();
    }
}
