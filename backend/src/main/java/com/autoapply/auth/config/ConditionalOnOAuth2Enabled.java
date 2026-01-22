package com.autoapply.auth.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.lang.NonNull;

/**
 * Condition that checks if Google OAuth2 client ID is configured.
 * This allows the ClientRegistrationRepository bean to be created only when OAuth2 is actually enabled.
 */
public class ConditionalOnOAuth2Enabled implements Condition {
    
    @Override
    public boolean matches(@NonNull ConditionContext context, @NonNull AnnotatedTypeMetadata metadata) {
        String googleClientId = context.getEnvironment()
                .getProperty("spring.security.oauth2.client.registration.google.client-id", "");
        
        return googleClientId != null && !googleClientId.trim().isEmpty();
    }
}
