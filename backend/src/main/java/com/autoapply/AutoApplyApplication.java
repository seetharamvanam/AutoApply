package com.autoapply;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;

/**
 * Main Spring Boot application class for AutoApply.
 * Entry point for the job application tracking system.
 * 
 * OAuth2 client auto-configuration is excluded to prevent validation errors
 * when OAuth2 client IDs are not configured. OAuth2 is configured conditionally
 * in SecurityConfig when client IDs are provided.
 */
@SpringBootApplication(exclude = {OAuth2ClientAutoConfiguration.class})
public class AutoApplyApplication {
    public static void main(String[] args) {
        // Load .env file if it exists (before Spring Boot starts)
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("../")  // Look in parent directory (project root)
                    .ignoreIfMissing()
                    .load();
            
            // Set system properties from .env file (Spring Boot reads these via ${VAR} syntax)
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                // Only set if not already set as environment variable or system property
                if (System.getenv(key) == null && System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            });
            System.out.println("Loaded .env file successfully");
        } catch (Exception e) {
            // .env file not found or error loading - continue without it
            System.out.println("Note: .env file not found or could not be loaded: " + e.getMessage());
            System.out.println("Using environment variables or defaults from application.properties");
        }
        
        SpringApplication.run(AutoApplyApplication.class, args);
    }
}
