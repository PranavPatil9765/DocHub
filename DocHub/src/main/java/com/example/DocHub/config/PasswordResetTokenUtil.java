package com.example.DocHub.config;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import com.example.DocHub.exception.AppException.UnauthorizedException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class PasswordResetTokenUtil {

    private static final String SECRET = "RESET_SECRET_KEY_CHANGE_ME";
    private static final long EXPIRY_MINUTES = 10;

    public static String generateResetToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("type", "RESET_PASSWORD")
                .setIssuedAt(new Date())
                .setExpiration(
                        Date.from(
                                LocalDateTime
                                .now()
                                        .plusMinutes(EXPIRY_MINUTES)
                                        .atZone(ZoneId.systemDefault())
                                        .toInstant()
                        )
                )
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public String validateAndGetEmail(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();

        if (!"RESET_PASSWORD".equals(claims.get("type"))) {
            throw new UnauthorizedException("Invalid Request");
        }

        return claims.getSubject();
    }

    public void invalidate(String token) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'invalidate'");
    }
}
