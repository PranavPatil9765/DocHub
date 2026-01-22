package com.example.DocHub.config;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.example.DocHub.exception.AppException.UnauthorizedException;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

@Component
public class PasswordResetTokenUtil {

    // 🔐 256+ bit secret (REQUIRED)
    private static final String SECRET =
        "a9d7f1c8b3e6f2a9d7f1c8b3e6f2a9d7f1c8b3e6f2a9d7f1c8b3e6f2a9";

    private static final long EXPIRY_MINUTES = 10;

    // 🧨 Token blacklist for invalidation
    private final Set<String> invalidatedTokens =
            ConcurrentHashMap.newKeySet();

    /* ================== GENERATE ================== */

    public String generateResetToken(String email) {

        return Jwts.builder()
                .setSubject(email)
                .claim("type", "RESET_PASSWORD")
                .setIssuedAt(new Date())
                .setExpiration(
                        Date.from(
                                LocalDateTime.now()
                                        .plusMinutes(EXPIRY_MINUTES)
                                        .atZone(ZoneId.systemDefault())
                                        .toInstant()
                        )
                )
                .signWith(
                        Keys.hmacShaKeyFor(
                                SECRET.getBytes(StandardCharsets.UTF_8)
                        ),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    /* ================== VALIDATE ================== */

    public String validateAndGetEmail(String token) {

        if (invalidatedTokens.contains(token)) {
            throw new UnauthorizedException("Reset token already used");
        }

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(
                            Keys.hmacShaKeyFor(
                                    SECRET.getBytes(StandardCharsets.UTF_8)
                            )
                    )
                    .require("type", "RESET_PASSWORD")
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();

        } catch (ExpiredJwtException e) {
            throw new UnauthorizedException("Reset token expired");

        } catch (JwtException e) {
            throw new UnauthorizedException("Invalid reset token");
        }
    }

    /* ================== INVALIDATE ================== */

    public void invalidate(String token) {
        invalidatedTokens.add(token);
    }
}
