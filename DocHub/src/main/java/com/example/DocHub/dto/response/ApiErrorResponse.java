package com.example.DocHub.dto.response;

public record ApiErrorResponse(
        boolean success,
        String message,
        String errorCode,
        Object details
) {}