package com.workforce360.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties() {
            private String parsedUrl;
            private String parsedUsername;
            private String parsedPassword;
            private boolean initialized = false;

            private synchronized void init() {
                if (initialized) return;
                initialized = true;

                String rawUrl = super.determineUrl();
                if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
                    try {
                        URI uri = new URI(rawUrl);
                        if (uri.getUserInfo() != null) {
                            String[] userParts = uri.getUserInfo().split(":", 2);
                            this.parsedUsername = userParts[0];
                            if (userParts.length > 1) {
                                this.parsedPassword = userParts[1];
                            }
                        }
                        String host = uri.getHost();
                        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                        String path = uri.getPath() != null && !uri.getPath().isEmpty() ? uri.getPath() : "/defaultdb";
                        String query = uri.getQuery() != null ? "?" + uri.getQuery() : "?sslmode=require";
                        this.parsedUrl = "jdbc:postgresql://" + host + ":" + port + path + query;
                    } catch (Exception ex) {
                        this.parsedUrl = rawUrl;
                    }
                } else {
                    this.parsedUrl = rawUrl;
                }
            }

            @Override
            public String determineUrl() {
                init();
                return parsedUrl != null ? parsedUrl : super.determineUrl();
            }

            @Override
            public String determineUsername() {
                init();
                if (parsedUsername != null && !parsedUsername.isEmpty()) {
                    return parsedUsername;
                }
                return super.determineUsername();
            }

            @Override
            public String determinePassword() {
                init();
                if (parsedPassword != null && !parsedPassword.isEmpty()) {
                    return parsedPassword;
                }
                return super.determinePassword();
            }
        };
    }
}
