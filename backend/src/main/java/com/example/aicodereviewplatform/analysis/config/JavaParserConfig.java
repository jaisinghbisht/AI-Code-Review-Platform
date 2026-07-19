package com.example.aicodereviewplatform.analysis.config;

import com.github.javaparser.ParserConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JavaParserConfig {

    @Bean
    public ParserConfiguration parserConfiguration() {
        // Configure JavaParser to understand modern Java syntax, including text blocks.
        // The JAVA_21 enum is not available in this library version, but JAVA_17 is sufficient.
        return new ParserConfiguration().setLanguageLevel(ParserConfiguration.LanguageLevel.JAVA_17);
    }
}
