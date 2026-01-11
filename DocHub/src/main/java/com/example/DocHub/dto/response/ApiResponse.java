
package com.example.DocHub.dto.response;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data
) {}
