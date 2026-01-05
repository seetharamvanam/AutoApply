package com.autoapply.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "cors")
public class CorsProperties {
    /**
     * Allowed origins/patterns for CORS, e.g. http://localhost:3000, chrome-extension://*
     */
    private List<String> allowedOrigins = List.of("http://localhost:3000");

    /**
     * Allowed HTTP methods, e.g. GET,POST,PUT,DELETE,PATCH,OPTIONS
     */
    private List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS");

    /**
     * Allowed headers. "*" is typical for APIs.
     */
    private List<String> allowedHeaders = List.of("*");

    /**
     * Whether to allow cookies/authorization headers to be included.
     */
    private boolean allowCredentials = true;

    /**
     * Preflight cache duration in seconds.
     */
    private long maxAge = 3600;

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public List<String> getAllowedMethods() {
        return allowedMethods;
    }

    public void setAllowedMethods(List<String> allowedMethods) {
        this.allowedMethods = allowedMethods;
    }

    public List<String> getAllowedHeaders() {
        return allowedHeaders;
    }

    public void setAllowedHeaders(List<String> allowedHeaders) {
        this.allowedHeaders = allowedHeaders;
    }

    public boolean isAllowCredentials() {
        return allowCredentials;
    }

    public void setAllowCredentials(boolean allowCredentials) {
        this.allowCredentials = allowCredentials;
    }

    public long getMaxAge() {
        return maxAge;
    }

    public void setMaxAge(long maxAge) {
        this.maxAge = maxAge;
    }
}


