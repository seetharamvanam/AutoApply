package com.autoapply.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom OAuth2 client configuration that only registers clients when client IDs are provided.
 * This prevents validation errors when OAuth2 is not configured.
 */
@Configuration
public class OAuth2ClientConfig {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;
    
    @Value("${spring.security.oauth2.client.registration.google.scope:openid,profile,email}")
    private String googleScope;

    @Bean
    @Conditional(ConditionalOnOAuth2Enabled.class)
    public ClientRegistrationRepository clientRegistrationRepository() {
        List<ClientRegistration> registrations = new ArrayList<>();
        
        // Only add Google registration if client ID is provided
        if (googleClientId != null && !googleClientId.trim().isEmpty()) {
            registrations.add(buildGoogleRegistration());
        }
        
        // This should never be empty due to the @Conditional check above
        // but adding a safety check just in case
        if (registrations.isEmpty()) {
            throw new IllegalStateException("OAuth2 client registration repository cannot be created with empty registrations");
        }
        
        return new InMemoryClientRegistrationRepository(registrations);
    }
    
    private ClientRegistration buildGoogleRegistration() {
        return ClientRegistration.withRegistrationId("google")
                .clientId(googleClientId)
                .clientSecret(googleClientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope(googleScope.split(","))
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v2/userinfo")
                .userNameAttributeName("email")
                .build();
    }
}
