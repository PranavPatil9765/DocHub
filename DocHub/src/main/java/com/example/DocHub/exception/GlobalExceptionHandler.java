package com.example.DocHub.exception;

import com.example.DocHub.dto.response.ApiErrorResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(AsyncRequestTimeoutException.class)
        public void handleAsyncTimeout(AsyncRequestTimeoutException ex) {
                // 🚫 DO NOTHING
                // This is NORMAL for SSE connections
        }

        /*
         * ============================
         * HANDLE CUSTOM APP EXCEPTIONS
         * ============================
         */
        @ExceptionHandler(AppException.class)
        public ResponseEntity<ApiErrorResponse> handleAppException(AppException ex) {

                HttpStatus status = switch (ex.getErrorCode()) {
                        case RESOURCE_NOT_FOUND -> HttpStatus.NOT_FOUND;
                        case BAD_REQUEST, VALIDATION_ERROR -> HttpStatus.BAD_REQUEST;
                        case UNAUTHORIZED, INVALID_TOKEN -> HttpStatus.UNAUTHORIZED;
                        case FORBIDDEN -> HttpStatus.FORBIDDEN;
                        case CONFLICT -> HttpStatus.CONFLICT;
                        case RATE_LIMIT_EXCEEDED -> HttpStatus.TOO_MANY_REQUESTS;
                        case OTP_EXPIRED -> HttpStatus.GONE;
                        default -> HttpStatus.INTERNAL_SERVER_ERROR;
                };

                return ResponseEntity.status(status).body(
                                new ApiErrorResponse(
                                                false,
                                                ex.getMessage(),
                                                ex.getErrorCode().name(),
                                                null));
        }

        /*
         * ============================
         * VALIDATION ERRORS
         * ============================
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidationErrors(
                        MethodArgumentNotValidException ex) {

                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getFieldErrors()
                                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));

                return ResponseEntity.badRequest().body(
                                new ApiErrorResponse(
                                                false,
                                                "Validation failed",
                                                AppException.ErrorCode.VALIDATION_ERROR.name(),
                                                errors));
        }

        /*
         * ============================
         * FALLBACK (UNKNOWN ERRORS)
         * ============================
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {

                ex.printStackTrace(); // replace with logger in prod

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                                new ApiErrorResponse(
                                                false,
                                                "Internal server error",
                                                AppException.ErrorCode.INTERNAL_ERROR.name(),
                                                null));
        }
}
