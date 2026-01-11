
 package com.example.DocHub.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Base exception for the application.
 * All custom exceptions must extend this.
 */
public abstract class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    protected AppException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    /* ============================
       COMMON APPLICATION EXCEPTIONS
    ============================ */

    public static class ResourceNotFoundException extends AppException {
        public ResourceNotFoundException(String message) {
            super(message, ErrorCode.RESOURCE_NOT_FOUND);
        }
    }

    public static class BadRequestException extends AppException {
        public BadRequestException(String message) {
            super(message, ErrorCode.BAD_REQUEST);
        }
    }

    public static class UnauthorizedException extends AppException {
        public UnauthorizedException(String message) {
            super(message, ErrorCode.UNAUTHORIZED);
        }
    }

    public static class ForbiddenException extends AppException {
        public ForbiddenException(String message) {
            super(message, ErrorCode.FORBIDDEN);
        }
    }

    public static class ConflictException extends AppException {
        public ConflictException(String message) {
            super(message, ErrorCode.CONFLICT);
        }
    }

    public static class TokenException extends AppException {
        public TokenException(String message) {
            super(message, ErrorCode.INVALID_TOKEN);
        }
    }

    public static class OtpExpiredException extends AppException {
        public OtpExpiredException(String message) {
            super(message, ErrorCode.OTP_EXPIRED);
        }
    }

    public static class RateLimitException extends AppException {
        public RateLimitException(String message) {
            super(message, ErrorCode.RATE_LIMIT_EXCEEDED);
        }
    }

    public static class InternalServerError extends AppException {
        public InternalServerError(String message) {
            super(message, ErrorCode.INTERNAL_ERROR);
        }
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "message", "Invalid email or password",
                    "error", "BAD_CREDENTIALS",
                    "status", 401
                ));
    }

    /* ============================
       ERROR CODES ENUM
    ============================ */

    public enum ErrorCode {
        RESOURCE_NOT_FOUND,
        BAD_REQUEST,
        UNAUTHORIZED,
        FORBIDDEN,
        CONFLICT,
        INVALID_TOKEN,
        OTP_EXPIRED,
        RATE_LIMIT_EXCEEDED,
        VALIDATION_ERROR,
        INTERNAL_ERROR
    }
}

