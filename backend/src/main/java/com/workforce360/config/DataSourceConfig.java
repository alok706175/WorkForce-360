package com.workforce360.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties() {
            @Override
            public String determineUrl() {
                String rawUrl = super.determineUrl();
                if (rawUrl != null) {
                    if (rawUrl.startsWith("postgres://")) {
                        return "jdbc:postgresql://" + rawUrl.substring(11);
                    } else if (rawUrl.startsWith("postgresql://")) {
                        return "jdbc:postgresql://" + rawUrl.substring(13);
                    }
                }
                return rawUrl;
            }
        };
    }
}
