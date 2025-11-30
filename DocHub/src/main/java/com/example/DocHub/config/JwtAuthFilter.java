package com.example.DocHub.config;

import com.example.DocHub.security.CustomUserDetailsService;
import com.example.DocHub.security.JwtService;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;

        // ⛔ IMPORTANT: Skip token check for login/register
        if (req.getRequestURI().startsWith("/auth")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            var userDetails = userDetailsService.loadUserByUsername(email);

            if (jwtService.isTokenValid(token, userDetails)) {
                var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        chain.doFilter(request, response);
    }
}
