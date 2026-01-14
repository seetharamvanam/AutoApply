package com.autoapply.auth.handler;

import com.autoapply.auth.entity.User;
import com.autoapply.auth.service.JwtService;
import com.autoapply.auth.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtService jwtService;
    private final UserService userService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = extractEmail(oauth2User);
        String firstName = extractFirstName(oauth2User);
        String lastName = extractLastName(oauth2User);

        User user = userService.findOrCreateOAuthUser(email, firstName, lastName);
        String jwt = jwtService.generateToken(user.getId(), user.getEmail());

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/auth/callback")
                .queryParam("token", jwt)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String extractEmail(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        // Google provides email directly
        if (attributes.containsKey("email")) {
            return (String) attributes.get("email");
        }
        // GitHub may need additional API call, but for now try login
        return (String) attributes.getOrDefault("login", attributes.get("name"));
    }

    private String extractFirstName(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String name = (String) attributes.getOrDefault("given_name", attributes.get("name"));
        if (name != null && name.contains(" ")) {
            return name.split(" ")[0];
        }
        return name;
    }

    private String extractLastName(OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String name = (String) attributes.getOrDefault("family_name", attributes.get("name"));
        if (name != null && name.contains(" ")) {
            String[] parts = name.split(" ");
            return parts.length > 1 ? parts[parts.length - 1] : null;
        }
        return name;
    }
}
