package com.example.DocHub.dto.response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ScrollResponse<T>(
        List<T> items,
        boolean hasMore,
        LocalDateTime nextCursorTime,
        UUID nextCursorId
) {}
