package com.example.DocHub.config;

import com.example.DocHub.entity.User;
import com.example.DocHub.repository.UserRepository;
import com.example.DocHub.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String name = oauthUser.getAttribute("name");
        String email = oauthUser.getAttribute("email");

        // Auto-create user if not exists
        userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .email(email)
                    .fullName(name != null ? name : "OAuth User")
                    .password("OAUTH_USER") // OAuth users don't use passwords
                    .build();
            return userRepository.save(user);
        });

        // Generate JWT token
        String token = jwtService.generateToken(email);

        // Redirect to Angular with JWT
        response.sendRedirect("http://localhost:4200/social-login?token=" + token);
    }
}
